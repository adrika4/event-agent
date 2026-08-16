// server/eventStore.js

//

// Minimal in-memory session store. No database — state lives only as long

// as the server process runs, which is fine for a hackathon demo (one

// browser tab = one event = one sessionId). Swap the Map for Redis/a real

// DB later if the app needs to survive restarts or serve multiple judges

// concurrently without collisions — it won't for a single demo laptop.




const sessions = new Map();




function defaultState() {

  return {

    eventType: null,

    eventName: null,

    attendees: null,

    budget: null,

    area: null,

    venue: null,

    venueOptions: [],

    budgetBreakdown: null,

    schedule: [],

    rsvps: [],

    vendors: [],

    expenses: [],

    communications: [],

    // Deterministically computed reminder dates relative to eventDate.

    // Informational — does NOT trigger any email send by itself.

    reminderSchedule: null,

  };

}




function getState(sessionId) {

  if (!sessions.has(sessionId)) {

    sessions.set(sessionId, defaultState());

  }

  return sessions.get(sessionId);

}




function updateState(sessionId, patch) {

  const current = getState(sessionId);

  const updated = { ...current, ...patch };

  sessions.set(sessionId, updated);

  return updated;

}




function resetState(sessionId) {

  sessions.set(sessionId, defaultState());

  return sessions.get(sessionId);

}




module.exports = { getState, updateState, resetState };