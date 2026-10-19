import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Alert, Box, Button, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, TextField, Typography,
} from '@mui/material';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { useAuth, useCart } from '../lib/contexts';
import { errorMessage } from '../lib/api';
import { colorLabel, formatMoney } from '../lib/product';
import { placeOrder } from '../services/orders';
import { pointsDiscount, pointsEarned } from '../lib/points';
import { tokens } from '../theme';
import PageContainer from '../components/layout/PageContainer';
import ProductImage from '../components/ProductImage';
import PageLoader from '../components/states/PageLoader';
import EmptyState from '../components/states/EmptyState';

export default function Checkout() {
  const { customer, setCustomer } = useAuth();
  const cart = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [usePoints, setUsePoints] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [problem, setProblem] = useState('');

  // Pre-fill delivery details from the profile once it has loaded.
  if (!form && customer) {
    setForm({
      recipient: [customer.first_name, customer.last_name].filter(Boolean).join(' '),
      phone: customer.phone_number || '',
      address: customer.address || '',
    });
  }

  if (cart.loading && cart.items.length === 0) return <PageLoader />;
  if (cart.items.length === 0) {
    return (
      <PageContainer>
        <EmptyState headingLevel="h1" icon={<ShoppingBagOutlinedIcon />} title="Your bag is empty" action={<Button component={RouterLink} to="/shop" variant="contained">Browse the shop</Button>}>
          Add something you like, then come back here to check out.
        </EmptyState>
      </PageContainer>
    );
  }

  const values = form || { recipient: '', phone: '', address: '' };
  const discount = pointsDiscount(customer?.points, cart.total, usePoints);
  const total = cart.total - discount;
  const set = (key) => (e) => setForm({ ...values, [key]: e.target.value });

  const review = (e) => {
    e.preventDefault();
    if (!values.address.trim() || !values.recipient.trim()) {
      setProblem('Add who the parcel is for and the delivery address.');
      return;
    }
    setProblem('');
    setConfirming(true);
  };

  const pay = async () => {
    setPlacing(true);
    try {
      const address = [values.recipient, values.phone, values.address].filter((v) => v.trim()).join(', ');
      const result = await placeOrder({ address, pointsToUse: discount });
      setCustomer((c) => (c ? { ...c, points: result.points_balance } : c));
      cart.clear();
      navigate(`/orders/${result.order_id}`, { replace: true, state: { justPlaced: true, cashback: result.cashback } });
    } catch (err) {
      setConfirming(false);
      setProblem(errorMessage(err, "Your order wasn't placed. Please try again."));
      cart.refresh().catch(() => {});
    } finally {
      setPlacing(false);
    }
  };

  return (
    <PageContainer sx={{ pt: { xs: 4, md: 6 } }}>
      <Typography variant="h1" sx={{ mb: 4 }}>Checkout</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr' }, gap: { xs: 4, md: 7 }, alignItems: 'start' }}>
        <Box component="form" onSubmit={review} noValidate>
          <Typography variant="h4" component="h2" sx={{ mb: 2 }}>Delivery</Typography>
          <Box sx={{ display: 'grid', gap: 2 }}>
            <TextField label="Recipient name" required value={values.recipient} onChange={set('recipient')} autoComplete="name" />
            <TextField label="Contact number" value={values.phone} onChange={set('phone')} autoComplete="tel" inputMode="tel" />
            <TextField label="Delivery address" required multiline minRows={3} value={values.address} onChange={set('address')} autoComplete="street-address" />
          </Box>

          <Typography variant="h4" component="h2" sx={{ mt: 5, mb: 1 }}>Points</Typography>
          {customer?.points > 0 ? (
            <FormControlLabel
              control={<Checkbox checked={usePoints} onChange={(e) => setUsePoints(e.target.checked)} />}
              label={`Use ${pointsDiscount(customer.points, cart.total, true)} of your ${customer.points} points to save ${formatMoney(pointsDiscount(customer.points, cart.total, true))}`}
            />
          ) : (
            <Typography color="text.secondary">You&apos;ll earn {pointsEarned(total)} points on this order.</Typography>
          )}

          {problem && <Alert severity="error" sx={{ mt: 3 }}>{problem}</Alert>}
          <Box sx={{ mt: 4 }}>
            <Button type="submit" variant="contained" size="large" sx={{ minWidth: 240 }}>
              Review and pay {formatMoney(total)}
            </Button>
          </Box>
        </Box>

        <Box component="aside" aria-label="Order summary" sx={{ bgcolor: 'background.paper', border: `1px solid ${tokens.line}`, borderRadius: 4, p: 3, position: { md: 'sticky' }, top: { md: 92 } }}>
          <Typography variant="h4" component="h2" sx={{ mb: 1 }}>Your bag</Typography>
          <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
            {cart.items.map((item) => (
              <Box component="li" key={`${item.productId}-${item.size}-${item.color}`} sx={{ display: 'grid', gridTemplateColumns: '56px 1fr auto', gap: 1.5, py: 1.5, borderBottom: `1px solid ${tokens.line}`, alignItems: 'center' }}>
                <ProductImage src={item.product.images[0]} alt="" />
                <Box>
                  <Typography sx={{ fontWeight: 600, fontSize: 15 }}>{item.product.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {colorLabel(item.product, item.color)}, {item.size}, qty {item.quantity}
                  </Typography>
                </Box>
                <Typography sx={{ fontWeight: 600 }}>{formatMoney(item.lineTotal)}</Typography>
              </Box>
            ))}
          </Box>
          <Box component="dl" sx={{ m: 0, mt: 2, display: 'grid', gridTemplateColumns: '1fr auto', rowGap: 1, '& dd': { m: 0, textAlign: 'right' } }}>
            <dt>Subtotal</dt><dd>{formatMoney(cart.total)}</dd>
            <dt>Delivery</dt><dd>Free</dd>
            {discount > 0 && (<><dt>Points</dt><Box component="dd" sx={{ color: tokens.orchid }}>−{formatMoney(discount)}</Box></>)}
            <Box component="dt" sx={{ fontWeight: 700, pt: 1, borderTop: `1px solid ${tokens.line}` }}>Total</Box>
            <Box component="dd" sx={{ fontWeight: 700, pt: 1, borderTop: `1px solid ${tokens.line}` }}>{formatMoney(total)}</Box>
          </Box>
        </Box>
      </Box>

      <Dialog open={confirming} onClose={() => !placing && setConfirming(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm payment</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '1.6rem', fontWeight: 700 }}>{formatMoney(total)}</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Delivering to {values.recipient}, {values.address}.
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>This is a demo store, so no money is taken.</Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setConfirming(false)} disabled={placing} color="inherit">Back</Button>
          <Button variant="contained" onClick={pay} disabled={placing} startIcon={placing ? <CircularProgress size={18} color="inherit" /> : null}>
            {placing ? 'Placing order…' : 'Pay and place order'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
