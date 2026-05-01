import { useState, useEffect, useCallback, useRef } from 'react';
import { speedrunApi } from './speedrunApi';

const POLL_MS = 600;

/**
 * Polls the speedrun API for room state and exposes action callbacks.
 * @param {string|null} roomCode
 */
export function useSpeedrunSync(roomCode) {
  const [roomState, setRoomState] = useState(null);
  const [error, setError] = useState(null);
  const inflightRef = useRef(false);
  const mutationCountRef = useRef(0);
  const generationRef = useRef(0);

  const refresh = useCallback(async () => {
    if (!roomCode || inflightRef.current || mutationCountRef.current > 0) return;
    inflightRef.current = true;
    const gen = generationRef.current;
    try {
      const data = await speedrunApi.getRoom(roomCode);
      // Drop the response if a mutation started while this GET was in flight,
      // or if one is currently in flight — otherwise we'd clobber the action's result with stale data.
      if (data && gen === generationRef.current && mutationCountRef.current === 0) {
        setRoomState(data);
      }
      setError(null);
    } catch {
      setError('Connection lost — retrying…');
    } finally {
      inflightRef.current = false;
    }
  }, [roomCode]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  const runMutation = useCallback(async (fn) => {
    generationRef.current++;
    mutationCountRef.current++;
    try {
      return await fn();
    } finally {
      mutationCountRef.current--;
    }
  }, []);

  const start = useCallback(() => runMutation(async () => {
    const data = await speedrunApi.start(roomCode);
    setRoomState(data);
  }), [roomCode, runMutation]);

  const pause = useCallback(() => runMutation(async () => {
    const data = await speedrunApi.pause(roomCode);
    setRoomState(data);
  }), [roomCode, runMutation]);

  const stopPlayer = useCallback((slot, finalTimeMs) => runMutation(async () => {
    const data = await speedrunApi.stopPlayer(roomCode, slot, finalTimeMs);
    setRoomState(data);
  }), [roomCode, runMutation]);

  const updateName = useCallback((slot, name) => {
    speedrunApi.updateName(roomCode, slot, name);
  }, [roomCode]);

  const incrementDeaths = useCallback((slot) => runMutation(async () => {
    // Optimistic update so the button feels instant
    setRoomState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        players: prev.players.map((p) =>
          p.slot === slot ? { ...p, deaths: p.deaths + 1 } : p
        ),
      };
    });
    const { deaths } = await speedrunApi.incrementDeaths(roomCode, slot);
    // Reconcile with confirmed server value
    setRoomState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        players: prev.players.map((p) =>
          p.slot === slot ? { ...p, deaths } : p
        ),
      };
    });
  }), [roomCode, runMutation]);

  const reset = useCallback(() => runMutation(async () => {
    const data = await speedrunApi.reset(roomCode);
    setRoomState(data);
  }), [roomCode, runMutation]);

  return {
    roomState,
    error,
    actions: { start, pause, stopPlayer, updateName, incrementDeaths, reset },
  };
}
