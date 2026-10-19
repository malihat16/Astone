import { Box, Button, Typography } from '@mui/material';
import CloudOffOutlinedIcon from '@mui/icons-material/CloudOffOutlined';
import { errorMessage } from '../../lib/api';

/** Shown when a request fails. Says what happened and offers a retry. */
export default function ErrorState({ error, title = "This didn't load", onRetry, compact = false }) {
  return (
    <Box role="alert" sx={{ textAlign: 'center', py: compact ? 4 : 10, px: 2, maxWidth: 460, mx: 'auto' }}>
      <CloudOffOutlinedIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1.5 }} />
      <Typography variant="h4" component="h2" gutterBottom>
        {title}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {errorMessage(error)}
      </Typography>
      {onRetry && (
        <Button variant="contained" onClick={onRetry}>
          Try again
        </Button>
      )}
    </Box>
  );
}
