import { useState, useEffect, useRef } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

const INVESTIGATION = {
  id: "INV-0041",
  title: "Warehouse West — Conveyor Failure",
};

const DAYS = [
  {
    day: 1,
    evidence: [
      { id: "e1", type: "image", label: "Conveyor belt photo", file: "IMG_4821.jpg" },
      { id: "e2", type: "doc",   label: "Maintenance log",     file: "maint_log_oct.pdf" },
      { id: "e3", type: "audio", label: "Floor alarm recording", file: "alarm_091214.wav" },
    ],
    events: [
      { id: "v1", time: "09:12", severity: "warn", label: "Abnormal vibration detected on Conveyor A", sources: ["IMG_4821.jpg", "maint_log_oct.pdf"] },
      { id: "v2", time: "09:14", severity: "crit", label: "Warning alarm triggered — zone W3",          sources: ["alarm_091214.wav"] },
      { id: "v3", time: "09:17", severity: "crit", label: "Emergency shutdown — Conveyor A halted",     sources: ["maint_log_oct.pdf"] },
      { id: "v4", time: "09:28", severity: "info", label: "Maintenance request filed — ticket #MR-1142", sources: ["maint_log_oct.pdf"] },
      { id: "v5", time: "09:41", severity: "ok",   label: "Supervisor notified — J. Okafor on-site",   sources: ["maint_log_oct.pdf"] },
    ],
    model: {
      confidence: 61,
      entities: 9,
      eventsCount: 5,
      openQs: 3,
      conflicts: 1,
      known: [
        "Conveyor A failed at 09:17",
        "Alarm triggered 2 min prior",
      ],
      likely: [
        "Bearing failure — primary cause",
        "Vibration preceded shutdown",
      ],
      open: [
        "Last maintenance date unknown",
        "Root cause unconfirmed",
        "Load at time of failure?",
      ],
      conflicts_list: [
        "Log shows shutdown at 09:17 — alarm record suggests 09:19",
      ],
      entities_list: [
        { type: "object",   name: "Conveyor A" },
        { type: "person",   name: "J. Okafor" },
        { type: "location", name: "Warehouse West W3" },
        { type: "ticket",   name: "MR-1142" },
      ],
    },
  },
  {
    day: 2,
    evidence: [
      { id: "e4", type: "email", label: "Operator report", file: "okafor_report.eml" },
      { id: "e5", type: "doc",   label: "Parts inventory",  file: "parts_inv_w3.pdf" },
    ],
    events: [
      { id: "v6", time: "11:04", severity: "info", label: "J. Okafor confirmed: bearing housing cracked", sources: ["okafor_report.eml"] },
      { id: "v7", time: "11:09", severity: "warn", label: "Bearing last replaced 14 months ago — overdue", sources: ["parts_inv_w3.pdf"] },
      { id: "v8", time: "11:22", severity: "ok",   label: "Replacement part ordered — ETA 48h",           sources: ["parts_inv_w3.pdf"] },
    ],
    model: {
      confidence: 84,
      entities: 13,
      eventsCount: 8,
      openQs: 1,
      conflicts: 0,
      known: [
        "Conveyor A failed at 09:17",
        "Alarm triggered 2 min prior",
        "Bearing housing confirmed cracked",
        "Bearing overdue for replacement by 2 months",
      ],
      likely: [
        "Fatigue failure from deferred maintenance",
        "Load spike accelerated failure",
      ],
      open: [
        "Load telemetry at 09:12 unavailable",
      ],
      conflicts_list: [],
      entities_list: [
        { type: "object",   name: "Conveyor A" },
        { type: "person",   name: "J. Okafor" },
        { type: "location", name: "Warehouse West W3" },
        { type: "ticket",   name: "MR-1142" },
        { type: "part",     name: "Bearing housing #BH-44" },
        { type: "vendor",   name: "Delta Parts Co." },
      ],
    },
  },
  {
    day: 3,
    evidence: [
      { id: "e6", type: "image", label: "Post-repair inspection photo", file: "repair_final.jpg" },
      { id: "e7", type: "doc",   label: "Root cause report",            file: "rca_mv1142.pdf" },
    ],
    events: [
      { id: "v9",  time: "14:30", severity: "ok",   label: "Replacement bearing installed — Conveyor A",  sources: ["repair_final.jpg"] },
      { id: "v10", time: "14:55", severity: "ok",   label: "Test run completed — no anomalies detected",  sources: ["repair_final.jpg"] },
      { id: "v11", time: "15:10", severity: "info", label: "RCA filed: deferred maintenance root cause",   sources: ["rca_mv1142.pdf"] },
      { id: "v12", time: "15:15", severity: "ok",   label: "Conveyor A returned to service",              sources: ["rca_mv1142.pdf"] },
    ],
    model: {
      confidence: 97,
      entities: 15,
      eventsCount: 12,
      openQs: 0,
      conflicts: 0,
      known: [
        "Conveyor A failed at 09:17 due to cracked bearing",
        "Bearing overdue for replacement by 2 months",
        "Fatigue failure confirmed in RCA",
        "Repair completed — Conveyor A operational",
      ],
      likely: [],
      open: [],
      conflicts_list: [],
      entities_list: [
        { type: "object",   name: "Conveyor A" },
        { type: "person",   name: "J. Okafor" },
        { type: "location", name: "Warehouse West W3" },
        { type: "ticket",   name: "MR-1142" },
        { type: "part",     name: "Bearing housing #BH-44" },
        { type: "vendor",   name: "Delta Parts Co." },
        { type: "doc",      name: "RCA Report MR-1142" },
      ],
    },
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function useCountUp(target, duration = 600) {
  const [value, setValue] = useState(target);
  const prev = useRef(target);

  useEffect(() => {
    const start = prev.current;
    const diff = target - start;
    if (diff === 0) return;
    const startTime = performance.now();
    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(start + diff * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    prev.current = target;
  }, [target, duration]);

  return value;
}

const SEVERITY_COLOR = {
  warn: "#c8923a",
  crit: "#c85a5a",
  info: "#5a8cc8",
  ok:   "#5aaa6e",
};

const EVIDENCE_ICONS = {
  image: "ti-photo",
  doc:   "ti-file-text",
  audio: "ti-volume",
  email: "ti-mail",
};

const EVIDENCE_BG = {
  image: { bg: "#1a1510", color: "#8c6a40" },
  doc:   { bg: "#101418", color: "#3d6b8a" },
  audio: { bg: "#101510", color: "#3a6b45" },
  email: { bg: "#151018", color: "#5a3d8a" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function PulsingDot() {
  return (
    <span style={{
      display: "inline-block", width: 6, height: 6, borderRadius: "50%",
      background: "#4a8c5c", animation: "mosaic-pulse 2s ease-in-out infinite",
    }} />
  );
}

function LogoMark() {
  const colors = ["#e8e0d0", "#6b5f4a", "#a08060", "#e8e0d0"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, width: 18, height: 18 }}>
      {colors.map((c, i) => (
        <span key={i} style={{ background: c, borderRadius: 1, display: "block" }} />
      ))}
    </div>
  );
}

function EvidenceItem({ item, active, dim }) {
  const ic = EVIDENCE_ICONS[item.type] || "ti-file";
  const col = EVIDENCE_BG[item.type] || EVIDENCE_BG.doc;
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 8,
      padding: "8px 10px", borderRadius: 6,
      border: `1px solid ${active ? "#3a3228" : "#1e1e1e"}`,
      background: active ? "#161410" : "#111",
      opacity: dim ? 0.4 : 1,
      transition: "opacity 0.4s ease, border-color 0.3s ease",
      cursor: dim ? "default" : "pointer",
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: 4, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: col.bg, color: col.color, fontSize: 12, marginTop: 1,
      }}>
        <i className={`ti ${ic}`} aria-hidden="true" />
      </div>
      <div>
        <div style={{ fontSize: 11, color: dim ? "#555" : "#aaa", lineHeight: 1.4 }}>{item.label}</div>
        <div style={{ fontSize: 10, color: "#444", fontFamily: "monospace", marginTop: 2 }}>{item.file}</div>
      </div>
    </div>
  );
}

function TimelineEvent({ event, isNew }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "52px 1fr", gap: 12,
      paddingBottom: 14,
      animation: isNew ? "mosaic-fadein 0.5s ease" : "none",
    }}>
      <div style={{ fontSize: 10, color: "#555", fontFamily: "monospace", paddingTop: 2, textAlign: "right" }}>
        {event.time}
      </div>
      <div style={{ borderLeft: "1px solid #222", paddingLeft: 12, position: "relative" }}>
        <div style={{
          width: 6, height: 6, borderRadius: "50%",
          background: SEVERITY_COLOR[event.severity],
          position: "absolute", left: -3.5, top: 5,
        }} />
        <div style={{ fontSize: 12, color: "#ccc", lineHeight: 1.4 }}>{event.label}</div>
        <div style={{ fontSize: 10, color: "#444", fontFamily: "monospace", marginTop: 3 }}>
          src: {event.sources.join(" · ")}
        </div>
      </div>
    </div>
  );
}

function ConfidenceBar({ value }) {
  const animated = useCountUp(value, 700);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 3, background: "#1a1a1a", borderRadius: 2, overflow: "hidden" }}>
        <div style={{
          height: "100%", background: "#6b5f4a", borderRadius: 2,
          width: `${animated}%`, transition: "width 0.7s cubic-bezier(0.4,0,0.2,1)",
        }} />
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#c8b89a", fontFamily: "monospace", minWidth: 36, textAlign: "right" }}>
        {animated}%
      </div>
    </div>
  );
}

function StatGrid({ model }) {
  const entities    = useCountUp(model.entities, 500);
  const eventsCount = useCountUp(model.eventsCount, 500);
  const openQs      = useCountUp(model.openQs, 500);
  const conflicts   = useCountUp(model.conflicts, 500);

  const cells = [
    { val: entities,    lbl: "Entities" },
    { val: eventsCount, lbl: "Events" },
    { val: openQs,      lbl: "Open Qs" },
    { val: conflicts,   lbl: "Conflicts" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
      {cells.map(({ val, lbl }) => (
        <div key={lbl} style={{
          background: "#111", border: "1px solid #1a1a1a",
          borderRadius: 5, padding: "6px 8px",
        }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#ccc", fontFamily: "monospace" }}>{val}</div>
          <div style={{ fontSize: 9, color: "#444", marginTop: 1, letterSpacing: "0.06em", textTransform: "uppercase" }}>{lbl}</div>
        </div>
      ))}
    </div>
  );
}

function RSection({ label, children }) {
  return (
    <div style={{ padding: "10px 14px", borderBottom: "1px solid #161616" }}>
      <div style={{ fontSize: 9, letterSpacing: "0.12em", color: "#444", fontFamily: "monospace", textTransform: "uppercase", marginBottom: 8 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function ItemList({ items, variant }) {
  const styles = {
    known:    { bg: "#0e120e", border: "#2a4a2e" },
    likely:   { bg: "#120f0a", border: "#4a3a1a" },
    open:     { bg: "#111",    border: "#2a2a2a" },
    conflict: { bg: "#120a0a", border: "#4a1a1a" },
  };
  const s = styles[variant] || styles.open;
  if (!items || items.length === 0) return (
    <div style={{ fontSize: 10, color: "#333", fontFamily: "monospace" }}>— none</div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {items.map((item, i) => (
        <div key={i} style={{
          fontSize: variant === "conflict" ? 10 : 11,
          color: variant === "conflict" ? "#6b3a3a" : "#888",
          padding: "5px 8px",
          background: s.bg, borderRadius: 4,
          borderLeft: `2px solid ${s.border}`,
          lineHeight: 1.4,
          fontFamily: variant === "conflict" ? "monospace" : "inherit",
          animation: "mosaic-fadein 0.4s ease",
        }}>
          {item}
        </div>
      ))}
    </div>
  );
}

function EntityList({ entities }) {
  return (
    <div>
      {entities.map((e, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "4px 0",
          borderBottom: i < entities.length - 1 ? "1px solid #151515" : "none",
          animation: "mosaic-fadein 0.4s ease",
        }}>
          <div style={{ fontSize: 9, fontFamily: "monospace", color: "#333", width: 44, flexShrink: 0 }}>
            {e.type}
          </div>
          <div style={{ fontSize: 11, color: "#999" }}>{e.name}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Mosaic() {
  const [activeDay, setActiveDay] = useState(0);
  const [visibleEvents, setVisibleEvents] = useState([]);
  const [newEventIds, setNewEventIds] = useState(new Set());

  const currentDayData = DAYS[activeDay];

  // Accumulate all evidence and events up to current day
  const allEvidence = DAYS.slice(0, activeDay + 1).flatMap(d => d.evidence);
  const futureEvidence = DAYS.slice(activeDay + 1).flatMap(d => d.evidence);
  const allEvents = DAYS.slice(0, activeDay + 1).flatMap(d => d.events);

  useEffect(() => {
    const incoming = allEvents.filter(e => !visibleEvents.find(v => v.id === e.id));
    if (incoming.length > 0) {
      const ids = new Set(incoming.map(e => e.id));
      setNewEventIds(ids);
      setVisibleEvents(allEvents);
      const timer = setTimeout(() => setNewEventIds(new Set()), 800);
      return () => clearTimeout(timer);
    }
  }, [activeDay]);

  // Init
  useEffect(() => {
    setVisibleEvents(DAYS[0].events);
  }, []);

  const model = currentDayData.model;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Syne:wght@400;500;600&display=swap');
        @keyframes mosaic-pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
        @keyframes mosaic-fadein { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:none} }
        .mosaic-day-pill { transition: background 0.2s, border-color 0.2s, color 0.2s; }
        .mosaic-day-pill:hover { border-color: #3a3228 !important; color: #888 !important; }
        .mosaic-add-btn:hover { background: #1a1610 !important; }
        .mosaic-ev:hover { border-color: #2a2520 !important; }
      `}</style>

      <div style={{
        background: "#0e0e0e",
        borderRadius: 12,
        overflow: "hidden",
        fontFamily: "'Syne', sans-serif",
        border: "1px solid #1e1e1e",
        display: "flex",
        flexDirection: "column",
        minHeight: 540,
        fontSize: 13,
      }}>

        {/* Top bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 16px", borderBottom: "1px solid #1e1e1e",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <LogoMark />
            <span style={{ fontSize: 15, fontWeight: 600, color: "#e8e0d0", letterSpacing: "0.04em" }}>
              Mosaic
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "#555", fontFamily: "monospace" }}>
            <span style={{ color: "#6b5f4a" }}>{INVESTIGATION.id}</span>
            <span>·</span>
            <span>{INVESTIGATION.title}</span>
            <span>·</span>
            <PulsingDot />
            <span style={{ color: "#4a8c5c" }}>active</span>
          </div>
          <div style={{ fontSize: 11, color: "#333", fontFamily: "monospace" }}>
            day {activeDay + 1} of {DAYS.length}
          </div>
        </div>

        {/* Body */}
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 220px", flex: 1, minHeight: 0 }}>

          {/* Evidence column */}
          <div style={{ borderRight: "1px solid #1a1a1a", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "10px 14px 8px", fontSize: 9, letterSpacing: "0.12em", color: "#444", fontFamily: "monospace", borderBottom: "1px solid #161616", textTransform: "uppercase" }}>
              Evidence
            </div>
            <div style={{ padding: "10px 10px", display: "flex", flexDirection: "column", gap: 6, overflowY: "auto" }}>
              {DAYS.slice(0, activeDay + 1).map((d, di) => (
                <div key={d.day}>
                  <div style={{ fontSize: 9, color: "#333", fontFamily: "monospace", letterSpacing: "0.1em", padding: "6px 10px 2px", textTransform: "uppercase" }}>
                    Day {d.day}
                  </div>
                  {d.evidence.map(item => (
                    <div key={item.id} className="mosaic-ev" style={{ marginBottom: 6 }}>
                      <EvidenceItem item={item} active={di === activeDay} dim={false} />
                    </div>
                  ))}
                </div>
              ))}
              {futureEvidence.length > 0 && (
                <>
                  <div style={{ fontSize: 9, color: "#2a2a2a", fontFamily: "monospace", letterSpacing: "0.1em", padding: "6px 10px 2px", textTransform: "uppercase" }}>
                    Day {activeDay + 2}
                  </div>
                  {futureEvidence.slice(0, 2).map(item => (
                    <div key={item.id} style={{ marginBottom: 6 }}>
                      <EvidenceItem item={item} active={false} dim={true} />
                    </div>
                  ))}
                </>
              )}
              {activeDay < DAYS.length - 1 && (
                <div style={{
                  margin: "4px 0", padding: "7px 10px",
                  border: "1px dashed #252525", borderRadius: 6,
                  fontSize: 11, color: "#333", textAlign: "center",
                  cursor: "pointer", fontFamily: "monospace",
                }}>
                  + add evidence
                </div>
              )}
            </div>
          </div>

          {/* Timeline column */}
          <div style={{ borderRight: "1px solid #1a1a1a", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "10px 14px 8px", fontSize: 9, letterSpacing: "0.12em", color: "#444", fontFamily: "monospace", borderBottom: "1px solid #161616", textTransform: "uppercase" }}>
              Event timeline
            </div>
            <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", overflowY: "auto" }}>
              {visibleEvents.map(event => (
                <TimelineEvent key={event.id} event={event} isNew={newEventIds.has(event.id)} />
              ))}
            </div>
          </div>

          {/* Situation model column */}
          <div style={{ display: "flex", flexDirection: "column", overflowY: "auto" }}>
            <div style={{ padding: "10px 14px 8px", fontSize: 9, letterSpacing: "0.12em", color: "#444", fontFamily: "monospace", borderBottom: "1px solid #161616", textTransform: "uppercase" }}>
              Situation model
            </div>

            <RSection label="Confidence">
              <ConfidenceBar value={model.confidence} />
            </RSection>

            <RSection label="Stats">
              <StatGrid model={model} />
            </RSection>

            <RSection label="Known">
              <ItemList items={model.known} variant="known" />
            </RSection>

            <RSection label="Likely">
              <ItemList items={model.likely} variant="likely" />
            </RSection>

            <RSection label="Open questions">
              <ItemList items={model.open} variant="open" />
            </RSection>

            {model.conflicts_list.length > 0 && (
              <RSection label="Conflicts">
                <ItemList items={model.conflicts_list} variant="conflict" />
              </RSection>
            )}

            <RSection label="Entities">
              <EntityList entities={model.entities_list} />
            </RSection>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          padding: "8px 16px", borderTop: "1px solid #1a1a1a",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "#0c0c0c",
        }}>
          <div style={{ display: "flex", gap: 6 }}>
            {DAYS.map((d, i) => (
              <button
                key={d.day}
                className="mosaic-day-pill"
                onClick={() => setActiveDay(i)}
                style={{
                  fontSize: 10, fontFamily: "monospace",
                  padding: "4px 10px", borderRadius: 4,
                  border: `1px solid ${i === activeDay ? "#3a3228" : "#222"}`,
                  color: i === activeDay ? "#c8b89a" : "#444",
                  background: i === activeDay ? "#1a1610" : "transparent",
                  cursor: "pointer",
                }}
              >
                Day {d.day}
              </button>
            ))}
          </div>

          {activeDay < DAYS.length - 1 ? (
            <button
              className="mosaic-add-btn"
              onClick={() => setActiveDay(prev => Math.min(prev + 1, DAYS.length - 1))}
              style={{
                fontSize: 11, fontFamily: "monospace",
                padding: "5px 12px", borderRadius: 4,
                border: "1px solid #2a2520", color: "#6b5f4a",
                cursor: "pointer", background: "transparent",
              }}
            >
              + add day {activeDay + 2} evidence ↗
            </button>
          ) : (
            <div style={{ fontSize: 10, color: "#3a6b45", fontFamily: "monospace" }}>
              ✓ investigation complete
            </div>
          )}
        </div>
      </div>
    </>
  );
}