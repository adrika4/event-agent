import { useState } from 'react'

const TYPE_META = {
  understanding_request: { label: 'Reading request', tone: 'neutral' },
  tool_call: { label: 'Calling tool', tone: 'action' },
  tool_result: { label: 'Tool responded', tone: 'action' },
  conflict_detected: { label: 'Conflict detected', tone: 'warning' },
  state_update: { label: 'State updated', tone: 'success' },
  done: { label: 'Turn complete', tone: 'success' },
}

function summarizeResult(result) {
  if (result == null) return 'no data returned'
  if (typeof result === 'string') return result.slice(0, 140)
  if (Array.isArray(result)) return `${result.length} item(s) returned`
  const keys = Object.keys(result)
  return keys
    .slice(0, 4)
    .map(k => `${k}: ${JSON.stringify(result[k])}`)
    .join(', ')
    .slice(0, 160)
}

// Is the current turn inside a conflict -> repair sequence right now?
function isLooping(turn) {
  if (!turn || turn.done) return false
  let looping = false
  for (const step of turn.steps) {
    if (step.type === 'conflict_detected') looping = true
    if (step.type === 'state_update' || step.type === 'done') looping = false
  }
  return looping
}

function getPhase(turns) {
  if (turns.length === 0) return { label: 'Waiting for your first message', tone: 'idle', looping: false }
  const last = turns[turns.length - 1]
  const looping = isLooping(last)
  if (last.done) return { label: 'Ready for the next message', tone: 'idle', looping: false }

  const lastStep = last.steps[last.steps.length - 1]
  if (looping) {
    if (lastStep.type === 'conflict_detected') {
      return { label: 'Conflict found — looping back to repair the plan', tone: 'warning', looping: true }
    }
    if (lastStep.type === 'tool_call') {
      return { label: `Repairing: running ${lastStep.name}`, tone: 'warning', looping: true }
    }
    return { label: 'Repairing the plan', tone: 'warning', looping: true }
  }
  if (lastStep.type === 'understanding_request') return { label: 'Reading your request', tone: 'thinking', looping: false }
  if (lastStep.type === 'tool_call') return { label: `Running ${lastStep.name}`, tone: 'acting', looping: false }
  if (lastStep.type === 'tool_result') return { label: 'Reviewing what came back', tone: 'thinking', looping: false }
  if (lastStep.type === 'state_update') return { label: 'Saving the updated plan', tone: 'acting', looping: false }
  return { label: 'Working', tone: 'thinking', looping: false }
}

function StepBody({ step }) {
  switch (step.type) {
    case 'understanding_request':
      return <p className="step-detail">&ldquo;{step.message}&rdquo;</p>
    case 'tool_call':
      return (
        <>
          <p className="step-tool-name">{step.name}</p>
          {step.args && Object.keys(step.args).length > 0 && (
            <pre className="step-args">{JSON.stringify(step.args)}</pre>
          )}
        </>
      )
    case 'tool_result':
      return (
        <>
          <p className="step-tool-name">{step.name}</p>
          <p className="step-detail">{summarizeResult(step.result)}</p>
        </>
      )
    case 'conflict_detected':
      return (
        <ul className="step-conflicts">
          {(step.conflicts || []).map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      )
    case 'state_update':
      return <p className="step-detail">Persisted state refreshed.</p>
    case 'done':
      return <p className="step-detail">Ready for the next message.</p>
    default:
      return null
  }
}

function Turn({ turn, isLatest }) {
  let inRepair = false
  return (
    <div className={`turn ${isLatest ? 'turn-latest' : ''}`}>
      <div className="turn-line" />
      <div className="turn-steps">
        {turn.steps.map((step, i) => {
          const meta = TYPE_META[step.type] || { label: step.type, tone: 'neutral' }
          const isActiveTip = isLatest && !turn.done && i === turn.steps.length - 1
          const showRepairBadge = step.type === 'tool_call' && inRepair
          if (step.type === 'conflict_detected') inRepair = true
          if (step.type === 'state_update' || step.type === 'done') inRepair = false

          return (
            <div
              key={i}
              className={`step step-${meta.tone} ${isActiveTip ? 'step-active' : ''} ${
                showRepairBadge ? 'step-repair' : ''
              }`}
            >
              <span className="step-dot">{isActiveTip && <span className="step-dot-ring" />}</span>
              <div className="step-content">
                <span className="step-label">
                  {meta.label}
                  {showRepairBadge && <span className="repair-badge">↻ repair loop</span>}
                </span>
                <StepBody step={step} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function pastTurnSummary(turn) {
  const hadConflict = turn.steps.some(s => s.type === 'conflict_detected')
  const toolCalls = turn.steps.filter(s => s.type === 'tool_call').length
  const firstMsg = turn.steps.find(s => s.type === 'understanding_request')?.message || 'Turn'
  return {
    title: firstMsg.length > 60 ? firstMsg.slice(0, 60) + '…' : firstMsg,
    tag: hadConflict ? 'conflict repaired' : `${toolCalls} tool call${toolCalls === 1 ? '' : 's'}`,
    warned: hadConflict,
  }
}

export default function ActivityFeed({ turns }) {
  const [expanded, setExpanded] = useState(() => new Set())
  const phase = getPhase(turns)
  const currentTurn = turns[turns.length - 1]
  const pastTurns = turns.slice(0, -1)

  function toggle(id) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="activity-feed-wrap">
      <div className={`phase-hero phase-${phase.tone}`}>
        <span className={`phase-hero-icon ${phase.looping ? 'phase-hero-icon-loop' : ''}`}>
          {phase.looping ? '↻' : phase.tone === 'idle' ? '✓' : '✦'}
        </span>
        <div className="phase-hero-text">
          <span className="phase-hero-label">{phase.label}</span>
          {phase.tone !== 'idle' && (
            <span className="phase-hero-sub">
              live
              <span className="phase-dots">
                <span />
                <span />
                <span />
              </span>
            </span>
          )}
        </div>
      </div>

      {!currentTurn && (
        <p className="empty-note">
          The agent's live reasoning will appear here the moment you send a message.
        </p>
      )}

      {currentTurn && <Turn turn={currentTurn} isLatest />}

      {pastTurns.length > 0 && (
        <div className="past-turns">
          <p className="past-turns-heading">Earlier this session</p>
          {pastTurns
            .slice()
            .reverse()
            .map(turn => {
              const summary = pastTurnSummary(turn)
              const isOpen = expanded.has(turn.id)
              return (
                <div key={turn.id} className="past-turn">
                  <button className="past-turn-toggle" onClick={() => toggle(turn.id)}>
                    <span className={`past-turn-tag ${summary.warned ? 'past-turn-tag-warned' : ''}`}>
                      {summary.tag}
                    </span>
                    <span className="past-turn-title">{summary.title}</span>
                    <span className="past-turn-chevron">{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && <Turn turn={turn} isLatest={false} />}
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}