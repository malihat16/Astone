import { useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Link, Skeleton, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { getMyProducts, getSellerOrders, getSellerProfile } from '../../services/seller';
import { useAsync } from '../../lib/useAsync';
import { formatMoney } from '../../lib/product';
import { tokens } from '../../theme';
import SellerPageHeader from '../../components/layout/SellerPageHeader';
import ErrorState from '../../components/states/ErrorState';

const COUNTERS = [
  ['to_processed_shipment', 'To ship', '/shipment'],
  ['processed_shipment', 'Shipped'],
  ['sold_product', 'Items sold'],
  ['unpaid', 'Unpaid'],
  ['pending_cancellation', 'Cancellation requests'],
  ['pending_return', 'Return requests'],
  ['pending_promotion', 'Scheduled promotions'],
  ['removed_product', 'Removed products'],
];

function Counter({ value, label, to }) {
  const urgent = to && value > 0;
  const content = (
    <>
      <Typography sx={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1.1, color: urgent ? 'primary.main' : 'text.primary', fontVariantNumeric: 'tabular-nums' }}>{value}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{label}</Typography>
    </>
  );
  const sx = { p: 2.5, borderRight: `1px solid ${tokens.line}`, borderBottom: `1px solid ${tokens.line}`, textDecoration: 'none', color: 'inherit', display: 'block' };
  return to ? <Box component={RouterLink} to={to} sx={{ ...sx, '&:hover': { bgcolor: tokens.plumSoft } }}>{content}</Box> : <Box sx={sx}>{content}</Box>;
}

export default function Dashboard() {
  const load = useCallback(async () => {
    const [profile, orders, products] = await Promise.all([getSellerProfile(), getSellerOrders(), getMyProducts()]);
    return { profile, orders, products };
  }, []);
  const { data, loading, error, reload } = useAsync(load);

  if (error) return <ErrorState error={error} title="Your dashboard didn't load" onRetry={reload} />;

  const lowStock = data ? data.products.filter((p) => p.stock < 6).slice(0, 5) : [];

  return (
    <>
      <SellerPageHeader
        title={data ? data.profile.shop_name : 'Dashboard'}
        subtitle="What needs your attention today."
        actions={<Button component={RouterLink} to="/product/create" variant="contained" startIcon={<AddIcon />}>Add product</Button>}
      />

      <Box sx={{ bgcolor: 'background.paper', border: `1px solid ${tokens.line}`, borderRadius: 4, overflow: 'hidden', mb: 4 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, mr: '-1px', mb: '-1px' }}>
          {COUNTERS.map(([key, label, to]) =>
            loading ? (
              <Box key={key} sx={{ p: 2.5, borderRight: `1px solid ${tokens.line}`, borderBottom: `1px solid ${tokens.line}` }}>
                <Skeleton width={40} height={40} /><Skeleton width="60%" />
              </Box>
            ) : (
              <Counter key={key} value={data.profile.todo?.[key] ?? 0} label={label} to={to} />
            ),
          )}
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.4fr 1fr' }, gap: 3 }}>
        <Box sx={{ bgcolor: 'background.paper', border: `1px solid ${tokens.line}`, borderRadius: 4, p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
            <Typography variant="h4" component="h2">Orders to ship</Typography>
            <Link component={RouterLink} to="/shipment">See all</Link>
          </Box>
          {loading ? (
            <Skeleton height={120} />
          ) : data.orders.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 2 }}>You&apos;re all caught up. New orders will show up here.</Typography>
          ) : (
            data.orders.slice(0, 5).map((o) => (
              <Box key={o.id} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, py: 1.5, borderTop: `1px solid ${tokens.line}` }}>
                <Box>
                  <Typography sx={{ fontWeight: 600 }}>{o.product_name}</Typography>
                  <Typography variant="body2" color="text.secondary">Order #{o.order_id}, size {o.size}, qty {o.quantity}</Typography>
                </Box>
                <Typography sx={{ fontWeight: 600 }}>{formatMoney(Number(o.price) * o.quantity)}</Typography>
              </Box>
            ))
          )}
        </Box>

        <Box sx={{ bgcolor: 'background.paper', border: `1px solid ${tokens.line}`, borderRadius: 4, p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
            <Typography variant="h4" component="h2">Running low</Typography>
            <Link component={RouterLink} to="/productlist">All products</Link>
          </Box>
          {loading ? (
            <Skeleton height={120} />
          ) : lowStock.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 2 }}>Every product has at least 6 in stock.</Typography>
          ) : (
            lowStock.map((p) => (
              <Box key={p.id} component={RouterLink} to={`/products/${p.id}`} sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, borderTop: `1px solid ${tokens.line}`, color: 'inherit', textDecoration: 'none', '&:hover span:first-of-type': { textDecoration: 'underline' } }}>
                <span>{p.name}</span>
                <Box component="span" sx={{ fontWeight: 700, color: p.stock === 0 ? 'error.main' : 'text.primary' }}>{p.stock === 0 ? 'Sold out' : `${p.stock} left`}</Box>
              </Box>
            ))
          )}
        </Box>
      </Box>
    </>
  );
}
