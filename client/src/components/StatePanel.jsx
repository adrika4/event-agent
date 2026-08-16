function currency(n) {
  if (n == null) return '—'
  return `₹${Number(n).toLocaleString('en-IN')}`
}

function BudgetRow({ label, value, total }) {
  const pct = total ? Math.min(100, Math.round((value / total) * 100)) : 0
  return (
    <div className="budget-row">
      <div className="budget-row-top">
        <span>{label}</span>
        <span>{currency(value)}</span>
      </div>
      <div className="budget-bar-track">
        <div className="budget-bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function getStatusBadgeClass(status = 'proposed') {
  const normalized = String(status || 'proposed').trim().toLowerCase()
  if (normalized.includes('confirm')) return 'status-confirmed'
  if (normalized.includes('contact') || normalized.includes('reach')) return 'status-contacted'
  if (normalized.includes('propos') || normalized.includes('pending')) return 'status-proposed'
  if (normalized.includes('declin') || normalized.includes('cancel')) return 'status-declined'
  return 'status-default'
}

export default function StatePanel({ state }) {
  if (!state) {
    return <p className="empty-note">Event details will appear here once planning begins.</p>
  }

  const {
    eventName,
    eventType,
    attendees,
    budget,
    area,
    venue,
    venueOptions = [],
    budgetBreakdown,
    rsvps = [],
    vendors = [],
    expenses = [],
    reminderSchedule,
  } = state

  const rsvpCounts = rsvps.reduce(
    (acc, r) => {
      const key = String(r.status || 'pending').trim().toLowerCase()
      if (key === 'attending') acc.attending += 1
      else if (key === 'not attending' || key === 'declined') acc['not attending'] += 1
      else if (key === 'maybe' || key === 'tentative') acc.maybe += 1
      else acc.pending += 1
      return acc
    },
    { attending: 0, 'not attending': 0, maybe: 0, pending: 0 }
  )

  const expenseTotal = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)

  return (
    <div className="state-panel-content">
      {(eventName || eventType) && (
        <div className="state-block">
          <h3 className="state-block-title">{eventName || 'Untitled event'}</h3>
          <p className="state-subline">
            {[eventType, area, attendees ? `${attendees} guests` : null].filter(Boolean).join(' · ')}
          </p>
          {venue && <p className="state-subline">Venue: {venue}</p>}
        </div>
      )}

      {budgetBreakdown && (
        <div className="state-block">
          <h4 className="state-block-heading">Budget breakdown</h4>
          {Object.entries(budgetBreakdown).map(([k, v]) => (
            <BudgetRow key={k} label={k} value={v} total={budget} />
          ))}
          <p className="state-subline state-subline-right">Total: {currency(budget)}</p>
        </div>
      )}

      {expenses.length > 0 && (
        <div className="state-block">
          <h4 className="state-block-heading">Spend vs budget</h4>
          <BudgetRow label="Spent so far" value={expenseTotal} total={budget} />
        </div>
      )}

      {venueOptions.length > 0 && (
        <div className="state-block">
          <h4 className="state-block-heading">Venue options</h4>
          <div className="venue-grid">
            {venueOptions.map((v, i) => (
              <div key={i} className="venue-card">
                <div className="venue-icon">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="venue-copy">
                  <p className="venue-name">{v.name}</p>
                  <p className="venue-meta">{v.area} · cap {v.capacity} · ₹{v.costPerHead}/head</p>
                  {(v.rating || v.reviewCount || v.vibe) && (
                    <>
                      <p className="venue-meta venue-meta-rating">
                        {v.rating ? `★ ${Number(v.rating).toFixed(1)} (${v.reviewCount ?? 0})` : `(${v.reviewCount ?? 0} reviews)`}
                      </p>
                      {v.vibe && <p className="venue-vibe">{v.vibe}</p>}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {rsvps.length > 0 && (
        <div className="state-block">
          <h4 className="state-block-heading">RSVPs ({rsvps.length})</h4>
          <div className="state-metric-grid">
            <div className="state-metric"><strong>{rsvpCounts.attending}</strong><span>attending</span></div>
            <div className="state-metric"><strong>{rsvpCounts.maybe}</strong><span>maybe</span></div>
            <div className="state-metric"><strong>{rsvpCounts.pending}</strong><span>pending</span></div>
            <div className="state-metric"><strong>{rsvpCounts['not attending']}</strong><span>declined</span></div>
          </div>
          <ul className="state-list guest-list">
            {rsvps.map((guest, i) => (
              <li key={i} className="guest-item">
                <span className="guest-name">{guest.name}</span>
                <span className={`status-badge ${getStatusBadgeClass(guest.status)}`}>
                  {String(guest.status || 'pending').trim()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {vendors.length > 0 && (
        <div className="state-block">
          <h4 className="state-block-heading">Vendors</h4>
          <ul className="state-list vendor-list">
            {vendors.map((v, i) => (
              <li key={i} className="vendor-item">
                <span className="vendor-name">{v.name}</span>
                <span className={`status-badge ${getStatusBadgeClass(v.status)}`}>
                  {v.status || 'proposed'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {reminderSchedule?.schedule?.length > 0 && (
        <div className="state-block">
          <h4 className="state-block-heading">Reminder schedule</h4>
          <ul className="state-list reminder-list">
            {reminderSchedule.schedule.map((r, i) => (
              <li key={i} className={r.isPast ? 'state-list-past' : ''}>
                <span className="reminder-label">{r.label}</span>
                <span className="reminder-date">{r.date}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}