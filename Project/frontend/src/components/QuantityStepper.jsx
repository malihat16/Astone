import { Box, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { tokens } from '../theme';

export default function QuantityStepper({ value, onChange, min = 1, max = 99, disabled, label = 'Quantity' }) {
  return (
    <Box role="group" aria-label={label} sx={{ display: 'inline-flex', alignItems: 'center', border: `1px solid ${tokens.line}`, borderRadius: 999, bgcolor: 'background.paper' }}>
      <IconButton size="small" aria-label="Decrease quantity" onClick={() => onChange(value - 1)} disabled={disabled || value <= min}>
        <RemoveIcon fontSize="small" />
      </IconButton>
      <Box component="span" aria-live="polite" sx={{ minWidth: 28, textAlign: 'center', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Box>
      <IconButton size="small" aria-label="Increase quantity" onClick={() => onChange(value + 1)} disabled={disabled || value >= max}>
        <AddIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
