import { config } from '../../config';

const { apiUrl } = config.speedrun;

async function post(body) {
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

async function getRoom(code) {
  // Bypass HTTP cache — Apache on Dreamhost was adding max-age=172800, causing
  // polled GETs to read stale state (timer would jump to 0 right after start).
  const res = await fetch(`${apiUrl}?room=${encodeURIComponent(code)}`, { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export const speedrunApi = {
  createRoom: () => post({ action: 'create_room' }),
  getRoom,
  start: (room) => post({ action: 'start', room }),
  pause: (room) => post({ action: 'pause', room }),
  stopPlayer: (room, slot, finalTimeMs) => post({ action: 'stop_player', room, slot, finalTimeMs }),
  updateName: (room, slot, name) => post({ action: 'update_name', room, slot, name }),
  incrementDeaths: (room, slot) => post({ action: 'increment_deaths', room, slot }),
  reset: (room) => post({ action: 'reset', room }),
};
