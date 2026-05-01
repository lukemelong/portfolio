import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import SportsFootballIcon from '@mui/icons-material/SportsFootball';

const cardSx = ({ isDarkMode, isRedZone, scale }) => ({
  backgroundColor: isRedZone ? (isDarkMode ? '#880808' : '#D22B2B') : '',
  color: isRedZone ? 'white' : '',
  width: 300 * scale,
});

const timerSx = (scale) => ({
  fontSize: 16 * scale,
  marginBottom: 1 * scale,
  minHeight: 14 * scale,
});

const downInfoSx = (scale) => ({
  fontSize: 18 * scale,
  minHeight: 14 * scale,
  marginTop: 1 * scale,
  textAlign: 'left',
});

const recordSx = (scale) => ({ fontSize: 14 * scale });

const teamLogoStyle = (scale) => ({ maxWidth: 45 * scale });

const teamNameSx = (winner) => ({ fontWeight: winner ? 'bold' : undefined });

const scoreSx = (winner) => ({
  fontWeight: winner ? 'bold' : undefined,
  marginRight: 1.8,
  textAlign: 'right',
});

const possessionIconSx = (scale) => ({
  width: 15 * scale,
  marginLeft: 2 * scale,
});

/**
 * ScoreCard renders the live state of one NFL game.
 *
 * @param {Object} props
 * @param {Object} props.game
 * @param {boolean} props.isDarkMode
 * @param {number} props.scale
 */
function ScoreCard({ game, isDarkMode, scale }) {
  if (!game) return null;
  const {
    awayTeam,
    gameCompleted,
    gameDetail,
    gameState,
    downDistanceText,
    homeTeam,
    isRedZone,
    possession,
  } = game;

  const homeHasBall = awayTeam.id !== possession;
  const showPossession = !gameCompleted && gameState !== 'pre';

  return (
    <Card sx={cardSx({ isDarkMode, isRedZone, scale })}>
      <CardContent>
        <Grid container alignItems="center">
          <Grid item xs={12}>
            <Typography sx={timerSx(scale)}>{gameDetail}</Typography>
          </Grid>

          <Grid item xs={2}>
            <img
              alt={`${awayTeam.displayName} logo`}
              src={awayTeam.logo}
              style={teamLogoStyle(scale)}
            />
          </Grid>
          <Grid item xs={2}>
            {showPossession && !homeHasBall && (
              <SportsFootballIcon sx={possessionIconSx(scale)} />
            )}
          </Grid>
          <Grid item xs={4}>
            <Stack>
              <Typography sx={teamNameSx(awayTeam.winner)}>
                {awayTeam.name}
              </Typography>
              <Typography sx={recordSx(scale)}>{awayTeam.record}</Typography>
            </Stack>
          </Grid>
          <Grid item xs={4}>
            <Typography sx={scoreSx(awayTeam.winner)}>
              {awayTeam.score}
            </Typography>
          </Grid>

          <Grid item xs={2}>
            <img
              alt={`${homeTeam.displayName} logo`}
              src={homeTeam.logo}
              style={teamLogoStyle(scale)}
            />
          </Grid>
          <Grid item xs={2}>
            {showPossession && homeHasBall && (
              <SportsFootballIcon sx={possessionIconSx(scale)} />
            )}
          </Grid>
          <Grid item xs={4}>
            <Stack>
              <Typography sx={teamNameSx(homeTeam.winner)}>
                {homeTeam.name}
              </Typography>
              <Typography sx={recordSx(scale)}>{homeTeam.record}</Typography>
            </Stack>
          </Grid>
          <Grid item xs={4}>
            <Typography sx={scoreSx(homeTeam.winner)}>
              {homeTeam.score}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography sx={downInfoSx(scale)}>{downDistanceText}</Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

export default ScoreCard;
