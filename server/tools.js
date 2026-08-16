const nodemailer = require("nodemailer");
const { suggestVendors } = require("./vendors");

const VENUES = [
  {
    name: "Dwarka Community Hall",
    area: "Dwarka",
    capacity: 150,
    costPerHead: 800,
    rating: 4.1,
    reviewCount: 186,
    vibe: "Budget-friendly hall with practical layouts for neighborhood ceremonies.",
  },
  {
    name: "Saket Banquet Lawns",
    area: "Saket",
    capacity: 300,
    costPerHead: 1200,
    rating: 4.3,
    reviewCount: 512,
    vibe: "Open-lawn format with dependable banquet flow for medium-large gatherings.",
  },
  {
    name: "Rohini Party Palace",
    area: "Rohini",
    capacity: 100,
    costPerHead: 600,
    rating: 3.9,
    reviewCount: 227,
    vibe: "Compact and affordable for birthdays, engagements, and close family events.",
  },
  {
    name: "CP Rooftop Venue",
    area: "Connaught Place",
    capacity: 80,
    costPerHead: 1500,
    rating: 4.2,
    reviewCount: 341,
    vibe: "Central skyline setting best for stylish evening socials and launches.",
  },
  {
    name: "Vasant Kunj Garden Venue",
    area: "Vasant Kunj",
    capacity: 200,
    costPerHead: 950,
    rating: 4.2,
    reviewCount: 294,
    vibe: "Green outdoor ambiance with smooth guest circulation for daytime functions.",
  },
  {
    name: "Suraya Garden Banquet",
    area: "Dwarka",
    capacity: 400,
    costPerHead: 1100,
    rating: 4.4,
    reviewCount: 768,
    vibe: "Large-format banquet known for lively wedding nights and reliable service.",
  },
  {
    name: "The Claridges Lawn",
    area: "Lutyens Delhi",
    capacity: 250,
    costPerHead: 2500,
    rating: 4.7,
    reviewCount: 689,
    vibe: "Premium heritage lawn with polished execution for high-touch celebrations.",
  },
  {
    name: "Chattarpur Farms & Lawns",
    area: "Chattarpur",
    capacity: 600,
    costPerHead: 1400,
    rating: 4.5,
    reviewCount: 944,
    vibe: "Sprawling farm-style venue ideal for big baraat entries and multi-stage events.",
  },
  {
    name: "Punjabi Bagh Club",
    area: "Punjabi Bagh",
    capacity: 350,
    costPerHead: 1300,
    rating: 4.3,
    reviewCount: 601,
    vibe: "Club-style banquet with energetic atmosphere and consistently praised food.",
  },
  {
    name: "Mayur Banquets",
    area: "Mayur Vihar",
    capacity: 180,
    costPerHead: 750,
    rating: 4.0,
    reviewCount: 258,
    vibe: "Value banquet with straightforward packages and responsive on-ground staff.",
  },
  {
    name: "Greater Kailash Celebration Hall",
    area: "Greater Kailash",
    capacity: 120,
    costPerHead: 1600,
    rating: 4.4,
    reviewCount: 333,
    vibe: "Upscale indoor hall that suits intimate, design-forward city events.",
  },
  {
    name: "Alipur Luxury Farmhouse",
    area: "Alipur",
    capacity: 800,
    costPerHead: 1800,
    rating: 4.6,
    reviewCount: 421,
    vibe: "Destination-style farmhouse with scale for grand weddings and receptions.",
  },
  {
    name: "Omnia by Tivoli Dwarka",
    area: "Dwarka",
    capacity: 450,
    costPerHead: 1700,
    rating: 4.5,
    reviewCount: 395,
    vibe: "Grand premium entrance with strong catering, popular for weddings and corporate events.",
  },
  {
    name: "ELATE By DROOL",
    area: "Dwarka",
    capacity: 250,
    costPerHead: 1350,
    rating: 4.5,
    reviewCount: 674,
    vibe: "Fits 100-250 guests, known for good food and hands-on coordinators.",
  },
  {
    name: "Ambria Exotica",
    area: "Dwarka",
    capacity: 350,
    costPerHead: 1800,
    rating: 4.6,
    reviewCount: 278,
    vibe: "High-end wedding venue, strong on decor and attentive staff.",
  },
  {
    name: "Ambria Pushpanjali",
    area: "Dwarka",
    capacity: 600,
    costPerHead: 1600,
    rating: 4.4,
    reviewCount: 2038,
    vibe: "Large and photogenic with strong food, guests report it's tricky to locate.",
  },
  {
    name: "Regalia Eden",
    area: "Dwarka",
    capacity: 150,
    costPerHead: 1200,
    rating: 4.2,
    reviewCount: 1712,
    vibe: "Comfortable for 100-150 guests, food well-reviewed, cleanliness feedback mixed.",
  },
  {
    name: "Devam Palace Banquet",
    area: "Dwarka",
    capacity: 220,
    costPerHead: 1000,
    rating: 4.3,
    reviewCount: 143,
    vibe: "Decor and staff praised, food quality reviews inconsistent.",
  },
  {
    name: "Shree Manglam Banquet & Lawn",
    area: "Dwarka",
    capacity: 140,
    costPerHead: 900,
    rating: 4.9,
    reviewCount: 39,
    vibe: "Small review sample but consistently praised for family functions.",
  },
];

function calculateBudget({ totalBudget, attendees }) {
  const perHead = totalBudget / attendees;
  return {
    totalBudget,
    attendees,
    perHead: Math.round(perHead),
    breakdown: {
      venue: Math.round(totalBudget * 0.4),
      catering: Math.round(totalBudget * 0.3),
      decor: Math.round(totalBudget * 0.15),
      entertainment: Math.round(totalBudget * 0.1),
      contingency: Math.round(totalBudget * 0.05),
    },
  };
}

function suggestVenues({ budget, attendees, area }) {
  const perHeadBudget = budget / attendees;
  const matches = VENUES.filter((v) => {
    const capacityOk = v.capacity >= attendees;
    const budgetOk = v.costPerHead <= perHeadBudget;
    const areaOk = !area || v.area.toLowerCase().includes(area.toLowerCase());
    return capacityOk && budgetOk && areaOk;
  });

  return {
    query: { budget, attendees, area: area || "any" },
    matchCount: matches.length,
    venues: matches.length > 0 ? matches : VENUES.filter((v) => v.capacity >= attendees).slice(0, 3),
    note:
      matches.length === 0
        ? "No exact matches on budget/area - showing closest capacity matches instead."
        : undefined,
  };
}

async function getLocationContext({ latitude, longitude }) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
  const res = await fetch(url, {
    headers: { "User-Agent": "event-agent-hackathon-demo/1.0" },
  });
  if (!res.ok) {
    throw new Error(`Nominatim request failed: ${res.status}`);
  }
  const data = await res.json();
  const address = data.address || {};
  const area =
    address.suburb || address.neighbourhood || address.city_district || address.city || address.town || "your area";

  return { latitude, longitude, area, raw: address };
}

function generateSchedule({ eventType, startTime, endTime }) {
  const blocks = [
    { label: "Setup & Arrival", pct: 0.1 },
    { label: `${eventType} - Opening`, pct: 0.15 },
    { label: `${eventType} - Main Program`, pct: 0.5 },
    { label: "Food & Networking", pct: 0.2 },
    { label: "Wrap-up", pct: 0.05 },
  ];

  function parseTimeToDate(value) {
    const raw = String(value || "").trim();

    const ampmMatch = raw.match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])$/);
    if (ampmMatch) {
      let hours = Number(ampmMatch[1]);
      const minutes = Number(ampmMatch[2]);
      const period = ampmMatch[3].toUpperCase();
      if (hours >= 1 && hours <= 12 && minutes >= 0 && minutes <= 59) {
        if (period === "AM") {
          if (hours === 12) hours = 0;
        } else if (hours !== 12) {
          hours += 12;
        }
        return new Date(1970, 0, 1, hours, minutes, 0, 0);
      }
    }

    const twentyFourMatch = raw.match(/^(\d{1,2}):(\d{2})$/);
    if (twentyFourMatch) {
      const hours = Number(twentyFourMatch[1]);
      const minutes = Number(twentyFourMatch[2]);
      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        return new Date(1970, 0, 1, hours, minutes, 0, 0);
      }
    }

    return new Date(NaN);
  }

  const start = parseTimeToDate(startTime);
  const end = parseTimeToDate(endTime);
  const totalMs = end - start;

  let cursor = start;
  const schedule = blocks.map((b) => {
    const durationMs = totalMs * b.pct;
    const blockStart = new Date(cursor);
    cursor = new Date(cursor.getTime() + durationMs);
    return {
      label: b.label,
      start: blockStart.toTimeString().slice(0, 5),
      end: cursor.toTimeString().slice(0, 5),
    };
  });

  return { eventType, startTime, endTime, schedule };
}

async function sendInvites({ emails, eventName, eventDate, venue }) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const results = [];
  for (const email of emails) {
    try {
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: email,
        subject: `You're invited: ${eventName}`,
        text: `You're invited to ${eventName} on ${eventDate} at ${venue}.`,
      });
      results.push({ email, status: "sent" });
    } catch (err) {
      results.push({ email, status: "failed", error: err.message });
    }
  }

  return { eventName, eventDate, venue, results };
}

async function sendReminder({ pendingGuests, eventName, eventDate }) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  });

  const results = [];
  for (const guest of pendingGuests) {
    if (!guest.email) {
      results.push({ name: guest.name, status: "missing_email" });
      continue;
    }
    try {
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: guest.email,
        subject: `RSVP Reminder: ${eventName}`,
        text: `Hi ${guest.name}, just a friendly reminder to RSVP for ${eventName} on ${eventDate}. Let us know if you can make it!`,
      });
      results.push({ name: guest.name, email: guest.email, status: "sent" });
    } catch (err) {
      results.push({ name: guest.name, email: guest.email, status: "failed", error: err.message });
    }
  }

  return { eventName, eventDate, results };
}

function adjustLogistics({ changedField, newValue, currentPlan }) {
  const updatedPlan = { ...currentPlan, [changedField]: newValue };
  const newBudget = calculateBudget({
    totalBudget: updatedPlan.totalBudget,
    attendees: updatedPlan.attendees,
  });
  const newVenues = suggestVenues({
    budget: updatedPlan.totalBudget,
    attendees: updatedPlan.attendees,
    area: updatedPlan.area,
  });

  return { changedField, newValue, updatedPlan, recalculatedBudget: newBudget, updatedVenueOptions: newVenues };
}

function setEventDetails({ eventName, eventType, area, venue, eventDate }) {
  return {
    eventName: eventName ?? null,
    eventType: eventType ?? null,
    area: area ?? null,
    venue: venue ?? null,
    eventDate: eventDate ?? null,
  };
}

function normalizeRsvpStatus(raw) {
  const s = (raw || "").toLowerCase().trim();
  if (["attending", "yes", "confirmed", "accepted"].includes(s)) return "attending";
  if (["not attending", "no", "declined", "decline"].includes(s)) return "not attending";
  if (["maybe", "tentative", "pending", "unsure"].includes(s)) return "maybe";
  return s || "pending";
}

function trackRSVP({ existingRsvps = [], name, status, email }) {
  if (!name) throw new Error("trackRSVP requires a guest name");
  const normalizedStatus = normalizeRsvpStatus(status);
  const idx = existingRsvps.findIndex((r) => r.name.toLowerCase() === name.toLowerCase());

  let rsvps;
  let action;
  if (idx >= 0) {
    rsvps = [...existingRsvps];
    rsvps[idx] = {
      ...rsvps[idx],
      status: normalizedStatus,
      email: email || rsvps[idx].email || null,
    };
    action = "updated";
  } else {
    rsvps = [...existingRsvps, { name, status: normalizedStatus, email: email || null }];
    action = "added";
  }

  const summary = {
    total: rsvps.length,
    attending: rsvps.filter((r) => r.status === "attending").length,
    notAttending: rsvps.filter((r) => r.status === "not attending").length,
    maybe: rsvps.filter((r) => r.status === "maybe").length,
    attendingEmails: rsvps.filter((r) => r.status === "attending" && r.email).map((r) => r.email),
  };

  return { action, rsvp: rsvps[idx >= 0 ? idx : rsvps.length - 1], rsvps, summary };
}

function trackExpense({ existingExpenses = [], amount, category, description, vendor, date }) {
  if (amount == null || !category) throw new Error("trackExpense requires amount and category");
  const expense = {
    id: `exp_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    amount: Number(amount),
    category,
    description: description || "",
    vendor: vendor || null,
    date: date || null,
  };
  const expenses = [...existingExpenses, expense];
  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  return { expense, expenses, totalExpenses };
}

function trackVendor({ existingVendors = [], name, category, contact, estimatedCost, status, notes }) {
  if (!name || !category) throw new Error("trackVendor requires name and category");
  const idx = existingVendors.findIndex(
    (v) => v.name.toLowerCase() === name.toLowerCase() && v.category.toLowerCase() === category.toLowerCase()
  );

  let vendors;
  let action;
  const vendorData = {
    name,
    category,
    contact: contact || null,
    estimatedCost: estimatedCost != null ? Number(estimatedCost) : null,
    status: status || "proposed",
    notes: notes || null,
  };

  if (idx >= 0) {
    vendors = [...existingVendors];
    vendors[idx] = { ...vendors[idx], ...vendorData };
    action = "updated";
  } else {
    vendors = [...existingVendors, vendorData];
    action = "added";
  }

  return { action, vendor: vendors[idx >= 0 ? idx : vendors.length - 1], vendors };
}

// Deterministic reminder-date calculation relative to eventDate. Pure
// function, no side effects — does NOT send anything. Sending still goes
// through the existing sendReminder tool, only on explicit user request.
function computeReminderSchedule({ eventDate }) {
  if (!eventDate) throw new Error("computeReminderSchedule requires eventDate");

  const event = new Date(eventDate);
  if (isNaN(event.getTime())) {
    throw new Error(`computeReminderSchedule: "${eventDate}" is not a valid date`);
  }

  const now = new Date();

  // Offsets are easy to find/tune here — not buried in logic elsewhere.
  const OFFSETS = [
    { label: "RSVP reminder", daysBeforeEvent: 14 },
    { label: "Vendor confirmation reminder", daysBeforeEvent: 7 },
    { label: "Final reminder", daysBeforeEvent: 3 },
  ];

  const schedule = OFFSETS.map(({ label, daysBeforeEvent }) => {
    const date = new Date(event);
    date.setDate(date.getDate() - daysBeforeEvent);
    return {
      label,
      daysBeforeEvent,
      date: date.toISOString().slice(0, 10),
      isPast: date < now,
    };
  });

  return { eventDate, schedule };
}

module.exports = {
  calculateBudget,
  suggestVenues,
  getLocationContext,
  generateSchedule,
  sendInvites,
  sendReminder,
  adjustLogistics,
  setEventDetails,
  trackRSVP,
  trackExpense,
  trackVendor,
  suggestVendors,
  computeReminderSchedule,
};