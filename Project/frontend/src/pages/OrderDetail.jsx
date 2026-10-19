import { useCallback } from 'react';
import { Link as RouterLink, useLocation, useParams } from 'react-router-dom';
import { Alert, Box, Button, Link, Skeleton, Typography } from '@mui/material';
import { getOrder } from '../services/orders';
import { useAsync } from '../lib/useAsync';
import { colorLabel, formatMoney, normalizeProduct } from '../lib/product';
import { orderStatus } from '../lib/orders';
import { tokens } from '../theme';
import PageContainer from '../components/layout/PageContainer';
import ProductImage from '../components/ProductImage';
import ErrorState from '../components/states/ErrorState';
import StatusPill from '../components/StatusPill';

export default function OrderDetail() {
  const { id } = useParams();
  const { state } = useLocation();
  const load = useCallback(() => getOrder(id), [id]);
  const { data: order, loading, error, reload } = useAsync(load);

  if (error) {
    return (
      <PageContainer narrow>
        <ErrorState error={error} title={error.response?.status === 404 ? "We couldn't find that order" : "This order didn't load"} onRetry={error.response?.status === 404 ? undefined : reload} />
      </PageContainer>
    );
  }

  return (
    <PageContainer narrow sx={{ pt: { xs: 4, md: 6 } }}>
      {state?.justPlaced && (
        <Alert severity="success" sx={{ mb: 4 }}>
          Thanks, your order is placed.{state.cashback > 0 && ` You earned ${state.cashback} points.`}
        </Alert>
      )}
      <Link component={RouterLink} to="/orders" color="inherit" sx={{ fontSize: 14 }}>Your orders</Link>
      {loading ? (
        <>
          <Skeleton variant="text" sx={{ fontSize: '3rem' }} width="50%" />
          <Skeleton variant="rounded" height={200} sx={{ mt: 3, borderRadius: 3 }} />
        </>
      ) : (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mt: 1, mb: 1 }}>
            <Typography variant="h1">Order no. {order.id}</Typography>
            <StatusPill status={orderStatus(order)} />
          </Box>
          <Typography color="text.secondary">
            Placed {new Date(order.created_at).toLocaleString('en-MY', { dateStyle: 'long', timeStyle: 'short' })}
          </Typography>

          <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, mt: 4 }}>
            {order.order_items.map((item) => {
              const product = normalizeProduct(item.product);
              return (
                <Box component="li" key={item.id} sx={{ display: 'grid', gridTemplateColumns: '72px 1fr auto', gap: 2, py: 2, borderTop: `1px solid ${tokens.line}`, alignItems: 'center' }}>
                  <ProductImage src={product.images[0]} alt="" />
                  <Box>
                    <Link component={RouterLink} to={`/buyer_products/${product.id}`} color="inherit" sx={{ fontWeight: 600 }}>{product.name}</Link>
                    <Typography variant="body2" color="text.secondary">
                      {colorLabel(product, item.color)}, size {item.size}, qty {item.quantity}
                    </Typography>
                    <Typography variant="body2" sx={{ color: item.is_shipped ? 'success.main' : 'text.secondary', fontWeight: 600 }}>
                      {item.is_shipped ? 'Shipped' : 'Being prepared by the seller'}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 600 }}>{formatMoney(Number(item.price) * item.quantity)}</Typography>
                </Box>
              );
            })}
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { sm: '1fr 1fr' }, gap: 3, borderTop: `1px solid ${tokens.line}`, pt: 3 }}>
            <div>
              <Typography sx={{ fontWeight: 700 }}>Delivering to</Typography>
              <Typography color="text.secondary">{order.address}</Typography>
            </div>
            <Box sx={{ textAlign: { sm: 'right' } }}>
              <Typography sx={{ fontWeight: 700 }}>Total paid</Typography>
              <Typography sx={{ fontSize: '1.4rem', fontWeight: 700 }}>{formatMoney(order.total_price)}</Typography>
            </Box>
          </Box>

          <Box sx={{ mt: 5, p: 3, bgcolor: tokens.plumSoft, borderRadius: 3 }}>
            <Typography sx={{ fontWeight: 700 }}>Need to cancel or return something?</Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Returns are accepted within 30 days of delivery. Contact us with your order number and we&apos;ll sort it out.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button component={RouterLink} to="/support" variant="contained" size="small">Contact support</Button>
              <Button component={RouterLink} to="/returnPolicy" variant="outlined" size="small">Return policy</Button>
            </Box>
          </Box>
        </>
      )}
    </PageContainer>
  );
}
