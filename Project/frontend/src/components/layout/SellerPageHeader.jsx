import { Box, Typography } from '@mui/material';

export default function SellerPageHeader({ title, subtitle, actions }) {
  return (
    <Box sx={{ display: 'flex', alignItems: { sm: 'flex-end' }, justifyContent: 'space-between', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, mb: 4 }}>
      <Box>
        <Typography variant="h2" component="h1">{title}</Typography>
        {subtitle && <Typography color="text.secondary" sx={{ mt: 0.5 }}>{subtitle}</Typography>}
      </Box>
      {actions && <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>{actions}</Box>}
    </Box>
  );
}
