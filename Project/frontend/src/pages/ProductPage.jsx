import { useCallback, useMemo, useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Alert, Box, Breadcrumbs, Button, ButtonBase, Chip, Link, Skeleton, Typography } from '@mui/material';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { getProduct, getProducts } from '../services/products';
import { useAsync } from '../lib/useAsync';
import { useAuth, useCart, useToast } from '../lib/contexts';
import { errorMessage } from '../lib/api';
import { GENDERS } from '../lib/product';
import { tokens } from '../theme';
import PageContainer from '../components/layout/PageContainer';
import ProductImage from '../components/ProductImage';
import ProductGrid from '../components/ProductGrid';
import Price from '../components/Price';
import ColorDot from '../components/ColorDot';
import QuantityStepper from '../components/QuantityStepper';
import ErrorState from '../components/states/ErrorState';

function Gallery({ product }) {
  const [active, setActive] = useState(0);
  const images = product.images.length ? product.images : [null];
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: images.length > 1 ? { xs: '1fr', sm: '72px 1fr' } : '1fr', gap: 1.5 }}>
      {images.length > 1 && (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'row', sm: 'column' }, gap: 1, order: { xs: 2, sm: 0 }, overflowX: 'auto', p: '4px', m: '-4px' }}>
          {images.map((src, i) => (
            <ButtonBase
              key={src}
              onClick={() => setActive(i)}
              aria-label={`Show photo ${i + 1} of ${images.length}`}
              aria-pressed={i === active}
              sx={{ width: 72, flexShrink: 0, borderRadius: 2, outline: i === active ? `2px solid ${tokens.ink}` : 'none', outlineOffset: 2 }}
            >
              <ProductImage src={src} alt="" sx={{ width: '100%' }} />
            </ButtonBase>
          ))}
        </Box>
      )}
      <ProductImage src={images[active]} alt={product.name} sx={{ borderRadius: 3 }} />
    </Box>
  );
}

function OptionLabel({ children, value }) {
  return (
    <Typography sx={{ fontWeight: 700, mb: 1 }}>
      {children}
      {value && <Box component="span" sx={{ fontWeight: 500, color: 'text.secondary' }}>: {value}</Box>}
    </Typography>
  );
}

function PurchasePanel({ product }) {
  const { isCustomer, isSeller } = useAuth();
  const cart = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [color, setColor] = useState(product.colors.length === 1 ? product.colors[0] : null);
  const [size, setSize] = useState(product.sizes.length === 1 ? product.sizes[0].value : '');
  const [quantity, setQuantity] = useState(1);
  const [problem, setProblem] = useState('');
  const [busy, setBusy] = useState(false);
  const soldOut = product.stock <= 0;

  const add = async () => {
    if (!isCustomer) {
      navigate('/login', { state: { from: location.pathname, reason: 'Log in to add pieces to your bag.' } });
      return;
    }
    const missing = [!color && product.colors.length && 'a colour', !size && 'a size'].filter(Boolean);
    if (missing.length) {
      setProblem(`Choose ${missing.join(' and ')} first.`);
      return;
    }
    setProblem('');
    setBusy(true);
    try {
      await cart.add(product.id, { size, color: color?.hex || color?.name || 'default', quantity });
      toast.success(`Added to your bag: ${product.name}`);
      cart.setOpen(true);
    } catch (err) {
      setProblem(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box>
      {product.brand && <Typography color="text.secondary" sx={{ fontWeight: 600 }}>{product.brand}</Typography>}
      <Typography variant="h2" component="h1" sx={{ mt: 0.5, mb: 1.5 }}>{product.name}</Typography>
      <Price product={product} size="large" />
      {product.onSale && product.promotion?.end_date && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Offer ends {new Date(product.promotion.end_date).toLocaleDateString('en-MY', { day: 'numeric', month: 'long' })}
        </Typography>
      )}

      {product.colors.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <OptionLabel value={color?.name}>Colour</OptionLabel>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }} role="radiogroup" aria-label="Colour">
            {product.colors.map((c) => {
              const selected = color?.name === c.name;
              return (
                <ButtonBase
                  key={c.name}
                  role="radio"
                  aria-checked={selected}
                  aria-label={c.name}
                  onClick={() => setColor(c)}
                  sx={{ p: 0.5, borderRadius: '50%', border: `2px solid ${selected ? tokens.ink : 'transparent'}` }}
                >
                  <ColorDot hex={c.hex} size={30} />
                </ButtonBase>
              );
            })}
          </Box>
        </Box>
      )}

      {product.sizes.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <OptionLabel>Size</OptionLabel>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }} role="radiogroup" aria-label="Size">
            {product.sizes.map((s) => {
              const selected = size === s.value;
              return (
                <ButtonBase
                  key={s.value}
                  role="radio"
                  aria-checked={selected}
                  aria-label={s.label}
                  onClick={() => setSize(s.value)}
                  sx={{
                    minWidth: 52,
                    height: 44,
                    px: 1.5,
                    borderRadius: 2,
                    fontWeight: 700,
                    border: `1px solid ${selected ? tokens.ink : tokens.line}`,
                    bgcolor: selected ? tokens.ink : 'background.paper',
                    color: selected ? '#fff' : 'text.primary',
                  }}
                >
                  {s.value === 'NA' ? 'One size' : s.value}
                </ButtonBase>
              );
            })}
          </Box>
        </Box>
      )}

      <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <QuantityStepper value={quantity} onChange={setQuantity} min={1} max={Math.max(1, Math.min(10, product.stock))} disabled={soldOut} />
        <Typography variant="body2" color={product.stock > 0 && product.stock < 6 ? 'error' : 'text.secondary'}>
          {soldOut ? 'Sold out' : product.stock < 6 ? `Only ${product.stock} left` : 'In stock'}
        </Typography>
      </Box>

      {problem && <Alert severity="warning" sx={{ mt: 2 }}>{problem}</Alert>}

      <Button
        variant="contained"
        size="large"
        fullWidth
        startIcon={<ShoppingBagOutlinedIcon />}
        onClick={add}
        disabled={busy || soldOut || isSeller}
        sx={{ mt: 3, minHeight: 52 }}
      >
        {soldOut ? 'Sold out' : isSeller ? 'Log in as a shopper to buy' : busy ? 'Adding…' : 'Add to bag'}
      </Button>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
        Free delivery in Malaysia. Returns within 30 days.
      </Typography>

      {product.description && (
        <Box sx={{ mt: 4, pt: 3, borderTop: `1px solid ${tokens.line}` }}>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>Details</Typography>
          <Typography color="text.secondary">{product.description}</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
            {product.genderLabel && <Chip label={product.genderLabel} size="small" component={RouterLink} to={GENDERS[product.gender].path} clickable />}
            {product.categories.map((c) => <Chip key={c} label={c} size="small" variant="outlined" />)}
          </Box>
        </Box>
      )}
    </Box>
  );
}

function Related({ product }) {
  const load = useCallback(() => getProducts({ gender: product.gender || undefined }), [product.gender]);
  const { data } = useAsync(load);
  const related = useMemo(() => (data || []).filter((p) => p.id !== product.id).slice(0, 4), [data, product.id]);
  if (!related.length) return null;
  return (
    <Box component="section" sx={{ mt: 10 }}>
      <Typography variant="h2" sx={{ mb: 3 }}>{product.genderLabel ? `More for ${product.genderLabel.toLowerCase()}` : 'You might also like'}</Typography>
      <ProductGrid products={related} />
    </Box>
  );
}

export default function ProductPage() {
  const { id } = useParams();
  const load = useCallback(() => getProduct(id), [id]);
  const { data: product, loading, error, reload } = useAsync(load);

  if (error) {
    const notFound = error.response?.status === 404;
    return (
      <PageContainer>
        <ErrorState error={error} title={notFound ? "This product isn't available" : "This product didn't load"} onRetry={notFound ? undefined : reload} />
        {notFound && <Box sx={{ textAlign: 'center' }}><Button component={RouterLink} to="/shop" variant="contained">Browse the shop</Button></Box>}
      </PageContainer>
    );
  }

  return (
    <PageContainer sx={{ pt: 3 }}>
      <Breadcrumbs sx={{ mb: 3, fontSize: 14 }}>
        <Link component={RouterLink} to="/" color="inherit">Home</Link>
        {product?.gender && <Link component={RouterLink} to={GENDERS[product.gender].path} color="inherit">{product.genderLabel}</Link>}
        <Typography color="text.primary" sx={{ fontSize: 14 }}>{product?.name || '…'}</Typography>
      </Breadcrumbs>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.15fr 1fr' }, gap: { xs: 4, md: 8 }, alignItems: 'start' }}>
        {loading ? (
          <>
            <Skeleton variant="rounded" sx={{ aspectRatio: '4 / 5', height: 'auto', borderRadius: 3 }} />
            <Box>
              <Skeleton width="30%" />
              <Skeleton variant="text" sx={{ fontSize: '2.4rem' }} width="80%" />
              <Skeleton width="25%" />
              <Skeleton variant="rounded" height={44} sx={{ mt: 4 }} />
              <Skeleton variant="rounded" height={52} sx={{ mt: 3 }} />
            </Box>
          </>
        ) : (
          <>
            <Box sx={{ position: { md: 'sticky' }, top: { md: 92 } }}>
              <Gallery product={product} />
            </Box>
            <PurchasePanel key={product.id} product={product} />
          </>
        )}
      </Box>
      {product && <Related product={product} />}
    </PageContainer>
  );
}
