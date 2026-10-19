import { Box, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ProductImage from './ProductImage';
import Price from './Price';
import ColorDot from './ColorDot';

export default function ProductCard({ product, to }) {
  return (
    <Box
      component={RouterLink}
      to={to || `/buyer_products/${product.id}`}
      sx={{ display: 'block', textDecoration: 'none', color: 'inherit', borderRadius: 2, '&:hover .name': { textDecoration: 'underline' } }}
    >
      <ProductImage src={product.images[0]} hoverSrc={product.images[1]} alt={product.name} />
      <Box sx={{ pt: 1.5, px: 0.25 }}>
        {product.brand && (
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
            {product.brand}
          </Typography>
        )}
        <Typography className="name" component="h3" sx={{ fontWeight: 600, lineHeight: 1.35, my: 0.25 }}>
          {product.name}
        </Typography>
        <Price product={product} />
        {product.colors.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.75, mt: 1 }}>
            {product.colors.slice(0, 5).map((c) => (
              <ColorDot key={c.name} hex={c.hex} size={12} title={c.name} />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
