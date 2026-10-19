import { Box } from '@mui/material';
import { formatMoney } from '../lib/product';
import { tokens } from '../theme';

/** Current price, with the regular price struck through when it's on sale. */
export default function Price({ product, size = 'body', sx }) {
  const big = size === 'large';
  return (
    <Box component="p" sx={{ m: 0, display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap', ...sx }}>
      <Box
        component="span"
        sx={{ fontWeight: 700, fontSize: big ? '1.5rem' : '0.95rem', color: product.onSale ? tokens.orchid : 'text.primary' }}
      >
        {formatMoney(product.price, product.currency)}
      </Box>
      {product.onSale && (
        <>
          <Box component="s" sx={{ color: 'text.secondary', fontSize: big ? '1rem' : '0.85rem' }}>
            <span className="visually-hidden">Was </span>
            {formatMoney(product.originalPrice, product.currency)}
          </Box>
          <Box component="span" sx={{ color: tokens.orchid, fontSize: big ? '0.95rem' : '0.8rem', fontWeight: 700 }}>
            {product.discountPercent}% off
          </Box>
        </>
      )}
    </Box>
  );
}
