import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../SpeedrunTrackerPage.module.scss';

function formatTime(ms) {
  if (ms < 0) ms = 0;
  const cs = Math.floor(ms / 10) % 100;
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / 60000) % 60;
  const h = Math.floor(ms / 3600000);
  const pad = (n) => String(n).padStart(2, '0');
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}.${pad(cs)}`;
  return `${pad(m)}:${pad(s)}.${pad(cs)}`;
}

/**
 * @param {{ player: object, isOwner: boolean, elapsedMs: number, timerState: string, isWinner: boolean, itsTimeVisible: boolean, onStop: function, onIncrementDeaths: function, onUpdateName: function }} props
 */
export default function PlayerColumn({
  player,
  isOwner,
  elapsedMs,
  timerState,
  isWinner,
  itsTimeVisible,
  onStop,
  onIncrementDeaths,
  onUpdateName,
}) {
  const [nameInput, setNameInput] = useState(player.name);
  const [justFinished, setJustFinished] = useState(false);
  const prevStoppedRef = useRef(player.stopped);
  const nameDebounceRef = useRef(null);

  // Keep local name in sync with remote updates (other player's view)
  useEffect(() => {
    setNameInput(player.name);
  }, [player.name]);

  // Detect stop transition → trigger ceremony
  useEffect(() => {
    if (!prevStoppedRef.current && player.stopped) {
      setJustFinished(true);
      const id = setTimeout(() => setJustFinished(false), 3500);
      return () => clearTimeout(id);
    }
    prevStoppedRef.current = player.stopped;
  }, [player.stopped]);

  const handleNameChange = (e) => {
    const val = e.target.value;
    setNameInput(val);
    clearTimeout(nameDebounceRef.current);
    nameDebounceRef.current = setTimeout(() => {
      if (val.trim()) onUpdateName(val.trim());
    }, 600);
  };

  const handleStop = () => {
    const finalTime = player.stopped ? player.finalTimeMs : elapsedMs;
    onStop(finalTime);
  };

  const canStop = isOwner && !player.stopped && timerState !== 'idle';
  const displayMs = player.stopped ? player.finalTimeMs : elapsedMs;
  const timerClass = player.stopped
    ? styles.timerStopped
    : timerState === 'paused'
    ? styles.timerPaused
    : styles.timerRunning;

  return (
    <div className={`${styles.playerColumn} ${player.slot === 1 ? styles.columnP1 : styles.columnP2}`}>
      <div className={styles.accentBar} />

      <input
        className={styles.nameInput}
        value={nameInput}
        onChange={handleNameChange}
        maxLength={30}
        readOnly={!isOwner}
        placeholder={`Player ${player.slot}`}
        aria-label="Player name"
      />

      {/* Timer display */}
      <motion.div
        className={`${styles.timerDisplay} ${timerClass}`}
        animate={justFinished ? { scale: [1, 1.18, 0.96, 1.06, 1] } : {}}
        transition={{ duration: 0.5 }}
      >
        {formatTime(displayMs)}
      </motion.div>

      {/* Finished label + winner badge */}
      <AnimatePresence>
        {player.stopped && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}
          >
            <span className={styles.finishedLabel}>✓ Finished</span>
            {isWinner && <span className={styles.winnerBadge}>🏆 Winner</span>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Death counter */}
      <div className={styles.deathSection}>
        <span className={styles.deathLabel}>Deaths</span>

        <motion.span
          key={player.deaths}
          className={styles.deathCount}
          initial={{ scale: 1.35 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
        >
          {player.deaths}
        </motion.span>

        <button
          className={styles.deathBtn}
          onClick={onIncrementDeaths}
          disabled={!isOwner}
          aria-label="Add one death"
        >
          ☠️ +1 DEATH
        </button>
      </div>

      {/* "It's Time!" in-column banner */}
      <AnimatePresence>
        {itsTimeVisible && (
          <motion.div
            className={styles.itsTimeColumnBanner}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 360, damping: 22 }}
          >
            ⚔️ It&apos;s Time!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Finish button — bottom of column */}
      <AnimatePresence>
        {canStop && (
          <motion.button
            className={styles.finishBtn}
            onClick={handleStop}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileTap={{ scale: 0.95 }}
            style={{ marginTop: 'auto' }}
          >
            FINISH RUN
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
