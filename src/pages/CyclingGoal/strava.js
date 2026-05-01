import { config } from '../../config';

const CYCLING_TYPES = ['Ride', 'VirtualRide', 'MountainBikeRide', 'GravelRide', 'EBikeRide'];

/**
 * Hits the Cloudflare Worker for a fresh Strava access token.
 * @returns {Promise<string>}
 */
export async function getAccessToken() {
  const res = await fetch(config.strava.workerUrl);
  if (!res.ok) throw new Error('Could not reach token service');
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.access_token;
}

/**
 * Fetches all cycling activities in the configured date window, paging until exhausted.
 * @param {string} accessToken
 * @returns {Promise<Array<{ distance: number, sport_type: string }>>}
 */
export async function fetchAllRides(accessToken) {
  const rides = [];
  const after = Math.floor(config.strava.startDate.getTime() / 1000);
  const before = Math.floor(config.strava.endDate.getTime() / 1000);
  let page = 1;

  while (true) {
    const res = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?after=${after}&before=${before}&per_page=200&page=${page}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!res.ok) throw new Error('Failed to fetch activities');
    const batch = await res.json();
    if (!batch.length) break;

    rides.push(...batch.filter((a) => CYCLING_TYPES.includes(a.sport_type)));
    if (batch.length < 200) break;
    page++;
  }

  return rides;
}
