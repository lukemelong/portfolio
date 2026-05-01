import { useCallback, useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Error from './sections/Error';
import Loading from './sections/Loading';
import ScoreCard from './sections/ScoreCard';
import { getGameData } from './utils';

const REFRESH_INTERVAL_MS = 10_000;
const DARK_MODE_STORAGE_KEY = 'darkMode';

const gameStackSx = { flexWrap: 'wrap', justifyContent: 'center' };
const settingsButtonSx = { fontSize: 14 };
const sliderItemSx = { width: 300 };
const scaleStackSx = { width: '100%' };
const labelSx = { fontSize: 14, display: 'inline' };

function NflScoreboardPage() {
  const [error, setError] = useState(false);
  const [gameData, setGameData] = useState();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [scale, setScale] = useState(1);
  const menuOpen = Boolean(menuAnchorEl);

  const refresh = useCallback(
    (shouldShowLoading) => {
      if (error) return;
      getGameData({ setError, setGameData, setLoading, shouldShowLoading });
    },
    [error]
  );

  useEffect(() => {
    if (localStorage.getItem(DARK_MODE_STORAGE_KEY) === 'true') {
      setIsDarkMode(true);
    }
    refresh(true);
    const interval = setInterval(() => refresh(false), REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  useEffect(() => {
    localStorage.setItem(DARK_MODE_STORAGE_KEY, String(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    if (window.innerWidth > 1536) setScale(1.3);
  }, []);

  const theme = createTheme({
    palette: { mode: isDarkMode ? 'dark' : 'light' },
    typography: { fontSize: 18 * scale },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xxl" sx={{ marginTop: error ? '' : 2 }}>
        {loading ? (
          <Loading isDarkMode={isDarkMode} />
        ) : error ? (
          <Error isDarkMode={isDarkMode} />
        ) : (
          <Grid container spacing={4}>
            <Grid item xs={2}>
              <Button
                sx={settingsButtonSx}
                aria-controls={menuOpen ? 'scoreboard-settings-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={menuOpen ? 'true' : undefined}
                onClick={(e) => setMenuAnchorEl(e.currentTarget)}
              >
                Settings
              </Button>
              <Menu
                id="scoreboard-settings-menu"
                anchorEl={menuAnchorEl}
                open={menuOpen}
                onClose={() => setMenuAnchorEl(null)}
              >
                <MenuItem>
                  <Typography sx={labelSx}>Dark Mode</Typography>
                  <Switch
                    inputProps={{ 'aria-label': 'Dark Mode' }}
                    checked={isDarkMode}
                    onChange={() => setIsDarkMode(!isDarkMode)}
                  />
                </MenuItem>
                <MenuItem sx={sliderItemSx}>
                  <Stack direction="row" spacing={2} sx={scaleStackSx}>
                    <Typography sx={labelSx}>Scale</Typography>
                    <Slider
                      step={0.01}
                      min={0.8}
                      max={3}
                      value={scale}
                      onChange={(_, newValue) => setScale(newValue)}
                    />
                  </Stack>
                </MenuItem>
              </Menu>
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" gap={2} sx={gameStackSx}>
                {gameData?.map((game) => (
                  <ScoreCard
                    key={game.id}
                    game={game}
                    isDarkMode={isDarkMode}
                    scale={scale}
                  />
                ))}
              </Stack>
            </Grid>
          </Grid>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default NflScoreboardPage;
