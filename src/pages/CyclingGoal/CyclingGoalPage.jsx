import { useCallback, useEffect, useState } from 'react';
import styles from './CyclingGoalPage.module.scss';
import { config } from '../../config';
import { getAccessToken, fetchAllRides } from './strava';
import { calcPace, formatDate } from './usePaceCalc';

const PROGRESS_LABEL = {
  'on-track': 'On Pace / Ahead',
  close: 'Slightly Behind',
  slight: 'Slightly Behind',
  behind: 'Behind Pace',
};

const STATUS_PREFIX = {
  'on-track': 'On pace',
  close: 'Slightly behind',
  slight: 'Slightly behind',
  behind: 'Behind pace',
};

function CyclingGoalPage() {
  const [status, setStatus] = useState('loading');
  const [rides, setRides] = useState([]);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const load = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const token = await getAccessToken();
      const data = await fetchAllRides(token);
      setRides(data);
      setLastFetched(new Date());
      setStatus('success');
      setTimeout(() => setRevealed(true), 100);
    } catch (e) {
      setError(e.message);
      setStatus('error');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const pace = calcPace(rides);
  const {
    km, goal, pct, daysLeft, weeklyPace,
    neededPerWeek, projectedKm, kmVsPace, onPacePct,
    paceState, remaining,
  } = pace;

  const isVisible = revealed || status === 'error';
  const accentClass = styles[`accent-${paceState}`];

  return (
    <div className={styles.page}>
      <div className={styles.glow} />

      <a href="/" className={styles['back-btn']} title="Back to home">
        <img src="./logo192.png" alt="Home" />
      </a>

      <main className={styles.main}>
        {/* Hero */}
        <div className={`${styles.hero} ${isVisible ? styles.visible : ''}`}>
          <div className={styles['hero-eyebrow']}>
            <div className={styles['hero-eyebrow-dot']} />
            2026 Season Goal
          </div>
          <h1 className={styles['hero-title']}>
            1,500<span>km</span><br />for the bike
          </h1>
          <p className={styles['hero-sub']}>
            {formatDate(config.strava.startDate)} — {formatDate(config.strava.endDate)}
          </p>
        </div>

        {/* Card */}
        <div className={`${styles.card} ${isVisible ? styles.visible : ''}`}>
          {status === 'error' && (
            <div className={styles['error-box']}>
              <span>⚠ {error}</span>
              <span className={styles['error-hint']}>Could not connect to Strava. Try refreshing.</span>
            </div>
          )}

          {/* Big number */}
          <div className={styles['big-stat']}>
            <div className={styles['km-group']}>
              {status === 'loading' ? (
                <div className={styles.skeleton} style={{ width: 200, height: 88 }} />
              ) : (
                <>
                  <span className={styles['km-number']}>{km.toFixed(1)}</span>
                  <span className={styles['km-unit']}>km</span>
                </>
              )}
            </div>
            <span className={styles['km-goal']}>of {goal.toLocaleString()} km goal</span>
          </div>

          {/* Bar labels */}
          <div className={styles['bar-label-row']}>
            <span className={styles['bar-label']} style={{ visibility: 'hidden' }}>·</span>
            <span className={styles['bar-label']}>{goal.toLocaleString()} km</span>
          </div>

          {/* Progress bar */}
          <div className={styles['bar-section']}>
            {status === 'success' && (
              <div className={styles['pace-marker']} style={{ left: `${onPacePct}%` }}>
                <span className={styles['pace-marker-label']}>Expected Pace</span>
                <div className={styles['pace-marker-line']} />
              </div>
            )}
            {status === 'success' && pct > 0 && (
              <div className={styles['progress-marker']} style={{ left: `${pct}%` }}>
                <span className={`${styles['progress-marker-label']} ${styles[paceState]}`}>
                  {PROGRESS_LABEL[paceState]}
                </span>
                <div className={styles['progress-marker-line']} />
              </div>
            )}
            <div className={styles['bar-outer']}>
              <div
                className={`${styles['bar-inner']} ${styles[paceState]}`}
                style={{ width: status === 'success' ? `${pct}%` : '0%' }}
              />
            </div>
          </div>

          {/* Status */}
          <div className={styles['status-row']}>
            <span className={`${styles['pct-badge']} ${styles[paceState]}`}>
              {status === 'success' ? `${pct.toFixed(1)}%` : '—'}
            </span>
            <span className={styles['track-status']}>
              {status === 'success'
                ? `${STATUS_PREFIX[paceState]} · projected ${projectedKm.toFixed(0)} km`
                : 'Loading…'}
            </span>
          </div>

          <div className={styles.divider} />

          {/* Stats grid */}
          <div className={styles['stats-grid']}>
            <div className={styles['stat-card']}>
              <span className={styles['stat-label']}>Remaining</span>
              <span className={styles['stat-value']}>
                {status === 'success' ? remaining.toFixed(0) : '—'}
                <span className={styles['stat-value-unit']}> km</span>
              </span>
            </div>
            <div className={styles['stat-card']}>
              <span className={styles['stat-label']}>Days Left</span>
              <span className={styles['stat-value']}>{daysLeft}</span>
            </div>
            <div className={styles['stat-card']}>
              <span className={styles['stat-label']}>Rides</span>
              <span className={styles['stat-value']}>
                {status === 'success' ? rides.length : '—'}
              </span>
            </div>
            <div className={styles['stat-card']}>
              <span className={styles['stat-label']}>Avg Weekly</span>
              <span className={styles['stat-value']}>
                {status === 'success' ? weeklyPace.toFixed(1) : '—'}
                <span className={styles['stat-value-unit']}> km</span>
              </span>
            </div>
            <div className={styles['stat-card']}>
              <span className={styles['stat-label']}>Need/Week</span>
              <span className={`${styles['stat-value']} ${status === 'success' ? accentClass : ''}`}>
                {status === 'success' ? neededPerWeek.toFixed(1) : '—'}
                <span className={styles['stat-value-unit']}> km</span>
              </span>
            </div>
            <div className={styles['stat-card']}>
              <span className={styles['stat-label']}>
                {status === 'success' && kmVsPace >= 0 ? 'Ahead of Pace' : 'Behind Pace'}
              </span>
              <span className={`${styles['stat-value']} ${status === 'success' ? accentClass : ''}`}>
                {status === 'success' ? Math.abs(kmVsPace).toFixed(0) : '—'}
                <span className={styles['stat-value-unit']}> km</span>
              </span>
            </div>
          </div>

          {/* Card footer */}
          <div className={styles['card-footer']}>
            <div className={styles['strava-badge']}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066z" fill="#FC4C02" />
                <path d="M11.216 6.285L7.689 13.828H4.623L11.216 0l6.593 13.828h-3.065z" fill="#FC4C02" opacity="0.5" />
              </svg>
              via Strava
              {lastFetched && (
                <span className={styles['strava-badge-time']}>
                  · {lastFetched.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
            <button
              className={styles['refresh-btn']}
              onClick={load}
              disabled={status === 'loading'}
              title="Refresh data"
              type="button"
            >
              <svg
                width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"
                className={status === 'loading' ? styles.spin : ''}
              >
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
            </button>
          </div>
        </div>
      </main>

      <footer className={styles['page-footer']}>
        lukemelong.com · {new Date().getFullYear()}
      </footer>
    </div>
  );
}

export default CyclingGoalPage;
