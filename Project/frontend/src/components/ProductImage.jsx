import { useState } from 'react';
import { Box } from '@mui/material';
import CheckroomOutlinedIcon from '@mui/icons-material/CheckroomOutlined';
import { tokens } from '../theme';

/** Product photo on a soft tile, with a tidy fallback when a photo is missing or fails to load. */
export default function ProductImage({ src, alt, ratio = '4 / 5', sx, hoverSrc }) {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;
  return (
    <Box
      sx={{
        position: 'relative',
        aspectRatio: ratio,
        backgroundColor: tokens.tile,
        borderRadius: 2,
        overflow: 'hidden',
        ...sx,
        '& img': { width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 },
        '& .hover-img': { opacity: 0, transition: 'opacity 200ms ease' },
        '&:hover .hover-img': { opacity: 1 },
      }}
    >
      {showImage ? (
        <>
          <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />
          {hoverSrc && <img className="hover-img" src={hoverSrc} alt="" loading="lazy" />}
        </>
      ) : (
        <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: tokens.muted }}>
          <CheckroomOutlinedIcon sx={{ fontSize: 44, opacity: 0.6 }} />
        </Box>
      )}
    </Box>
  );
}
