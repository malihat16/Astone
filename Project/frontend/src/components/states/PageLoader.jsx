import { Box, CircularProgress } from '@mui/material';

export default function PageLoader({ minHeight = '50vh' }) {
  return (
    <Box role="status" aria-label="Loading" sx={{ display: 'grid', placeItems: 'center', minHeight }}>
      <CircularProgress size={28} />
    </Box>
  );
}
