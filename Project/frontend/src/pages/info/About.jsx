import { Box, Button, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import InfoPage from './InfoPage';
import { tokens } from '../../theme';

const REASONS = [
  ['Variety', 'Pieces from independent Malaysian labels, from everyday basics to statement fits.'],
  ['Quality', 'Sellers list fabric weight and fit, so you know what you are getting before it arrives.'],
  ['Fair prices', 'Labels sell directly to you, and every order earns 10% back in points.'],
];

export default function About() {
  return (
    <InfoPage
      title="About Astoné"
      intro="Astoné is a marketplace for clothing made by independent Malaysian labels. We help small studios reach shoppers nationwide, and help shoppers find pieces they'll wear for years."
    >
      <Box component="dl" sx={{ m: 0, display: 'grid', gap: 0 }}>
        {REASONS.map(([term, text]) => (
          <Box key={term} sx={{ display: 'grid', gridTemplateColumns: { sm: '160px 1fr' }, gap: 1, py: 2.5, borderTop: `1px solid ${tokens.line}` }}>
            <Typography component="dt" sx={{ fontWeight: 700 }}>{term}</Typography>
            <Typography component="dd" sx={{ m: 0, color: 'text.secondary' }}>{text}</Typography>
          </Box>
        ))}
      </Box>
      <Box sx={{ display: 'flex', gap: 1.5, mt: 5, flexWrap: 'wrap' }}>
        <Button component={RouterLink} to="/shop" variant="contained">Browse the shop</Button>
        <Button component={RouterLink} to="/sell" variant="outlined">Sell on Astoné</Button>
      </Box>
    </InfoPage>
  );
}
