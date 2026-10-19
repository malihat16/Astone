import { useCallback, useMemo } from 'react';
import { Box, Skeleton, Typography } from '@mui/material';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import { getSellerOrders } from '../../services/seller';
import { useAsync } from '../../lib/useAsync';
import { formatMoney } from '../../lib/product';
import { summarizeSales } from '../../lib/finance';
import { tokens } from '../../theme';
import SellerPageHeader from '../../components/layout/SellerPageHeader';
import ErrorState from '../../components/states/ErrorState';
import EmptyState from '../../components/states/EmptyState';

export default function Finance() {
  const load = useCallback(() => getSellerOrders({ includeShipped: true }), []);
  const { data: rows, loading, error, reload } = useAsync(load);
  const summary = useMemo(() => summarizeSales(rows || []), [rows]);

  if (error) return <ErrorState error={error} onRetry={reload} />;

  const stats = [
    ['Total sales', formatMoney(summary.revenue)],
    ['Orders', summary.orders],
    ['Items sold', summary.items],
    ['Average order', formatMoney(summary.averageOrder)],
  ];

  return (
    <>
      <SellerPageHeader title="Finance" subtitle="Sales from every order placed in your shop, before fees." />
      <Box sx={{ bgcolor: 'background.paper', border: `1px solid ${tokens.line}`, borderRadius: 4, overflow: 'hidden', mb: 4 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, mr: '-1px', mb: '-1px' }}>
          {stats.map(([label, value]) => (
            <Box key={label} sx={{ p: 2.5, borderRight: `1px solid ${tokens.line}`, borderBottom: `1px solid ${tokens.line}` }}>
              {loading ? <Skeleton width="70%" height={40} /> : <Typography sx={{ fontSize: '1.7rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{value}</Typography>}
              <Typography variant="body2" color="text.secondary">{label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Typography variant="h4" component="h2" sx={{ mb: 2 }}>Best sellers</Typography>
      {loading ? (
        <Skeleton variant="rounded" height={160} />
      ) : summary.byProduct.length === 0 ? (
        <EmptyState icon={<AccountBalanceWalletOutlinedIcon />} title="No sales yet" compact>
          Once shoppers buy from you, your sales will be summarised here.
        </EmptyState>
      ) : (
        <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', bgcolor: 'background.paper', border: `1px solid ${tokens.line}`, borderRadius: 4, overflow: 'hidden', '& th, & td': { textAlign: 'left', p: 2, borderTop: `1px solid ${tokens.line}` }, '& thead th': { borderTop: 0, color: 'text.secondary', fontWeight: 600, fontSize: 14 }, '& .num': { textAlign: 'right', fontVariantNumeric: 'tabular-nums' } }}>
          <thead>
            <tr><th>Product</th><th className="num">Items sold</th><th className="num">Sales</th></tr>
          </thead>
          <tbody>
            {summary.byProduct.map((p) => (
              <tr key={p.name}>
                <td>{p.name}</td>
                <td className="num">{p.items}</td>
                <Box component="td" className="num" sx={{ fontWeight: 700 }}>{formatMoney(p.revenue)}</Box>
              </tr>
            ))}
          </tbody>
        </Box>
      )}
    </>
  );
}
