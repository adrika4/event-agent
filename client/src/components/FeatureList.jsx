import React, { useState } from "react";
import {
  MapPin,
  Wallet,
  Users,
  Handshake,
  BellRing,
  CalendarClock,
  Activity,
  ChevronDown,
} from "lucide-react";

const FEATURES = [
  {
    icon: MapPin,
    title: "Venue matching",
    description:
      "Suggests venues within budget and area, with capacity, price per head, and ratings pulled in for comparison.",
  },
  {
    icon: Wallet,
    title: "Budget intelligence",
    description:
      "Breaks total spend down by category and auto-recalculates the moment headcount or budget changes.",
  },
  {
    icon: Users,
    title: "RSVP tracking",
    description:
      "Keeps a running count of confirmed, pending, and declined guests as responses come in.",
  },
  {
    icon: Handshake,
    title: "Vendor coordination",
    description:
      "Logs contact status per vendor — reached out, confirmed, awaiting reply — so nothing falls through.",
  },
  {
    icon: BellRing,
    title: "Smart reminders",
    description:
      "Drafts reminder messages for guests and vendors as the date nears, ready to review and send.",
  },
  {
    icon: CalendarClock,
    title: "Event timeline",
    description:
      "Builds out a day-of and lead-up schedule so every task has a slot before the event.",
  },
  {
    icon: Activity,
    title: "Live agent activity",
    description:
      "Every tool call and decision streams in real time, so you can see exactly how the plan came together.",
  },
];

const styles = {
  wrapper: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    padding: "12px 16px 0",
    boxSizing: "border-box",
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  panel: {
    width: "100%",
    maxWidth: "1100px",
    background: "#15100b",
    border: "1px solid rgba(201, 162, 74, 0.2)",
    borderRadius: "14px",
    overflow: "hidden",
    boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
  },
  toggle: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    padding: "14px 18px",
    background: "#1a130d",
    border: "none",
    color: "#f5efe0",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    textAlign: "left",
  },
  toggleLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: "#d5b874",
  },
  content: {
    padding: "0 18px 18px",
    background: "#15100b",
  },
  eyebrow: {
    fontSize: "12px",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#a6957a",
    marginBottom: "0.5rem",
    fontWeight: 500,
  },
  heading: {
    fontFamily: "Georgia, 'Playfair Display', serif",
    fontSize: "28px",
    color: "#f5efe0",
    margin: "0 0 1.25rem 0",
    fontWeight: 400,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1rem",
  },
  card: {
    background: "#1e1710",
    border: "1px solid rgba(201, 162, 74, 0.2)",
    borderRadius: "10px",
    padding: "1.25rem",
  },
  iconWrap: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    background: "rgba(201, 162, 74, 0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "0.85rem",
  },
  cardTitle: {
    fontSize: "15px",
    fontWeight: 600,
    color: "#f5efe0",
    margin: "0 0 0.4rem 0",
  },
  cardDesc: {
    fontSize: "13.5px",
    lineHeight: 1.5,
    color: "#a6957a",
    margin: 0,
  },
};

export default function FeatureList() {
  const [open, setOpen] = useState(false);

  return (
    <div style={styles.wrapper}>
      <div style={styles.panel}>
        <button
          type="button"
          style={styles.toggle}
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
        >
          <span style={styles.toggleLabel}>
            <Activity size={15} color="#d5b874" />
            Features
          </span>
          <ChevronDown
            size={18}
            color="#f5efe0"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}
          />
        </button>

        {open && (
          <div style={styles.content}>
            <p style={styles.eyebrow}>What this agent can do</p>
            <h2 style={styles.heading}>Capabilities</h2>
            <div style={styles.grid}>
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <div key={title} style={styles.card}>
                  <div style={styles.iconWrap}>
                    <Icon size={18} color="#caa034" strokeWidth={1.75} />
                  </div>
                  <p style={styles.cardTitle}>{title}</p>
                  <p style={styles.cardDesc}>{description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}