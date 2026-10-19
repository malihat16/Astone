import { Box } from '@mui/material';

export default function PageContainer({ children, sx, narrow = false, component = 'div' }) {
  return (
    <Box component={component} sx={{ width: '100%', maxWidth: narrow ? 760 : 1280, mx: 'auto', px: { xs: 2, sm: 3, md: 4 }, ...sx }}>
      {children}
    </Box>
  );
}
