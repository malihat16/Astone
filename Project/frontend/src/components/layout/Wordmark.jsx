import { Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { fonts } from '../../theme';

export default function Wordmark({ to = '/', suffix, size = 26, stacked = false }) {
  return (
    <Box
      component={RouterLink}
      to={to}
      aria-label="Astoné home"
      sx={{
        fontFamily: fonts.display,
        fontWeight: 800,
        fontSize: size,
        letterSpacing: '-0.03em',
        textDecoration: 'none',
        color: 'text.primary',
        lineHeight: 1,
        display: 'inline-flex',
        flexDirection: stacked ? 'column' : 'row',
        alignItems: stacked ? 'flex-start' : 'baseline',
        gap: stacked ? 0.75 : 1,
        whiteSpace: 'nowrap',
      }}
    >
      Astoné
      {suffix && (
        <Box component="span" sx={{ fontFamily: 'inherit', fontWeight: 600, fontSize: '0.55em', color: 'primary.main', letterSpacing: 0 }}>
          {suffix}
        </Box>
      )}
    </Box>
  );
}
