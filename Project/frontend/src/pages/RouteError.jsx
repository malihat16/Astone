import { useRouteError } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';

/** Last-resort screen if a page crashes, instead of a blank white page. */
export default function RouteError() {
  const error = useRouteError();
  const staleChunk = /dynamically imported module|Loading chunk/i.test(String(error?.message));
  return (
    <Box sx={{ maxWidth: 520, mx: 'auto', px: 3, py: 12, textAlign: 'center' }}>
      <Typography variant="h2" component="h1" gutterBottom>
        {staleChunk ? 'A new version of Astoné is available' : 'Something broke on this page'}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {staleChunk ? 'Reload to get the latest version.' : 'Reload the page to try again. If it keeps happening, contact support.'}
      </Typography>
      <Button variant="contained" onClick={() => window.location.reload()}>Reload page</Button>
    </Box>
  );
}
