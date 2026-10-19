import { Box, Typography } from '@mui/material';

export default function EmptyState({ icon, title, children, action, compact = false, headingLevel = 'h2' }) {
  return (
    <Box sx={{ textAlign: 'center', py: compact ? 4 : 9, px: 2, maxWidth: 440, mx: 'auto' }}>
      {icon && <Box sx={{ color: 'text.secondary', mb: 1.5, '& svg': { fontSize: 40 } }}>{icon}</Box>}
      <Typography variant="h4" component={headingLevel} gutterBottom>
        {title}
      </Typography>
      {children && (
        <Typography color="text.secondary" sx={{ mb: action ? 3 : 0 }}>
          {children}
        </Typography>
      )}
      {action}
    </Box>
  );
}
