import { Box, Skeleton } from '@mui/material';
import ProductCard from './ProductCard';

const gridSx = {
  display: 'grid',
  gap: { xs: '28px 14px', md: '40px 24px' },
  gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' },
};

export default function ProductGrid({ products, columns }) {
  return (
    <Box sx={{ ...gridSx, ...(columns && { gridTemplateColumns: columns }) }}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </Box>
  );
}

export function ProductGridSkeleton({ count = 8, columns }) {
  return (
    <Box sx={{ ...gridSx, ...(columns && { gridTemplateColumns: columns }) }} aria-busy="true" aria-label="Loading products">
      {Array.from({ length: count }, (_, i) => (
        <Box key={i}>
          <Skeleton variant="rounded" sx={{ aspectRatio: '4 / 5', height: 'auto', borderRadius: 2 }} />
          <Skeleton width="40%" sx={{ mt: 1.5 }} />
          <Skeleton width="80%" />
          <Skeleton width="30%" />
        </Box>
      ))}
    </Box>
  );
}
