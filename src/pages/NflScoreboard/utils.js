import axios from 'axios';

const NFL_SCOREBOARD_URL =
  'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard';

const formatGameData = (games) =>
  games.events.map((game) => {
    const competition = game.competitions[0];
    const id = competition.id;
    const homeTeam = competition.competitors[0];
    const awayTeam = competition.competitors[1];
    const situation = competition.situation;
    const downDistanceText = situation?.downDistanceText;
    const isRedZone = situation?.isRedZone;
    const possession = situation?.possession;
    const {
      status: {
        type: {
          completed: gameCompleted,
          detail: gameDetail,
          state: gameState,
        },
      },
    } = competition;

    return {
      downDistanceText,
      gameCompleted,
      gameDetail,
      gameState,
      id,
      isRedZone,
      possession,
      homeTeam: {
        id: homeTeam.id,
        displayName: homeTeam.team.displayName,
        name: homeTeam.team.name,
        logo: homeTeam.team.logo,
        score: homeTeam.score,
        winner: homeTeam.winner,
        record: homeTeam.records ? `(${homeTeam.records[0].summary})` : '0-0',
      },
      awayTeam: {
        id: awayTeam.id,
        displayName: awayTeam.team.displayName,
        name: awayTeam.team.name,
        logo: awayTeam.team.logo,
        score: awayTeam.score,
        winner: awayTeam.winner,
        record: awayTeam.records ? `(${awayTeam.records[0].summary})` : '0-0',
      },
    };
  });

/**
 * Fetch and format NFL scoreboard data from ESPN.
 *
 * @param {Object} handlers
 * @param {Function} handlers.setError
 * @param {Function} handlers.setGameData
 * @param {Function} handlers.setLoading
 * @param {boolean} handlers.shouldShowLoading
 */
export const getGameData = async ({
  setError,
  setGameData,
  setLoading,
  shouldShowLoading,
}) => {
  if (shouldShowLoading) setLoading(true);
  try {
    const { data } = await axios.get(NFL_SCOREBOARD_URL);
    setGameData(formatGameData(data));
  } catch (err) {
    setError(err);
    return;
  } finally {
    if (shouldShowLoading) setLoading(false);
  }
};
