import Box from '@mui/material/Box';

const containerSx = {
  display: 'flex',
  height: '100vh',
  justifyContent: 'center',
  alignItems: 'center',
};

const spinnerSx = (isDarkMode) => ({
  display: 'inline-block',
  position: 'relative',
  width: '80px',
  height: '80px',
  transform: 'scale(3)',
  div: {
    position: 'absolute',
    top: '33px',
    width: '13px',
    height: '13px',
    borderRadius: '50%',
    background: isDarkMode ? 'white' : 'black',
    animationTimingFunction: 'cubic-bezier(0, 1, 1, 0)',
  },
  'div:nth-of-type(1)': { left: '8px', animation: 'lds-ellipsis1 0.6s infinite' },
  'div:nth-of-type(2)': { left: '8px', animation: 'lds-ellipsis2 0.6s infinite' },
  'div:nth-of-type(3)': { left: '32px', animation: 'lds-ellipsis2 0.6s infinite' },
  'div:nth-of-type(4)': { left: '56px', animation: 'lds-ellipsis3 0.6s infinite' },
  '@keyframes lds-ellipsis1': {
    '0%': { transform: 'scale(0)' },
    '100%': { transform: 'scale(1)' },
  },
  '@keyframes lds-ellipsis3': {
    '0%': { transform: 'scale(1)' },
    '100%': { transform: 'scale(0)' },
  },
  '@keyframes lds-ellipsis2': {
    '0%': { transform: 'translate(0, 0)' },
    '100%': { transform: 'translate(24px, 0)' },
  },
});

/**
 * Animated loading dots used while waiting for NFL scoreboard data.
 *
 * @param {Object} props
 * @param {boolean} props.isDarkMode
 */
function Loading({ isDarkMode }) {
  return (
    <Box sx={containerSx}>
      <Box sx={spinnerSx(isDarkMode)}>
        <div />
        <div />
        <div />
        <div />
      </Box>
    </Box>
  );
}

export default Loading;
