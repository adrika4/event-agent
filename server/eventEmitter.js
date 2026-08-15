const { EventEmitter } = require("events");

const emitters = new Map();

function getEmitter(sessionId) {
  if (!emitters.has(sessionId)) {
    const emitter = new EventEmitter();
    emitter.setMaxListeners(20);
    emitters.set(sessionId, emitter);
  }
  return emitters.get(sessionId);
}

function emitActivity(sessionId, event) {
  getEmitter(sessionId).emit("activity", event);
}

module.exports = { getEmitter, emitActivity };