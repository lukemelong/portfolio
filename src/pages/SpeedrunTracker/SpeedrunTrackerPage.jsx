import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { speedrunApi } from './speedrunApi';
import { useSpeedrunSync } from './useSpeedrunSync';
import PlayerColumn from './sections/PlayerColumn';
import styles from './SpeedrunTrackerPage.module.scss';

export default function SpeedrunTrackerPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const roomCode = searchParams.get('room')?.toUpperCase() ?? null;

  const [playerSlot, setPlayerSlot] = useState(null);
  const [copied, setCopied] = useState(false);

  // "It's Time!" notification state — tracks which player slot triggered it (null = none)
  const [itsTimeSlot, setItsTimeSlot] = useState(null);
  const prevDeathsRef = useRef({});
  const itsTimeTimerRef = useRef(null);

  // Elapsed timer display
  const [elapsedMs, setElapsedMs] = useState(0);

  const { roomState, error, actions } = useSpeedrunSync(roomCode);

  // ── Room creation ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!roomCode) {
      speedrunApi.createRoom().then(({ code }) => {
        navigate(`/speedrun?room=${code}`, { replace: true });
      });
    }
  }, [roomCode, navigate]);

  // ── Restore player slot from localStorage ─────────────────────────────────
  useEffect(() => {
    if (!roomCode) return;
    const stored = localStorage.getItem(`speedrun_slot_${roomCode}`);
    if (stored) setPlayerSlot(parseInt(stored, 10));
  }, [roomCode]);

  // ── Live timer ────────────────────────────────────────────────────────────
  useEffect(() => {
    const timer = roomState?.timer;
    if (!timer) return;

    if (timer.state === 'running' && timer.startTimeMs != null) {
      const tick = () =>
        setElapsedMs(timer.accumulatedMs + (Date.now() - timer.startTimeMs));
      tick();
      const id = setInterval(tick, 50);
      return () => clearInterval(id);
    }

    setElapsedMs(timer.accumulatedMs);
  }, [roomState?.timer]);

  // ── "It's Time!" detection ────────────────────────────────────────────────
  useEffect(() => {
    if (!roomState) return;
    roomState.players.forEach((player) => {
      const prev = prevDeathsRef.current[player.slot];
      if (prev !== undefined && player.deaths > prev && player.deaths > 0 && player.deaths % 2 === 0) {
        clearTimeout(itsTimeTimerRef.current);
        setItsTimeSlot(player.slot);
        itsTimeTimerRef.current = setTimeout(() => setItsTimeSlot(null), 2800);
      }
      prevDeathsRef.current[player.slot] = player.deaths;
    });
  }, [roomState]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const claimSlot = (slot) => {
    localStorage.setItem(`speedrun_slot_${roomCode}`, slot);
    setPlayerSlot(slot);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  const handleTimerAction = () => {
    if (!roomState) return;
    if (roomState.timer.state === 'running') {
      actions.pause();
    } else {
      actions.start();
    }
  };

  // ── Derived state ─────────────────────────────────────────────────────────
  const bothStopped =
    roomState?.players.length === 2 && roomState.players.every((p) => p.stopped);

  const winnerSlot = bothStopped
    ? (() => {
        const [p1, p2] = roomState.players;
        if (p1.finalTimeMs < p2.finalTimeMs) return 1;
        if (p2.finalTimeMs < p1.finalTimeMs) return 2;
        return null;
      })()
    : null;

  const timerState = roomState?.timer.state ?? 'idle';
  const isRunning = timerState === 'running';
  const isIdle = timerState === 'idle';
  const raceOver = bothStopped;

  // ── Render: loading / creating room ──────────────────────────────────────
  if (!roomCode || !roomState) {
    return <div className={styles.centered}>Setting up room…</div>;
  }

  // ── Render: slot picker ───────────────────────────────────────────────────
  if (playerSlot === null) {
    return (
      <div className={styles.page}>
        <div className={styles.slotOverlay}>
          <div className={styles.slotCard}>
            <p className={styles.slotTitle}>Which player are you?</p>
            <p className={styles.slotSubtitle}>Room&nbsp;<strong>{roomCode}</strong></p>
            <div className={styles.slotBtns}>
              <button className={`${styles.slotBtn} ${styles.slotBtnP1}`} onClick={() => claimSlot(1)}>
                {roomState.players[0]?.name || 'Player 1'}
                <span>Left column</span>
              </button>
              <button className={`${styles.slotBtn} ${styles.slotBtnP2}`} onClick={() => claimSlot(2)}>
                {roomState.players[1]?.name || 'Player 2'}
                <span>Right column</span>
              </button>
            </div>
            <button className={styles.spectatorLink} onClick={() => claimSlot(0)}>
              Just watching
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Render: main page ─────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      {/* Connection error */}
      <AnimatePresence>
        {error && (
          <motion.div
            className={styles.errorBanner}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>Speedrun Race</h1>
        <div className={styles.roomCodeArea}>
          <span className={styles.roomCode}>{roomCode}</span>
          <button className={styles.copyBtn} onClick={handleCopyLink}>
            {copied ? '✓ Copied' : 'Copy link'}
          </button>
        </div>
      </header>

      {/* Shared timer controls */}
      <div className={styles.timerControls}>
        {!raceOver && (
          <button
            className={`${styles.timerBtn} ${isRunning ? styles.pauseBtn : styles.startBtn}`}
            onClick={handleTimerAction}
          >
            {isRunning ? '⏸ Rest' : isIdle ? '▶ Kindle' : '▶ Rise Again'}
          </button>
        )}
        <button
          className={`${styles.timerBtn} ${styles.resetBtn}`}
          onClick={actions.reset}
          disabled={isIdle && !bothStopped}
        >
          ↺ Return to Bonfire
        </button>
      </div>

      {/* Player columns */}
      <div className={styles.playerGrid}>
        {roomState.players.map((player) => (
          <PlayerColumn
            key={player.slot}
            player={player}
            isOwner={playerSlot === player.slot}
            elapsedMs={elapsedMs}
            timerState={timerState}
            isWinner={winnerSlot === player.slot}
            itsTimeVisible={itsTimeSlot === player.slot}
            onStop={(finalTimeMs) => actions.stopPlayer(player.slot, finalTimeMs)}
            onIncrementDeaths={() => actions.incrementDeaths(player.slot)}
            onUpdateName={(name) => actions.updateName(player.slot, name)}
          />
        ))}
      </div>

    </div>
  );
}
