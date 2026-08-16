# event-agent
# letscelebrate — Autonomous Event Planning Agent

letscelebrate turns a single natural-language request — *"plan a 100-person wedding in Dwarka"* — into a fully executed event plan. It's not a chatbot that describes what a plan could look like: it's an agent that calls real tools, persists state across the conversation, and takes real actions like sending invite emails.

Built for Track 06 (AI Event Planning Agent).

## What it actually does

- **Venue matching** — suggests real venues within budget and area, with capacity, price per head, ratings, and review context
- **Budget intelligence** — breaks total spend into venue / catering / decor / entertainment / contingency, and auto-recalculates the moment guest count or budget changes
- **RSVP tracking** — tracks guests as attending / not attending / maybe, with live counts
- **Vendor coordination** — logs contact status per vendor (proposed / contacted / confirmed)
- **Real reminders and invites** — sends actual emails via Gmail, not drafts
- **Reminder scheduling** — computes RSVP, vendor-confirmation, and final reminder dates counting down to the event
- **Event timeline** — generates a day-of schedule from a start and end time
- **Live activity feed** — every tool call and result streams to the UI in real time via Server-Sent Events, so the agent's reasoning is auditable, not a black box

## Why this is an agent, not just an LLM

A plain LLM chat produces text — it can describe a plausible budget but can't verify a venue fits your headcount, can't remember an invite it "sent" three messages ago, and can't literally send an email. This system:

1. **Calls real tools** — Gemini is given a defined set of callable functions and decides which to invoke and in what order; each call executes real backend code
2. **Maintains state across the conversation** — the event's details, budget, RSVPs, and vendor statuses persist per session, not per message
3. **Takes actions with real side effects** — invites and reminders are genuinely delivered through Gmail
4. **Is auditable** — the live activity stream shows every tool call and result as it happens, not just a final answer to trust blindly

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), custom CSS, `EventSource` for live activity streaming |
| Backend | Node.js, Express, Server-Sent Events |
| AI / orchestration | Google Gemini with function calling (tool use) |
| State | Per-session persisted store (`eventStore.js`) + event emitter for activity logs |
| Email | Nodemailer + Gmail (real delivery, app password auth) |
| Data | Curated venue dataset enriched with real ratings/review context |

## Architecture

```
User message
   │
   ▼
React frontend (client/)
   │  POST /api/plan-event
   ▼
Express backend (server/index.js)
   │  hands message + tool definitions to Gemini
   ▼
agent.js  ──►  Gemini decides which tools to call
   │
   ▼
tools.js  ──►  real logic executes (budget, venues, RSVPs, email, ...)
   │
   ▼
eventStore.js  ──►  persisted state updated
   │
   ├──► GET /api/activity/:sessionId (SSE)  ──►  live activity feed in UI
   └──► state ──►  live event-state panel in UI
```

## Project structure

```
event-agent/
├── client/                    React + Vite frontend
│   ├── src/
│   │   ├── App.jsx            Chat UI, session handling, API calls
│   │   ├── App.css            Theme, layout, fonts
│   │   ├── components/
│   │   │   ├── ActivityFeed.jsx   Live "what the agent is doing" stream
│   │   │   ├── StatePanel.jsx     Live event state: budget, venues, RSVPs, vendors, reminders
│   │   │   └── FeatureList.jsx    Capability overview, shown as a dropdown card
│   │   └── main.jsx
│   └── package.json
└── server/                    Express backend
    ├── index.js                API routes + server startup
    ├── agent.js                Gemini orchestration / tool dispatch
    ├── tools.js                Tool implementations (budget, venues, RSVPs, email, ...)
    ├── toolDefinitions.js      Function declarations exposed to the model
    ├── eventStore.js           Per-session persisted state
    ├── eventEmitter.js         Live activity event emission
    ├── consequences.js         Post-tool-call conflict detection
    ├── vendors.js               Vendor dataset
    ├── .env                    Local secrets (never committed)
    └── package.json
```

## API

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/plan-event` | Send a user message, get the agent's response for a session |
| `GET` | `/api/state/:sessionId` | Current event state for a session |
| `POST` | `/api/reset` | Reset a session's state |
| `GET` | `/api/activity/:sessionId` | SSE stream of live tool-call activity |

## Setup

### 1. Clone and install

```bash
git clone https://github.com/<your-username>/event-agent.git
cd event-agent

cd client && npm install
cd ../server && npm install
```

### 2. Configure environment variables

Create `server/.env` (this file is gitignored — never commit it):

```
GEMINI_API_KEY=your_gemini_api_key
GMAIL_USER=your_gmail_address@gmail.com
GMAIL_APP_PASSWORD=your_16_character_app_password
PORT=5000
```

`GMAIL_APP_PASSWORD` must be a Google **app password**, not your normal Gmail password — generate one at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) (requires 2-Step Verification to be enabled).

### 3. Run locally

```bash
# terminal 1
cd server && node index.js

# terminal 2
cd client && npm run dev
```

The frontend runs on `http://localhost:5173` (or the port Vite assigns) and talks to the backend on `http://localhost:5000`.

## Deployment

- **Backend** → deploy `server/` on [Render](https://render.com) (Web Service, root directory `server`, start command `node index.js`), with the same environment variables set in Render's dashboard
- **Frontend** → deploy `client/` on [Vercel](https://vercel.com) (root directory `client`, Vite auto-detected), with `VITE_API_URL` pointing at the live Render URL

## Security notes

- `server/.env` is gitignored — never commit real API keys or app passwords
- If a key is ever exposed (screenshot, commit, shared terminal), rotate it immediately at its source (Google AI Studio for `GEMINI_API_KEY`, Google Account app passwords for `GMAIL_APP_PASSWORD`)

## License

Built for hackathon submission purposes.
