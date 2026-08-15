require("dotenv").config();
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const { runAgent } = require("./agent");
const { getState, resetState } = require("./eventStore");
const { getEmitter } = require("./eventEmitter");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/plan-event", async (req, res) => {
  try {
    const { message, sessionId: incomingSessionId } = req.body;
    const sessionId = incomingSessionId || crypto.randomUUID();

    const reply = await runAgent(message, sessionId);
    res.json({ reply, sessionId });
  } catch (err) {
    console.error(err);
    const isQuotaError = /429|quota/i.test(err.message || "");
    const isUnavailable = /503|unavailable/i.test(err.message || "");
    const friendlyMessage = isQuotaError
      ? "AI service is temporarily rate-limited. Please try again shortly."
      : isUnavailable
      ? "AI service is temporarily unavailable. Please try again in a moment."
      : "Something went wrong planning your event. Please try again.";
    res.status(500).json({ error: friendlyMessage });
  }
});

app.get("/api/state/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  if (!sessionId) return res.status(400).json({ error: "sessionId is required" });
  const state = getState(sessionId);
  res.json({ sessionId, state });
});

app.post("/api/reset", (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: "sessionId is required" });
  const state = resetState(sessionId);
  res.json({ sessionId, state });
});

app.get("/api/activity/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const emitter = getEmitter(sessionId);
  const listener = (event) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };
  emitter.on("activity", listener);

  req.on("close", () => {
    emitter.off("activity", listener);
  });
});

app.listen(5000, () => console.log("Agent server on :5000"));