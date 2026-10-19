import { useCallback, useState } from 'react';
import { Box, Button, Skeleton, Tab, Tabs, Typography } from '@mui/material';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import { getSellerOrders, shipOrderItem } from '../../services/seller';
import { useAsync } from '../../lib/useAsync';
import { useToast } from '../../lib/contexts';
import { errorMessage } from '../../lib/api';
import { formatMoney } from '../../lib/product';
import { tokens } from '../../theme';
import SellerPageHeader from '../../components/layout/SellerPageHeader';
import ColorDot from '../../components/ColorDot';
import ErrorState from '../../components/states/ErrorState';
import EmptyState from '../../components/states/EmptyState';

export default function Shipments() {
  const load = useCallback(() => getSellerOrders({ includeShipped: true }), []);
  const { data: rows, loading, error, reload, setData } = useAsync(load);
  const toast = useToast();
  const [tab, setTab] = useState('toShip');
  const [busyId, setBusyId] = useState(null);

  const ship = async (row) => {
    setBusyId(row.id);
    try {
      await shipOrderItem(row.id);
      setData((list) => list.map((r) => (r.id === row.id ? { ...r, is_shipped: true } : r)));
      toast.success(`Marked order #${row.order_id} as shipped`);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const toShip = (rows || []).filter((r) => !r.is_shipped);
  const shipped = (rows || []).filter((r) => r.is_shipped);
  const visible = tab === 'toShip' ? toShip : shipped;

  return (
    <>
      <SellerPageHeader title="Shipments" subtitle="Pack each item, then mark it as shipped so the shopper can see it's on the way." />
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tab value="toShip" label={`To ship${rows ? ` (${toShip.length})` : ''}`} />
        <Tab value="shipped" label={`Shipped${rows ? ` (${shipped.length})` : ''}`} />
      </Tabs>

      {loading ? (
        Array.from({ length: 3 }, (_, i) => <Skeleton key={i} variant="rounded" height={96} sx={{ mb: 1, borderRadius: 3 }} />)
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : visible.length === 0 ? (
        <EmptyState icon={<LocalShippingOutlinedIcon />} title={tab === 'toShip' ? 'Nothing to ship' : 'No shipped items yet'}>
          {tab === 'toShip' ? "You're all caught up. New orders will appear here." : 'Items you mark as shipped will be listed here.'}
        </EmptyState>
      ) : (
        <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, bgcolor: 'background.paper', border: `1px solid ${tokens.line}`, borderRadius: 4, overflow: 'hidden' }}>
          {visible.map((row, i) => (
            <Box component="li" key={row.id} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr auto' }, gap: 2, alignItems: 'center', p: 2.5, borderTop: i ? `1px solid ${tokens.line}` : 0 }}>
              <Box>
                <Typography sx={{ fontWeight: 700 }}>{row.product_name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                  Order #{row.order_id}, <ColorDot hex={row.color} size={11} /> size {row.size}, qty {row.quantity}, {formatMoney(Number(row.price) * row.quantity)}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>Deliver to: {row.address}</Typography>
              </Box>
              {row.is_shipped ? (
                <Typography sx={{ color: 'success.main', fontWeight: 700 }}>Shipped</Typography>
              ) : (
                <Button variant="contained" onClick={() => ship(row)} disabled={busyId === row.id}>
                  {busyId === row.id ? 'Saving…' : 'Mark as shipped'}
                </Button>
              )}
            </Box>
          ))}
        </Box>
      )}
    </>
  );
}
