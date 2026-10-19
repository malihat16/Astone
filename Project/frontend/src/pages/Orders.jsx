import { useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Skeleton, Typography } from '@mui/material';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import { getOrders } from '../services/orders';
import { useAsync } from '../lib/useAsync';
import { formatMoney } from '../lib/product';
import { orderStatus } from '../lib/orders';
import { tokens } from '../theme';
import PageContainer from '../components/layout/PageContainer';
import ErrorState from '../components/states/ErrorState';
import EmptyState from '../components/states/EmptyState';
import StatusPill from '../components/StatusPill';

export default function Orders() {
  const load = useCallback(() => getOrders(), []);
  const { data: orders, loading, error, reload } = useAsync(load);

  return (
    <PageContainer narrow sx={{ pt: { xs: 4, md: 6 } }}>
      <Typography variant="h1" sx={{ mb: 4 }}>Your orders</Typography>
      {loading ? (
        Array.from({ length: 3 }, (_, i) => <Skeleton key={i} variant="rounded" height={88} sx={{ mb: 1.5, borderRadius: 3 }} />)
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : orders.length === 0 ? (
        <EmptyState icon={<ReceiptLongOutlinedIcon />} title="No orders yet" action={<Button component={RouterLink} to="/shop" variant="contained">Start shopping</Button>}>
          Orders you place will appear here so you can follow their progress.
        </EmptyState>
      ) : (
        <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
          {orders.map((order) => {
            const items = order.order_items.reduce((n, i) => n + i.quantity, 0);
            return (
              <Box component="li" key={order.id}>
                <Box
                  component={RouterLink}
                  to={`/orders/${order.id}`}
                  sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr auto', sm: '1fr auto auto' }, gap: 2, alignItems: 'center', py: 2.5, borderTop: `1px solid ${tokens.line}`, textDecoration: 'none', color: 'inherit', '&:hover .ref': { textDecoration: 'underline' } }}
                >
                  <Box>
                    <Typography className="ref" sx={{ fontWeight: 700 }}>Order #{order.id}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(order.created_at).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}, {items} {items === 1 ? 'item' : 'items'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: { xs: 'none', sm: 'block' } }}><StatusPill status={orderStatus(order)} /></Box>
                  <Typography sx={{ fontWeight: 700 }}>{formatMoney(order.total_price)}</Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </PageContainer>
  );
}
