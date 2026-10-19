import { useCallback, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Autocomplete, Box, Button, TextField, Typography } from '@mui/material';
import { getProducts } from '../services/products';
import { useAsync } from '../lib/useAsync';
import { formatMoney } from '../lib/product';
import { tokens } from '../theme';
import PageContainer from '../components/layout/PageContainer';
import ProductImage from '../components/ProductImage';
import Price from '../components/Price';
import ColorDot from '../components/ColorDot';
import ErrorState from '../components/states/ErrorState';

const ROWS = [
  ['Price', (p, other) => (
    <Box>
      <Price product={p} />
      {other && p.price < other.price && (
        <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>
          {formatMoney(other.price - p.price)} cheaper
        </Typography>
      )}
    </Box>
  )],
  ['Brand', (p) => p.brand || '—'],
  ['For', (p) => p.genderLabel || '—'],
  ['Type', (p) => p.categories.join(', ') || '—'],
  ['Colours', (p) => (p.colors.length ? (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {p.colors.map((c) => (
        <Box key={c.name} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
          <ColorDot hex={c.hex} size={12} /> {c.name}
        </Box>
      ))}
    </Box>
  ) : '—')],
  ['Sizes', (p) => p.sizes.map((s) => s.value).join(', ') || '—'],
  ['In stock', (p) => (p.stock > 0 ? p.stock : 'Sold out')],
  ['Description', (p) => p.description || '—'],
];

export default function Compare() {
  const load = useCallback(() => getProducts(), []);
  const { data: products, loading, error, reload } = useAsync(load);
  const [picked, setPicked] = useState([null, null]);
  const setPick = (i) => (_, value) => setPicked((prev) => prev.map((p, j) => (j === i ? value : p)));
  const [a, b] = picked;

  return (
    <PageContainer sx={{ pt: { xs: 4, md: 6 } }}>
      <Typography variant="h1">Compare</Typography>
      <Typography color="text.secondary" sx={{ mt: 1, mb: 4 }}>Pick two pieces to see them side by side.</Typography>

      {error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 4 }}>
            {[0, 1].map((i) => (
              <Autocomplete
                key={i}
                options={products || []}
                loading={loading}
                value={picked[i]}
                onChange={setPick(i)}
                getOptionLabel={(p) => p.name}
                isOptionEqualToValue={(x, y) => x.id === y.id}
                getOptionDisabled={(p) => picked[1 - i]?.id === p.id}
                renderOption={(props, p) => (
                  <li {...props} key={p.id}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: 2 }}>
                      <span>{p.name}</span>
                      <Box component="span" sx={{ color: 'text.secondary' }}>{formatMoney(p.price)}</Box>
                    </Box>
                  </li>
                )}
                renderInput={(params) => <TextField {...params} label={i === 0 ? 'First product' : 'Second product'} />}
              />
            ))}
          </Box>

          {a || b ? (
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', '& td, & th': { borderTop: `1px solid ${tokens.line}`, p: { xs: 1.25, sm: 2 }, verticalAlign: 'top', textAlign: 'left' }, '& th': { color: 'text.secondary', fontWeight: 600, width: { xs: 90, sm: 160 } } }}>
              <thead>
                <tr>
                  <Box component="th" sx={{ borderTop: '0 !important' }}><span className="visually-hidden">Attribute</span></Box>
                  {[a, b].map((p, i) => (
                    <Box component="td" key={i} sx={{ borderTop: '0 !important' }}>
                      {p ? (
                        <Box component={RouterLink} to={`/buyer_products/${p.id}`} sx={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                          <ProductImage src={p.images[0]} alt={p.name} sx={{ maxWidth: 260 }} />
                          <Typography sx={{ fontWeight: 700, mt: 1.5 }}>{p.name}</Typography>
                        </Box>
                      ) : (
                        <Box sx={{ aspectRatio: '4 / 5', maxWidth: 260, border: `1px dashed ${tokens.line}`, borderRadius: 2, display: 'grid', placeItems: 'center', color: 'text.secondary', textAlign: 'center', p: 2 }}>
                          Choose a product to compare
                        </Box>
                      )}
                    </Box>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map(([label, render]) => (
                  <tr key={label}>
                    <th scope="row">{label}</th>
                    <td>{a ? render(a, b) : ''}</td>
                    <td>{b ? render(b, a) : ''}</td>
                  </tr>
                ))}
              </tbody>
            </Box>
          ) : (
            <Box sx={{ border: `1px dashed ${tokens.line}`, borderRadius: 4, py: 8, textAlign: 'center' }}>
              <Typography color="text.secondary" sx={{ mb: 2 }}>Nothing to compare yet.</Typography>
              <Button component={RouterLink} to="/shop" variant="outlined">Browse the shop</Button>
            </Box>
          )}
        </>
      )}
    </PageContainer>
  );
}
