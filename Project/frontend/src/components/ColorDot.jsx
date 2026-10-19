import { Box } from '@mui/material';

export default function ColorDot({ hex, size = 14, title }) {
  return (
    <Box
      component="span"
      title={title}
      aria-hidden={title ? undefined : true}
      sx={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: hex || '#ccc',
        boxShadow: 'inset 0 0 0 1px rgba(29,23,38,0.18)',
        flexShrink: 0,
      }}
    />
  );
}
