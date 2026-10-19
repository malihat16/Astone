import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import PageContainer from '../../components/layout/PageContainer';
import { useAuth } from '../../lib/contexts';
import { tokens } from '../../theme';

const STEPS = [
  ['Create your shop', 'Sign up with your label name and contact details. It takes about two minutes.'],
  ['List your pieces', 'Add photos, sizes, colours and stock. Your products go live straight away.'],
  ['Ship and get paid', 'Orders appear in your Seller Centre. Mark them shipped and track sales in Finance.'],
];

export default function Sell() {
  const { isSeller } = useAuth();
  return (
    <PageContainer sx={{ pt: { xs: 5, md: 9 } }}>
      <Box sx={{ maxWidth: 760 }}>
        <Typography variant="h1">Sell your label on Astoné</Typography>
        <Typography sx={{ fontSize: '1.2rem', color: 'text.secondary', mt: 2, mb: 4, maxWidth: 560 }}>
          Reach shoppers across Malaysia without building your own store. You set the prices and run the promotions; we handle the storefront and checkout.
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          {isSeller ? (
            <Button component={RouterLink} to="/sellerDashboard" variant="contained" size="large">Go to Seller Centre</Button>
          ) : (
            <>
              <Button component={RouterLink} to="/signupSeller" variant="contained" size="large">Create a seller account</Button>
              <Button component={RouterLink} to="/loginSeller" variant="outlined" size="large">Log in to Seller Centre</Button>
            </>
          )}
        </Box>
      </Box>

      <Box component="ol" sx={{ listStyle: 'none', p: 0, m: 0, mt: { xs: 8, md: 12 }, display: 'grid', gridTemplateColumns: { md: 'repeat(3, 1fr)' }, gap: { xs: 4, md: 5 } }}>
        {STEPS.map(([title, text], i) => (
          <Box component="li" key={title} sx={{ borderTop: `2px solid ${tokens.ink}`, pt: 2.5 }}>
            <Typography sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>Step {i + 1}</Typography>
            <Typography variant="h3" component="h2" sx={{ mb: 1 }}>{title}</Typography>
            <Typography color="text.secondary">{text}</Typography>
          </Box>
        ))}
      </Box>
    </PageContainer>
  );
}
