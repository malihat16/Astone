import { useCallback, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Skeleton, Tooltip, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckroomOutlinedIcon from '@mui/icons-material/CheckroomOutlined';
import { deleteProduct, getMyProducts } from '../../services/seller';
import { useAsync } from '../../lib/useAsync';
import { useToast } from '../../lib/contexts';
import { errorMessage } from '../../lib/api';
import { productCode } from '../../lib/product';
import { tokens } from '../../theme';
import SellerPageHeader from '../../components/layout/SellerPageHeader';
import ProductImage from '../../components/ProductImage';
import Price from '../../components/Price';
import ErrorState from '../../components/states/ErrorState';
import EmptyState from '../../components/states/EmptyState';

export default function Products() {
  const load = useCallback(() => getMyProducts(), []);
  const { data: products, loading, error, reload, setData } = useAsync(load);
  const toast = useToast();
  const [removing, setRemoving] = useState(null);
  const [busy, setBusy] = useState(false);

  const confirmRemove = async () => {
    setBusy(true);
    try {
      await deleteProduct(removing.id);
      setData((list) => list.filter((p) => p.id !== removing.id));
      toast.success(`Removed ${removing.name}`);
      setRemoving(null);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const addButton = <Button component={RouterLink} to="/product/create" variant="contained" startIcon={<AddIcon />}>Add product</Button>;

  return (
    <>
      <SellerPageHeader
        title="Products"
        subtitle={products ? `${products.length} listed in your shop` : 'Everything listed in your shop'}
        actions={addButton}
      />
      {loading ? (
        Array.from({ length: 4 }, (_, i) => <Skeleton key={i} variant="rounded" height={84} sx={{ mb: 1, borderRadius: 3 }} />)
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : products.length === 0 ? (
        <EmptyState icon={<CheckroomOutlinedIcon />} title="No products yet" action={addButton}>
          Add your first piece with photos, sizes and stock. It goes live as soon as you save it.
        </EmptyState>
      ) : (
        <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, bgcolor: 'background.paper', border: `1px solid ${tokens.line}`, borderRadius: 4, overflow: 'hidden' }}>
          {products.map((p, i) => (
            <Box component="li" key={p.id} sx={{ display: 'grid', gridTemplateColumns: { xs: '56px 1fr auto', sm: '64px 1.6fr 1fr 90px 48px' }, gap: 2, alignItems: 'center', px: 2, py: 1.5, borderTop: i ? `1px solid ${tokens.line}` : 0 }}>
              <ProductImage src={p.images[0]} alt="" />
              <Box sx={{ minWidth: 0 }}>
                <Typography component={RouterLink} to={`/products/${p.id}`} sx={{ fontWeight: 600, color: 'inherit', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                  {p.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">{productCode(p.id)}{p.onSale ? ', on promotion' : ''}</Typography>
              </Box>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}><Price product={p} /></Box>
              <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 600, color: p.stock === 0 ? 'error.main' : 'text.primary' }}>
                {p.stock === 0 ? 'Sold out' : `${p.stock} in stock`}
              </Typography>
              <Tooltip title="Remove product">
                <IconButton onClick={() => setRemoving(p)} aria-label={`Remove ${p.name}`}>
                  <DeleteOutlineIcon />
                </IconButton>
              </Tooltip>
            </Box>
          ))}
        </Box>
      )}

      <Dialog open={Boolean(removing)} onClose={() => !busy && setRemoving(null)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Remove {removing?.name}?</DialogTitle>
        <DialogContent>
          <DialogContentText>It will disappear from the shop straight away. This can&apos;t be undone.</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRemoving(null)} color="inherit" disabled={busy}>Keep it</Button>
          <Button onClick={confirmRemove} color="error" variant="contained" disabled={busy}>{busy ? 'Removing…' : 'Remove product'}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
