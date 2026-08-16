const { GoogleGenAI, createPartFromFunctionResponse } = require("@google/genai");
const tools = require("./tools");
const toolDefinitions = require("./toolDefinitions");
const { getState, updateState } = require("./eventStore");
const { checkConsequences } = require("./consequences");
const { emitActivity } = require("./eventEmitter");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Retries a Gemini call on transient 503 "high demand" errors, and logs
// token usage for every successful call.
async function sendWithRetry(chat, messagePayload, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await chat.sendMessage(messagePayload);
      const usage = response.usageMetadata;
      if (usage) {
        console.log(
          `[Gemini tokens] input=${usage.promptTokenCount} output=${usage.candidatesTokenCount} total=${usage.totalTokenCount}`
        );
      }
      return response;
    } catch (err) {
      const is503 = err.status === 503 || /UNAVAILABLE|high demand/i.test(err.message || "");
      if (is503 && attempt < retries) {
        const waitMs = attempt * 1500; // 1.5s, then 3s
        console.log(`Gemini 503 — retrying in ${waitMs}ms (attempt ${attempt}/${retries})`);
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }
      throw err;
    }
  }
}

// Patches persistent state from a tool's REAL return value. Every
// state-affecting tool must have a case here, or its result is never saved.
function applyToolEffect(sessionId, name, args, result) {
  const state = getState(sessionId);
  switch (name) {
    case "setEventDetails": {
      const patch = {};
      if (args.eventName) patch.eventName = args.eventName;
      if (args.eventType) patch.eventType = args.eventType;
      if (args.area) patch.area = args.area;
      if (args.venue) patch.venue = args.venue;
      if (args.eventDate) patch.eventDate = args.eventDate;
      return updateState(sessionId, patch);
    }
    case "calculateBudget":
      return updateState(sessionId, {
        budget: args.totalBudget,
        attendees: args.attendees,
        budgetBreakdown: result.breakdown,
      });
    case "suggestVenues":
      return updateState(sessionId, { venueOptions: result.venues });
    case "getLocationContext":
      return updateState(sessionId, { area: result.area });
    case "generateSchedule":
      return updateState(sessionId, {
        schedule: result.schedule,
        eventType: args.eventType || state.eventType,
      });
    case "sendInvites":
      return updateState(sessionId, {
        communications: [...state.communications, { type: "invite", ...result }],
      });
    case "sendReminder":
      return updateState(sessionId, {
        communications: [...state.communications, { type: "reminder", ...result }],
      });
    case "trackRSVP":
      return updateState(sessionId, { rsvps: result.rsvps });
    case "trackExpense":
      return updateState(sessionId, { expenses: result.expenses });
    case "trackVendor":
      return updateState(sessionId, { vendors: result.vendors });
    case "computeReminderSchedule":
      return updateState(sessionId, { reminderSchedule: result });
    case "adjustLogistics": {
      const patch = {};
      if (result.updatedPlan?.attendees != null) patch.attendees = result.updatedPlan.attendees;
      if (result.updatedPlan?.totalBudget != null) patch.budget = result.updatedPlan.totalBudget;
      if (result.updatedPlan?.area != null) patch.area = result.updatedPlan.area;
      if (result.recalculatedBudget?.breakdown) patch.budgetBreakdown = result.recalculatedBudget.breakdown;
      if (result.updatedVenueOptions?.venues) patch.venueOptions = result.updatedVenueOptions.venues;
      return updateState(sessionId, patch);
    }
    // suggestVendors is read-only (like suggestVenues' original form) — no
    // state to persist, the agent just reports the results.
    default:
      return state;
  }
}

// Some tools should never trust whatever Gemini guesses about "current"
// data (existing RSVPs/expenses/vendors, pending guests, or the current
// plan for adjustLogistics) — that's exactly how duplicates and silent
// overwrites happen. We inject the REAL persisted state as ground truth
// right before the tool runs.
function prepareArgs(sessionId, name, args) {
  const state = getState(sessionId);
  switch (name) {
    case "trackRSVP":
      return { ...args, existingRsvps: state.rsvps };
    case "trackExpense":
      return { ...args, existingExpenses: state.expenses };
    case "trackVendor":
      return { ...args, existingVendors: state.vendors };
    case "sendReminder": {
      const pendingGuests = state.rsvps.filter((r) => r.status === "pending" || r.status === "maybe");
      return { ...args, pendingGuests };
    }
    case "adjustLogistics":
      return {
        ...args,
        currentPlan: {
          totalBudget: state.budget,
          attendees: state.attendees,
          area: state.area,
        },
      };
    default:
      return args;
  }
}

async function runAgent(userMessage, sessionId, onStep = () => {}) {
  const state = getState(sessionId);

  // Every step goes to both the caller's onStep AND the SSE emitter, so a
  // connected frontend's activity panel sees exactly what actually happened.
  const emit = (event) => {
    onStep(event);
    emitActivity(sessionId, event);
  };

  const systemInstruction = `You are the event planning agent for letscelebrate. You are not a plain chatbot — you are an autonomous event-planning agent with real tools that let you take action across a conversation. You maintain event state, make decisions, and carry the plan forward as the user updates details.

What you can do with your tools:
- set and update the event details and location
- calculate and recalculate budgets as guest count or spend changes
- suggest venue and vendor options that match the brief and budget
- get location context from coordinates when needed
- generate event-day schedules and timelines
- track RSVP responses per guest
- track expenses and vendor communication status
- compute reminder dates for the event and send reminder emails only when the user explicitly asks
- send invitations only when the user explicitly asks to email guests

When someone asks who you are or what you can do, answer confidently and specifically in terms of what you actually do in this app. Frame it as actions you take as an agent, not as vague general AI capabilities. You are the operational planner for the event, not just a conversational assistant.

Current known event state:
${JSON.stringify(state, null, 2)}

RULES YOU MUST FOLLOW:
1. You may ONLY say an action was completed (event details saved, budget calculated, venue suggested, RSVP recorded, vendor tracked, reminder schedule generated, email sent, reminder sent) if you actually called the matching tool in this conversation and it succeeded. Never describe something as done if you did not call its tool. If no tool exists for what the user asked (e.g. calling a vendor by phone), say plainly that you can't do that yet — do not pretend.
2. If the user's message asks for several things at once (e.g. "track this RSVP, add this expense, and suggest a vendor"), call ALL of the relevant tools before giving your final answer — do not stop after the first one.
3. Use the current event state above to understand follow-up requests (e.g. a changed headcount or budget) without asking the user to repeat information you already have. When the user gives a new absolute number (e.g. "the total is now 70"), pass that number directly to the tool — never do arithmetic yourself.
4. If a tool result includes a "_systemNotes" field listing conflicts (e.g. venue too small, budget exceeded), you must address it before your final answer — call the appropriate repair tool (suggestVenues, calculateBudget, adjustLogistics) and explain what changed.
5. Only call sendInvites or sendReminder when the user has explicitly asked you to send an email. Never send email just because an RSVP has an email address on file, and never send reminders automatically.

Be concise, confident, and honest about exactly what happened.`;

  const chat = ai.chats.create({
    model: "gemini-flash-latest",
    config: {
      systemInstruction,
      tools: [{ functionDeclarations: toolDefinitions }],
    },
  });

  emit({ type: "understanding_request", message: userMessage });

  let response = await sendWithRetry(chat, { message: userMessage });
  let loops = 0;

  while (loops < 8) {
    const calls = response.functionCalls;
    if (!calls || calls.length === 0) break; // Gemini decided it's done

    // Run EVERY call this turn — not just the first one. Gemini can and
    // does return multiple function calls in a single turn for compound
    // requests; dropping the rest is what caused actions to be "described"
    // without ever actually running.
    const results = [];
    for (const call of calls) {
      console.log("Agent decided to call:", call.name, call.args);
      emit({ type: "tool_call", name: call.name, args: call.args });

      let toolResult;
      try {
        const preparedArgs = prepareArgs(sessionId, call.name, call.args);
        toolResult = await tools[call.name](preparedArgs);
        applyToolEffect(sessionId, call.name, preparedArgs, toolResult);
      } catch (err) {
        toolResult = { error: err.message };
      }

      emit({ type: "tool_result", name: call.name, result: toolResult });
      results.push({ call, toolResult });
    }

    // Deterministic conflict check, run AFTER all of this turn's tools have
    // been applied, against the real persisted state.
    const conflictCheck = checkConsequences(getState(sessionId));
    if (conflictCheck.conflicts.length > 0) {
      emit({ type: "conflict_detected", conflicts: conflictCheck.conflicts });
      results[results.length - 1].toolResult._systemNotes = conflictCheck.conflicts;
    }

    emit({ type: "state_update", state: getState(sessionId) });

    const responseParts = results.map(({ call, toolResult }) =>
      createPartFromFunctionResponse(call.id, call.name, { result: toolResult })
    );

    response = await sendWithRetry(chat, { message: responseParts });
    loops++;
  }

  emit({ type: "done" });
  return response.text;
}

module.exports = { runAgent };