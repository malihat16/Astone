import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import PageContainer from '../components/layout/PageContainer';
import { fonts } from '../theme';

export default function NotFound() {
  return (
    <PageContainer sx={{ py: { xs: 8, md: 14 } }}>
      <Typography aria-hidden sx={{ fontFamily: fonts.display, fontWeight: 800, fontSize: 'clamp(5rem, 18vw, 12rem)', lineHeight: 0.9, letterSpacing: '-0.05em', color: 'primary.main' }}>
        404
      </Typography>
      <Typography variant="h2" component="h1" sx={{ mt: 2 }}>This page doesn&apos;t exist</Typography>
      <Typography color="text.secondary" sx={{ mt: 1, mb: 4, maxWidth: 460 }}>
        The link may be old or mistyped. Try the shop, or head back to the home page.
      </Typography>
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        <Button component={RouterLink} to="/shop" variant="contained">Browse the shop</Button>
        <Button component={RouterLink} to="/" variant="outlined">Go home</Button>
      </Box>
    </PageContainer>
  );
}
