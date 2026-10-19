import { useCallback, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, InputAdornment, Link, Skeleton, TextField, Typography,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import { getProduct } from '../../services/products';
import { endPromotion, startPromotion, updateProduct } from '../../services/seller';
import { useAsync } from '../../lib/useAsync';
import { useToast } from '../../lib/contexts';
import { errorMessage } from '../../lib/api';
import { formatMoney, productCode } from '../../lib/product';
import { tokens } from '../../theme';
import SellerPageHeader from '../../components/layout/SellerPageHeader';
import ProductImage from '../../components/ProductImage';
import Price from '../../components/Price';
import ColorDot from '../../components/ColorDot';
import ErrorState from '../../components/states/ErrorState';

const today = () => new Date().toISOString().slice(0, 10);
const formatDate = (d) => new Date(d).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });

function EditDialog({ product, open, onClose, onSaved }) {
  const [v, setV] = useState({ name: product.name, description: product.description, price: product.originalPrice.toFixed(2), stock: String(product.stock) });
  const [problem, setProblem] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (key) => (e) => setV({ ...v, [key]: e.target.value });

  const save = async () => {
    if (!v.name.trim() || !(Number(v.price) > 0) || !(Number(v.stock) >= 0)) {
      setProblem('Name, a price above zero and a stock number are required.');
      return;
    }
    setBusy(true);
    setProblem('');
    try {
      onSaved(await updateProduct(product.id, { name: v.name, description: v.description, price: Number(v.price).toFixed(2), stock: Number(v.stock) }));
    } catch (err) {
      setProblem(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => !busy && onClose()} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>Edit product</DialogTitle>
      <DialogContent sx={{ display: 'grid', gap: 2, pt: '8px !important' }}>
        <TextField label="Product name" value={v.name} onChange={set('name')} inputProps={{ maxLength: 30 }} />
        <TextField label="Description" multiline minRows={3} value={v.description} onChange={set('description')} inputProps={{ maxLength: 100 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <TextField
            label="Regular price"
            type="number"
            value={v.price}
            onChange={set('price')}
            InputProps={{ startAdornment: <InputAdornment position="start">RM</InputAdornment> }}
            helperText={product.promotion ? 'The promotion discount is applied to this.' : undefined}
          />
          <TextField label="Stock" type="number" value={v.stock} onChange={set('stock')} />
        </Box>
        {problem && <Alert severity="error">{problem}</Alert>}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={busy}>Cancel</Button>
        <Button variant="contained" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</Button>
      </DialogActions>
    </Dialog>
  );
}

function PromotionDialog({ product, open, onClose, onChanged }) {
  const [v, setV] = useState({ discount: '', start: today(), end: '' });
  const [problem, setProblem] = useState('');
  const [busy, setBusy] = useState(false);
  const pct = Number(v.discount);
  const preview = pct > 0 && pct < 100 ? product.originalPrice * (1 - pct / 100) : null;
  const running = Boolean(product.promotion);

  const submit = async () => {
    setProblem('');
    if (!running) {
      if (!(pct >= 1 && pct <= 99)) return setProblem('Enter a discount between 1 and 99%.');
      if (!v.end || v.end <= v.start) return setProblem('Choose an end date after the start date.');
    }
    setBusy(true);
    try {
      if (running) await endPromotion(product.promotion.id);
      else {
        await startPromotion({
          productId: product.id,
          discountPercentage: pct,
          startDate: new Date(`${v.start}T00:00:00`).toISOString(),
          endDate: new Date(`${v.end}T23:59:59`).toISOString(),
        });
      }
      await onChanged(running ? 'Promotion ended' : 'Promotion started');
    } catch (err) {
      setProblem(errorMessage(err));
    } finally {
      setBusy(false);
    }
    return undefined;
  };

  return (
    <Dialog open={open} onClose={() => !busy && onClose()} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 700 }}>{running ? 'End this promotion?' : 'Start a promotion'}</DialogTitle>
      <DialogContent sx={{ display: 'grid', gap: 2, pt: '8px !important' }}>
        {running ? (
          <Typography color="text.secondary">
            The price goes back to {formatMoney(product.originalPrice)} straight away.
          </Typography>
        ) : (
          <>
            <TextField label="Discount" type="number" value={v.discount} onChange={(e) => setV({ ...v, discount: e.target.value })} InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} inputProps={{ min: 1, max: 99 }} autoFocus />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField label="Starts" type="date" value={v.start} onChange={(e) => setV({ ...v, start: e.target.value })} InputLabelProps={{ shrink: true }} inputProps={{ min: today() }} />
              <TextField label="Ends" type="date" value={v.end} onChange={(e) => setV({ ...v, end: e.target.value })} InputLabelProps={{ shrink: true }} inputProps={{ min: v.start || today() }} />
            </Box>
            {preview !== null && (
              <Box sx={{ bgcolor: tokens.plumSoft, borderRadius: 2, p: 2 }}>
                <Typography sx={{ fontWeight: 700 }}>Shoppers pay {formatMoney(preview)}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Down from {formatMoney(product.originalPrice)}, saving {formatMoney(product.originalPrice - preview)}.
                </Typography>
              </Box>
            )}
          </>
        )}
        {problem && <Alert severity="error">{problem}</Alert>}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={busy}>Cancel</Button>
        <Button variant="contained" color={running ? 'error' : 'primary'} onClick={submit} disabled={busy}>
          {busy ? 'Saving…' : running ? 'End promotion' : 'Start promotion'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function ProductManage() {
  const { id } = useParams();
  const toast = useToast();
  const load = useCallback(() => getProduct(id), [id]);
  const { data: product, loading, error, reload, setData } = useAsync(load);
  const [dialog, setDialog] = useState(null);
  const [photo, setPhoto] = useState(0);

  if (error) return <ErrorState error={error} title="This product didn't load" onRetry={reload} />;

  return (
    <>
      <Link component={RouterLink} to="/productlist" color="inherit" sx={{ fontSize: 14 }}>Products</Link>
      {loading ? (
        <Box sx={{ mt: 2 }}><Skeleton variant="text" sx={{ fontSize: '2.4rem' }} width="40%" /><Skeleton variant="rounded" height={360} sx={{ mt: 2 }} /></Box>
      ) : (
        <>
          <Box sx={{ mt: 1 }}>
            <SellerPageHeader
              title={product.name}
              subtitle={`${productCode(product.id)}${product.brand ? `, ${product.brand}` : ''}`}
              actions={
                <>
                  <Button variant="outlined" startIcon={<EditOutlinedIcon />} onClick={() => setDialog('edit')}>Edit</Button>
                  <Button variant="contained" color={product.promotion ? 'error' : 'primary'} startIcon={<LocalOfferOutlinedIcon />} onClick={() => setDialog('promo')}>
                    {product.promotion ? 'End promotion' : 'Start promotion'}
                  </Button>
                </>
              }
            />
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '360px 1fr' }, gap: 4, alignItems: 'start' }}>
            <Box>
              <ProductImage src={product.images[photo]} alt={product.name} sx={{ borderRadius: 3 }} />
              {product.images.length > 1 && (
                <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                  {product.images.map((src, i) => (
                    <Box key={src} component="button" type="button" onClick={() => setPhoto(i)} aria-label={`Photo ${i + 1}`} sx={{ p: 0, border: 0, width: 56, cursor: 'pointer', borderRadius: 1.5, outline: i === photo ? `2px solid ${tokens.ink}` : 'none', outlineOffset: 2, background: 'none' }}>
                      <ProductImage src={src} alt="" />
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
            <Box sx={{ bgcolor: 'background.paper', border: `1px solid ${tokens.line}`, borderRadius: 4, p: 3 }}>
              <Price product={product} size="large" />
              {product.promotion && (
                <Alert severity="info" icon={<LocalOfferOutlinedIcon />} sx={{ mt: 2 }}>
                  {Number(product.promotion.discount_percentage)}% off from {formatDate(product.promotion.start_date)} to {formatDate(product.promotion.end_date)}
                </Alert>
              )}
              <Box component="dl" sx={{ m: 0, mt: 3, display: 'grid', gridTemplateColumns: '120px 1fr', rowGap: 1.75, columnGap: 2, '& dt': { color: 'text.secondary' }, '& dd': { m: 0 } }}>
                <dt>Stock</dt><Box component="dd" sx={{ fontWeight: 700, color: product.stock === 0 ? 'error.main' : 'inherit' }}>{product.stock === 0 ? 'Sold out' : product.stock}</Box>
                <dt>For</dt><dd>{product.genderLabel || '—'}</dd>
                <dt>Type</dt><dd>{product.categories.length ? product.categories.map((c) => <Chip key={c} label={c} size="small" sx={{ mr: 0.5 }} />) : '—'}</dd>
                <dt>Sizes</dt><dd>{product.sizes.map((s) => s.value).join(', ') || '—'}</dd>
                <dt>Colours</dt>
                <dd>
                  <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                    {product.colors.map((c) => <Box key={c.name} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}><ColorDot hex={c.hex} />{c.name}</Box>)}
                  </Box>
                </dd>
                <dt>Description</dt><dd>{product.description || '—'}</dd>
              </Box>
              <Button component={RouterLink} to={`/buyer_products/${product.id}`} sx={{ mt: 3, px: 0 }}>See it as shoppers do</Button>
            </Box>
          </Box>

          {dialog === 'edit' && (
            <EditDialog
              product={product}
              open
              onClose={() => setDialog(null)}
              onSaved={(updated) => {
                setData(updated);
                setDialog(null);
                toast.success('Changes saved');
              }}
            />
          )}
          {dialog === 'promo' && (
            <PromotionDialog
              product={product}
              open
              onClose={() => setDialog(null)}
              onChanged={async (message) => {
                setData(await getProduct(id));
                setDialog(null);
                toast.success(message);
              }}
            />
          )}
        </>
      )}
    </>
  );
}
