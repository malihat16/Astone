import { Box, Typography } from '@mui/material';
import { tokens } from '../../theme';

/** Centered form frame used by login, sign-up and password pages. */
export default function AuthShell({ title, subtitle, children, footer, width = 440 }) {
  return (
    <Box sx={{ px: 2, py: { xs: 5, md: 9 } }}>
      <Box sx={{ maxWidth: width, mx: 'auto', bgcolor: 'background.paper', border: `1px solid ${tokens.line}`, borderRadius: 4, p: { xs: 3, sm: 5 } }}>
        <Typography variant="h2" component="h1" sx={{ mb: subtitle ? 1 : 3 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography color="text.secondary" sx={{ mb: 3.5 }}>
            {subtitle}
          </Typography>
        )}
        {children}
      </Box>
      {footer && <Box sx={{ maxWidth: width, mx: 'auto', mt: 3, textAlign: 'center', color: 'text.secondary' }}>{footer}</Box>}
    </Box>
  );
}
