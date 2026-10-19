import { Box } from '@mui/material';
import { tokens } from '../theme';

const STYLES = {
  processing: { label: 'Preparing', bg: '#F3EEDF', fg: '#7A5B12' },
  partial: { label: 'Partly shipped', bg: tokens.plumSoft, fg: tokens.plumDark },
  shipped: { label: 'Shipped', bg: '#E2F0E7', fg: '#22603C' },
};

export default function StatusPill({ status }) {
  const s = STYLES[status] || STYLES.processing;
  return (
    <Box component="span" sx={{ display: 'inline-block', px: 1.25, py: 0.25, borderRadius: 999, fontSize: 13, fontWeight: 700, bgcolor: s.bg, color: s.fg, whiteSpace: 'nowrap' }}>
      {s.label}
    </Box>
  );
}
