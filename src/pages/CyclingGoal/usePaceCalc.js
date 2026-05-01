import { config } from '../../config';

const { goalKm, startDate, endDate } = config.strava;

function daysBetween(a, b) {
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

function totalKm(rides) {
  return rides.reduce((sum, r) => sum + r.distance / 1000, 0);
}

export function formatDate(d) {
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Pure pace calculator. Given the rides array, returns everything the page renders.
 *
 * Pace state buckets:
 *   on-track → at or ahead of expected pace (rounded to 0.1 km)
 *   close    → behind, but by less than one day's expected km
 *   slight   → behind by 1–3 days' worth of km
 *   behind   → more than 3 days behind
 *
 * @param {Array<{ distance: number }>} rides
 */
export function calcPace(rides) {
  const km = totalKm(rides);
  const today = new Date();
  const totalDays = daysBetween(startDate, endDate);
  const daysElapsed = Math.max(0, Math.min(daysBetween(startDate, today), totalDays));
  const daysLeft = Math.max(0, daysBetween(today, endDate));

  const dailyGoal = goalKm / totalDays;
  const expectedKmByNow = dailyGoal * daysElapsed;
  const kmVsPace = km - expectedKmByNow;
  const kmBehindPace = Math.max(0, -kmVsPace);

  const kmVsPaceRounded = Math.round(kmVsPace * 10) / 10;
  const paceState =
    kmVsPaceRounded >= 0          ? 'on-track' :
    kmBehindPace < dailyGoal      ? 'close' :
    kmBehindPace <= dailyGoal * 3 ? 'slight' :
                                    'behind';

  // Whole completed weeks — avoids inflating avg early in a partial week.
  // Floor to at least 1 to prevent divide-by-zero in week 1.
  const completedWeeks = Math.max(1, Math.floor(daysElapsed / 7));
  const weeklyPace = km / completedWeeks;

  const totalWeeks = Math.ceil(totalDays / 7);
  const weeksLeft = daysLeft / 7;
  const remaining = Math.max(0, goalKm - km);
  const neededPerWeek = weeksLeft > 0 ? remaining / weeksLeft : 0;
  const projectedKm = weeklyPace * totalWeeks;

  const pct = Math.min((km / goalKm) * 100, 100);
  const onPacePct = Math.min((expectedKmByNow / goalKm) * 100, 100);

  return {
    km,
    goal: goalKm,
    pct,
    daysElapsed,
    daysLeft,
    totalDays,
    weeklyPace,
    neededPerWeek,
    projectedKm,
    kmVsPace,
    kmBehindPace,
    expectedKmByNow,
    onPacePct,
    paceState,
    remaining,
  };
}
