import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ReactComponent as ErrorIcon } from '../assets/dead.svg';

const containerSx = {
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const messageSx = {
  fontSize: '1.6vw',
};

/**
 * Error state shown when scoreboard data fails to load.
 *
 * @param {Object} props
 * @param {boolean} props.isDarkMode
 */
function Error({ isDarkMode }) {
  return (
    <Stack direction="column" gap={2} sx={containerSx}>
      <ErrorIcon
        style={{ fill: isDarkMode ? 'white' : 'black', width: '20%' }}
      />
      <Typography sx={messageSx}>
        Something went wrong! Maybe give it a good ol&apos; refresh
      </Typography>
    </Stack>
  );
}

export default Error;
