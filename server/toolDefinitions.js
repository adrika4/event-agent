module.exports = [
  {
    name: "setEventDetails",
    description:
      "Records or updates the event's name, type (e.g. wedding, birthday, conference), and/or a text-based area/location (e.g. 'Dwarka'). Call this as soon as you know any of these. Use this for text locations - only use getLocationContext when you have GPS coordinates.",
    parameters: {
      type: "object",
      properties: {
        eventName: { type: "string" },
        eventType: { type: "string" },
        area: { type: "string" },
        venue: { type: "string" },
        eventDate: { type: "string" },
      },
    },
  },
  {
    name: "calculateBudget",
    description: "Breaks down total event budget into categories",
    parameters: {
      type: "object",
      properties: {
        totalBudget: { type: "number" },
        attendees: { type: "number" },
      },
      required: ["totalBudget", "attendees"],
    },
  },
  {
    name: "suggestVenues",
    description:
      "Finds venues matching budget, headcount, and area. Returned venue objects include name, area, capacity, costPerHead, rating, reviewCount, and vibe.",
    parameters: {
      type: "object",
      properties: {
        budget: { type: "number" },
        attendees: { type: "number" },
        area: { type: "string" },
      },
      required: ["budget", "attendees"],
    },
  },
  {
    name: "getLocationContext",
    description:
      "Converts GPS coordinates into a readable area name. Only use when you actually have latitude/longitude.",
    parameters: {
      type: "object",
      properties: {
        latitude: { type: "number" },
        longitude: { type: "number" },
      },
      required: ["latitude", "longitude"],
    },
  },
  {
    name: "generateSchedule",
    description: "Creates an event timeline",
    parameters: {
      type: "object",
      properties: {
        eventType: { type: "string" },
        startTime: { type: "string", description: "Start time in either 24-hour HH:MM (e.g. '14:00') or 12-hour h:MM AM/PM (e.g. '10:00 AM')." },
        endTime: { type: "string", description: "End time in either 24-hour HH:MM (e.g. '22:00') or 12-hour h:MM AM/PM (e.g. '10:00 PM')." },
      },
      required: ["eventType", "startTime", "endTime"],
    },
  },
  {
    name: "sendInvites",
    description:
      "Sends real email invitations to a list of guest emails via Gmail. ONLY call when the user explicitly asks for an email to be sent.",
    parameters: {
      type: "object",
      properties: {
        emails: { type: "array", items: { type: "string" } },
        eventName: { type: "string" },
        eventDate: { type: "string" },
        venue: { type: "string" },
      },
      required: ["emails", "eventName", "eventDate", "venue"],
    },
  },
  {
    name: "sendReminder",
    description:
      "Sends real RSVP reminder emails to guests still pending. ONLY call when the user explicitly asks for reminders to be sent.",
    parameters: {
      type: "object",
      properties: {
        eventName: { type: "string" },
        eventDate: { type: "string" },
      },
      required: ["eventName", "eventDate"],
    },
  },
  {
    name: "adjustLogistics",
    description:
      "Recalculates budget and venue options after a headcount or budget change. Pass ONLY the changed field and its new absolute value.",
    parameters: {
      type: "object",
      properties: {
        changedField: { type: "string", enum: ["budget", "attendees"] },
        newValue: { type: "number" },
      },
      required: ["changedField", "newValue"],
    },
  },
  {
    name: "trackRSVP",
    description:
      "Records or updates a single guest's RSVP status. Call once per guest mentioned.",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string" },
        status: { type: "string", enum: ["attending", "not attending", "maybe"] },
        email: { type: "string" },
      },
      required: ["name", "status"],
    },
  },
  {
    name: "trackExpense",
    description: "Records a real expense against the event budget.",
    parameters: {
      type: "object",
      properties: {
        amount: { type: "number" },
        category: { type: "string" },
        description: { type: "string" },
        vendor: { type: "string" },
        date: { type: "string" },
      },
      required: ["amount", "category"],
    },
  },
  {
    name: "trackVendor",
    description: "Records or updates a vendor being considered or booked for the event.",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string" },
        category: { type: "string" },
        contact: { type: "string" },
        estimatedCost: { type: "number" },
        status: { type: "string" },
        notes: { type: "string" },
      },
      required: ["name", "category"],
    },
  },
  {
    name: "computeReminderSchedule",
    description:
      "Calculates a real reminder schedule (RSVP reminder, vendor confirmation reminder, final reminder) as concrete dates counting back from the event date. This is READ-ONLY and does NOT send any email by itself — only call sendReminder separately, and only if the user explicitly asks to send one.",
    parameters: {
      type: "object",
      properties: {
        eventDate: { type: "string", description: "The event date, e.g. '2026-09-10' or 'September 10, 2026'." },
      },
      required: ["eventDate"],
    },
  },
  {
    name: "suggestVendors",
    description:
      "Finds vendors from the static dataset filtered by category (catering, photography, decoration, dj, transport), area, and/or max cost.",
    parameters: {
      type: "object",
      properties: {
        category: { type: "string" },
        area: { type: "string" },
        maxCost: { type: "number" },
      },
    },
  },
];