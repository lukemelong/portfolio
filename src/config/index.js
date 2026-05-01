const isDev = process.env.NODE_ENV === 'development';

export const config = {
  strava: {
    // Dev: relative path goes through CRA proxy (see package.json `proxy`).
    // Prod: absolute worker URL (overridable with REACT_APP_STRAVA_WORKER_URL).
    workerUrl: isDev
      ? '/api/strava-token'
      : (process.env.REACT_APP_STRAVA_WORKER_URL ?? 'https://rapid-cake-da77.lukemelong.workers.dev'),
    goalKm: 1500,
    startDate: new Date('2026-04-01T00:00:00'),
    endDate: new Date('2026-08-28T23:59:59'),
  },
  contact: {
    endpoint: process.env.REACT_APP_EMAIL_ENDPOINT ?? 'https://lukemelong.com/send-email.php',
  },
};
