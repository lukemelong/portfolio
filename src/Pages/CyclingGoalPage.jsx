import { useState, useEffect, useCallback } from "react";

// ─── CONFIG ────────────────────────────────────────────────────────────────────
const CONFIG = {
  // In development, this proxies through Vite to avoid CORS issues.
  // In production, it calls the live Cloudflare Worker directly.
WORKER_URL: process.env.NODE_ENV === 'development'
  ? '/api/strava-token'
  : 'https://rapid-cake-da77.lukemelong.workers.dev',
  GOAL_KM: 1500,
  START_DATE: new Date("2026-04-01T00:00:00"),
  END_DATE: new Date("2026-08-28T23:59:59"),
};

// ─── STRAVA API HELPERS ────────────────────────────────────────────────────────
async function getAccessToken() {
  const res = await fetch(CONFIG.WORKER_URL);
  if (!res.ok) throw new Error("Could not reach token service");
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.access_token;
}

async function fetchAllRides(accessToken) {
  const rides = [];
  let page = 1;
  const after = Math.floor(CONFIG.START_DATE.getTime() / 1000);
  const before = Math.floor(CONFIG.END_DATE.getTime() / 1000);

  while (true) {
    const res = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?after=${after}&before=${before}&per_page=200&page=${page}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!res.ok) throw new Error("Failed to fetch activities");
    const batch = await res.json();
    if (!batch.length) break;

    const cycling = batch.filter((a) =>
      ["Ride", "VirtualRide", "MountainBikeRide", "GravelRide", "EBikeRide"].includes(
        a.sport_type
      )
    );
    rides.push(...cycling);
    if (batch.length < 200) break;
    page++;
  }

  return rides;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function totalKm(rides) {
  return rides.reduce((sum, r) => sum + r.distance / 1000, 0);
}

function daysBetween(a, b) {
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

function formatDate(d) {
  return d.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

// ─── PAGE COMPONENT ───────────────────────────────────────────────────────────
export default function CyclingGoalPage() {
  const [status, setStatus] = useState("loading");
  const [km, setKm] = useState(0);
  const [rides, setRides] = useState([]);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const token = await getAccessToken();
      const data = await fetchAllRides(token);
      setRides(data);
      setKm(totalKm(data));
      setLastFetched(new Date());
      setStatus("success");
      setTimeout(() => setRevealed(true), 100);
    } catch (e) {
      setError(e.message);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const goal = CONFIG.GOAL_KM;
  const pct = Math.min((km / goal) * 100, 100);
  const today = new Date();
  const totalDays = daysBetween(CONFIG.START_DATE, CONFIG.END_DATE);
  const daysElapsed = Math.max(0, Math.min(daysBetween(CONFIG.START_DATE, today), totalDays));
  const daysLeft = Math.max(0, daysBetween(today, CONFIG.END_DATE));
  const timePct = Math.min((daysElapsed / totalDays) * 100, 100);
  const remaining = Math.max(0, goal - km);

  // Weekly calculations — count partial last week as full week
  const totalWeeks = Math.ceil(totalDays / 7);
  const weeklyGoal = goal / totalWeeks;
  const weeksElapsed = daysElapsed / 7;
  const weeksLeft = daysLeft / 7;
  const weeklyPace = weeksElapsed > 0 ? km / weeksElapsed : 0;
  const projectedKm = weeklyPace * totalWeeks;
  const neededPerWeek = weeksLeft > 0 ? remaining / weeksLeft : 0;
  const expectedKmByNow = weeklyGoal * weeksElapsed;
  const kmBehindPace = Math.max(0, expectedKmByNow - km);
  const pacePct = Math.min((projectedKm / goal) * 100, 100);
  const onPacePct = Math.min((expectedKmByNow / goal) * 100, 100)

  // Three pace states based on how far behind expected pace
  // green: within 1 week's worth of KMs (on pace or ahead)
  // orange: between 1 and 2 weeks behind
  // red: more than 2 weeks behind
  const paceState = kmBehindPace <= 0 ? "on-track"
    : kmBehindPace <= weeklyGoal ? "close"
    : "behind";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;600;700;800;900&family=Barlow:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #0a0a0a;
          color: #e8e8e8;
          font-family: 'Barlow', sans-serif;
          min-height: 100vh;
        }

        .page {
          min-height: 100vh;
          display: grid;
          grid-template-rows: 1fr auto;
          background: #0a0a0a;
          position: relative;
          overflow: hidden;
        }

        /* Subtle grid texture */
        .page::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
          z-index: 0;
        }

        /* Orange glow blob */
        .glow {
          position: fixed;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(252,76,2,0.08) 0%, transparent 70%);
          top: -100px;
          right: -100px;
          pointer-events: none;
          z-index: 0;
        }

        /* ── NAV ── */
        .nav {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 40px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .nav-logo {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 800;
          font-size: 18px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #e8e8e8;
          text-decoration: none;
        }

        .nav-logo span { color: #fc4c02; }

        .nav-back {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #555;
          text-decoration: none;
          transition: color 0.2s;
          font-family: 'Barlow Condensed', sans-serif;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .nav-back:hover { color: #e8e8e8; }

        /* ── MAIN ── */
        .main {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          padding: 60px 64px;
          gap: 64px;
          min-height: calc(100vh - 72px);
        }

        /* ── HERO TEXT ── */
        .hero {
          text-align: left;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }

        .hero.visible { opacity: 1; transform: translateY(0); }

        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #fc4c02;
          margin-bottom: 16px;
        }

        .hero-eyebrow-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #fc4c02;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        .hero-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: clamp(52px, 10vw, 96px);
          font-weight: 900;
          line-height: 0.9;
          letter-spacing: -0.02em;
          text-transform: uppercase;
          color: #e8e8e8;
          margin-bottom: 16px;
        }

        .hero-title span { color: #fc4c02; }

        .hero-sub {
          font-size: 15px;
          color: #444;
          font-weight: 300;
          letter-spacing: 0.02em;
        }

        /* ── CARD ── */
        .card {
          width: 100%;
          max-width: 560px;
          background: #111;
          border: 1px solid #1e1e1e;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03);
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s;
        }

        .card.visible { opacity: 1; transform: translateY(0); }

        /* ── ERROR ── */
        .error-box {
          background: rgba(229,57,53,0.08);
          border: 1px solid rgba(229,57,53,0.2);
          border-radius: 10px;
          padding: 14px 16px;
          color: #ff6b6b;
          font-size: 13px;
          margin-bottom: 28px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .error-hint { color: #444; font-size: 11px; }

        /* ── BIG NUMBER ── */
        .big-stat { margin-bottom: 32px; }

        .km-group {
          display: flex;
          align-items: baseline;
          gap: 8px;
          line-height: 1;
        }

        .km-number {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 88px;
          font-weight: 900;
          color: #e8e8e8;
          letter-spacing: -0.03em;
          font-variant-numeric: tabular-nums;
          line-height: 1;
        }

        .km-unit {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 32px;
          font-weight: 300;
          color: #333;
        }

        .km-goal {
          display: block;
          font-size: 13px;
          color: #333;
          margin-top: 6px;
          font-weight: 300;
          letter-spacing: 0.04em;
        }

        /* ── PROGRESS BAR ── */
        .bar-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .bar-label {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #333;
        }

        .bar-outer {
          position: relative;
          height: 10px;
          background: #1a1a1a;
          border-radius: 100px;
          overflow: visible;
          margin-top: 36px;
          margin-bottom: 8px;
        }

        .bar-inner {
          height: 100%;
          border-radius: 100px;
          transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          z-index: 2;
        }

        .bar-inner.on-track {
          background: linear-gradient(90deg, #166a34, #22c55e, #4ade80);
          box-shadow: 0 0 20px rgba(34,197,94,0.3);
        }

        .bar-inner.close {
          background: linear-gradient(90deg, #c43800, #fc4c02, #ff7b42);
          box-shadow: 0 0 20px rgba(252,76,2,0.3);
        }

        .bar-inner.behind {
          background: linear-gradient(90deg, #991111, #e53935);
        }

        /* Progress tip marker — sits at end of filled bar */
        .progress-marker {
          position: absolute;
          top: -20px;
          transform: translateX(-50%);
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          pointer-events: none;
        }

        .progress-marker-label {
          position: absolute;
          top: -18px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          white-space: nowrap;
          font-family: 'Barlow Condensed', sans-serif;
        }

        .progress-marker-label.on-track  { color: #22c55e; }
        .progress-marker-label.close     { color: #fc4c02; }
        .progress-marker-label.behind    { color: #e53935; }

        .progress-marker-line {
          width: 1px;
          height: 30px;
          background: rgba(255,255,255,0.15);
        }

        /* Expected pace marker */
        .pace-marker {
          position: absolute;
          top: -20px;
          transform: translateX(-50%);
          z-index: 9;
          display: flex;
          flex-direction: column;
          align-items: center;
          pointer-events: none;
        }

        .pace-marker-label {
          position: absolute;
          top: -18px;
          font-size: 9px;
          color: #3a3a3a;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          white-space: nowrap;
          font-family: 'Barlow Condensed', sans-serif;
        }

        .pace-marker-line {
          width: 1px;
          height: 30px;
          background: #2a2a2a;
        }

        /* ── STATUS ROW ── */
        .status-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
          margin-top: 6px;
        }

        .pct-badge {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.08em;
          padding: 4px 12px;
          border-radius: 100px;
          color: #fff;
        }

        .pct-badge.on-track { background: #22c55e; }
        .pct-badge.close { background: #fc4c02; }
        .pct-badge.behind { background: #e53935; }

        .track-status {
          font-size: 12px;
          color: #333;
          font-weight: 300;
        }

        /* ── DIVIDER ── */
        .divider {
          height: 1px;
          background: #1a1a1a;
          margin-bottom: 28px;
        }

        /* ── STATS GRID ── */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 3px;
          margin-bottom: 28px;
        }

        .stat-card {
          background: #141414;
          border-radius: 10px;
          padding: 16px 14px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .stat-label {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 10px;
          font-weight: 600;
          color: #2e2e2e;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }

        .stat-value {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: #e8e8e8;
          letter-spacing: -0.01em;
          font-variant-numeric: tabular-nums;
        }

        .stat-value.accent-on-track { color: #22c55e; }
        .stat-value.accent-close { color: #fc4c02; }
        .stat-value.accent-behind { color: #e53935; }

        /* ── FOOTER ROW ── */
        .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .strava-badge {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 11px;
          color: #2a2a2a;
          font-family: 'Barlow Condensed', sans-serif;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .refresh-btn {
          background: #161616;
          border: 1px solid #1e1e1e;
          border-radius: 8px;
          color: #333;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: color 0.2s, border-color 0.2s;
        }

        .refresh-btn:hover { color: #888; border-color: #333; }
        .refresh-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        /* ── FOOTER ── */
        .page-footer {
          position: relative;
          z-index: 10;
          text-align: center;
          padding: 24px 40px;
          border-top: 1px solid rgba(255,255,255,0.04);
          font-size: 11px;
          color: #222;
          font-family: 'Barlow Condensed', sans-serif;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        /* ── LOADING SKELETON ── */
        .skeleton {
          background: linear-gradient(90deg, #1a1a1a 25%, #222 50%, #1a1a1a 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 6px;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .main {
            grid-template-columns: 1fr;
            padding: 40px 24px;
            gap: 40px;
          }
          .hero { text-align: center; }
        }
        @media (max-width: 600px) {
          .main { padding: 32px 16px; }
          .card { padding: 28px 24px; }
          .km-number { font-size: 68px; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
        .back-btn {
          position: fixed;
          top: 20px;
          left: 24px;
          z-index: 100;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #161616;
          border: 1px solid #1e1e1e;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          text-decoration: none;
          transition: border-color 0.2s, background 0.2s;
          overflow: hidden;
        }

        .back-btn:hover { background: #1e1e1e; border-color: #333; }

        .back-btn img {
          width: 22px;
          height: 22px;
          object-fit: contain;
        }
      `}</style>

      <div className="page">
        <div className="glow" />

        {/* Back button */}
        <a href="/" className="back-btn" title="Back to home">
          <img src="./logo192.png" alt="Home" />
        </a>

        {/* Main */}
        <main className="main">

          {/* Hero */}
          <div className={`hero ${revealed || status === "error" ? "visible" : ""}`}>
            <div className="hero-eyebrow">
              <div className="hero-eyebrow-dot" />
              2026 Season Goal
            </div>
            <h1 className="hero-title">
              1,500<span>km</span><br />on the bike
            </h1>
            <p className="hero-sub">
              {formatDate(CONFIG.START_DATE)} — {formatDate(CONFIG.END_DATE)}
            </p>
          </div>

          {/* Card */}
          <div className={`card ${revealed || status === "error" ? "visible" : ""}`}>

            {/* Error */}
            {status === "error" && (
              <div className="error-box">
                <span>⚠ {error}</span>
                <span className="error-hint">Could not connect to Strava. Try refreshing.</span>
              </div>
            )}

            {/* Big number */}
            <div className="big-stat">
              <div className="km-group">
                {status === "loading" ? (
                  <div className="skeleton" style={{ width: 200, height: 88 }} />
                ) : (
                  <>
                    <span className="km-number">{km.toFixed(1)}</span>
                    <span className="km-unit">km</span>
                  </>
                )}
              </div>
              <span className="km-goal">of {goal.toLocaleString()} km goal</span>
            </div>

            {/* Bar labels */}
            <div className="bar-label-row">
              <span className="bar-label" style={{ visibility: 'hidden' }}>·</span>
              <span className="bar-label">{goal.toLocaleString()} km</span>
            </div>

            {/* Progress bar */}
            <div className="bar-outer">
              {/* Expected pace marker */}
              {status === "success" && (
                <div className="pace-marker" style={{ left: `${onPacePct}%` }}>
                  <span className="pace-marker-label">Expected Pace</span>
                  <div className="pace-marker-line" />
                </div>
              )}
              {/* Actual progress marker */}
              {status === "success" && pct > 0 && (
                <div className="progress-marker" style={{ left: `${pct}%` }}>
                  <span className={`progress-marker-label ${paceState}`}>
                    {paceState === "on-track" ? "Ahead of Pace" : paceState === "close" ? "On Pace" : "Behind Pace"}
                  </span>
                  <div className="progress-marker-line" />
                </div>
              )}
              <div
                className={`bar-inner ${paceState}`}
                style={{ width: status === "success" ? `${pct}%` : "0%" }}
              />
            </div>

            {/* Status */}
            <div className="status-row">
              <span className={`pct-badge ${paceState}`}>
                {status === "success" ? `${pct.toFixed(1)}%` : "—"}
              </span>
              <span className="track-status">
                {status === "success"
                  ? paceState === "on-track"
                    ? `On pace · projected ${projectedKm.toFixed(0)} km`
                    : paceState === "close"
                    ? `Slightly behind · projected ${projectedKm.toFixed(0)} km`
                    : `Behind pace · projected ${projectedKm.toFixed(0)} km`
                  : "Loading…"}
              </span>
            </div>

            <div className="divider" />

            {/* Stats grid */}
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-label">Remaining</span>
                <span className="stat-value">
                  {status === "success" ? `${remaining.toFixed(0)}` : "—"}
                  <span style={{ fontSize: 13, color: "#333", fontWeight: 400 }}> km</span>
                </span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Days Left</span>
                <span className="stat-value">{daysLeft}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Rides</span>
                <span className="stat-value">{status === "success" ? rides.length : "—"}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Weekly Pace</span>
                <span className="stat-value">
                  {status === "success" ? weeklyPace.toFixed(1) : "—"}
                  <span style={{ fontSize: 13, color: "#333", fontWeight: 400 }}> km</span>
                </span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Need/Week</span>
                <span className={`stat-value ${status === "success" ? `accent-${paceState}` : ""}`}>
                  {status === "success" ? neededPerWeek.toFixed(1) : "—"}
                  <span style={{ fontSize: 13, color: "#333", fontWeight: 400 }}> km</span>
                </span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Behind Pace</span>
                <span className={`stat-value ${status === "success" ? `accent-${paceState}` : ""}`}>
                  {status === "success" ? `${kmBehindPace.toFixed(0)}` : "—"}
                  <span style={{ fontSize: 13, color: "#333", fontWeight: 400 }}> km</span>
                </span>
              </div>
            </div>

            {/* Card footer */}
            <div className="card-footer">
              <div className="strava-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066z" fill="#FC4C02"/>
                  <path d="M11.216 6.285L7.689 13.828H4.623L11.216 0l6.593 13.828h-3.065z" fill="#FC4C02" opacity="0.5"/>
                </svg>
                via Strava
                {lastFetched && (
                  <span style={{ color: "#1e1e1e" }}>
                    · {lastFetched.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
              </div>
              <button
                className="refresh-btn"
                onClick={load}
                disabled={status === "loading"}
                title="Refresh data"
              >
                <svg
                  width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round"
                  className={status === "loading" ? "spin" : ""}
                >
                  <polyline points="23 4 23 10 17 10" />
                  <polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
              </button>
            </div>
          </div>
        </main>

        {/* Page footer */}
        <footer className="page-footer">
          lukemelong.com · {new Date().getFullYear()}
        </footer>
      </div>
    </>
  );
}