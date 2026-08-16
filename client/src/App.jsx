import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import ActivityFeed from './components/ActivityFeed.jsx'
import StatePanel from './components/StatePanel.jsx'

const API_BASE = 'http://localhost:5000'
const MAX_TURNS = 8

function getOrCreateSessionId() {
  let id = localStorage.getItem('sessionId')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('sessionId', id)
  }
  return id
}

function App() {
  const [sessionId] = useState(getOrCreateSessionId)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const [agentState, setAgentState] = useState(null)
  const [turns, setTurns] = useState([])
  const [feedConnected, setFeedConnected] = useState(false)
  const bottomRef = useRef(null)
  const esRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    fetch(`${API_BASE}/api/state/${sessionId}`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => data && setAgentState(data.state))
      .catch(() => {})

    const es = new EventSource(`${API_BASE}/api/activity/${sessionId}`)
    esRef.current = es

    es.onopen = () => setFeedConnected(true)

    es.onmessage = evt => {
      let payload
      try {
        payload = JSON.parse(evt.data)
      } catch {
        return
      }

      if (payload.type === 'state_update') {
        setAgentState(payload.state)
      }

      setTurns(prev => {
        if (payload.type === 'understanding_request') {
          const next = [...prev, { id: `${Date.now()}-${Math.random()}`, steps: [payload], done: false }]
          return next.slice(-MAX_TURNS)
        }
        if (prev.length === 0) {
          return [{ id: `${Date.now()}-${Math.random()}`, steps: [payload], done: payload.type === 'done' }]
        }
        const last = prev[prev.length - 1]
        const updatedLast = {
          ...last,
          steps: [...last.steps, payload],
          done: payload.type === 'done' ? true : last.done,
        }
        return [...prev.slice(0, -1), updatedLast]
      })
    }

    es.onerror = () => setFeedConnected(false)

    return () => es.close()
  }, [sessionId])

  async function sendMessage(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending) return

    setMessages(prev => [...prev, { role: 'user', text }])
    setInput('')
    setSending(true)
    setError(null)

    try {
      const res = await fetch(`${API_BASE}/api/plan-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId }),
      })

      if (!res.ok) throw new Error(`Server responded ${res.status}`)

      const data = await res.json()
      setMessages(prev => [...prev, { role: 'agent', text: data.reply }])
    } catch (err) {
      console.error(err)
      setError('Something went wrong talking to the agent. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">✦</span>
          <div>
            <h1>Solfinders</h1>
            <p className="brand-sub">Autonomous event planning agent</p>
          </div>
        </div>
        <span className="session-tag">
          {feedConnected ? '● live' : '○ connecting…'} · {sessionId.slice(0, 8)}
        </span>
      </header>

      <div className="app-body">
        <section className="chat-column">
          <div className="message-thread">
            {messages.length === 0 && (
              <p className="empty-note">
                Tell me about the event you're planning — type, date, guest count, budget, location.
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`message message-${m.role}`}>
                <div className="message-bubble">
                  {m.role === 'agent' ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
                  ) : (
                    m.text
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {error && <div className="error-banner">{error}</div>}

          <form className="chat-input-row" onSubmit={sendMessage}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="e.g. Plan a wedding in Rohini"
              disabled={sending}
            />
            <button type="submit" disabled={sending || !input.trim()}>
              {sending ? '…' : 'Send'}
            </button>
          </form>
        </section>

        <section className="activity-column">
          <div className="panel-block">
            <h2>What the agent is doing</h2>
            <ActivityFeed turns={turns} />
          </div>
        </section>

        <section className="state-column">
          <div className="panel-block">
            <h2>Live event state</h2>
            <StatePanel state={agentState} />
          </div>
        </section>
      </div>
    </div>
  )
}

export default App