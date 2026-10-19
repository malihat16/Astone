import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Button, Drawer, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { useAuth, useCart, useToast } from '../lib/contexts';
import { errorMessage } from '../lib/api';
import { colorLabel, formatMoney } from '../lib/product';
import { tokens } from '../theme';
import ProductImage from './ProductImage';
import QuantityStepper from './QuantityStepper';
import ColorDot from './ColorDot';
import EmptyState from './states/EmptyState';

function CartLine({ item }) {
  const cart = useCart();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const change = async (quantity) => {
    setBusy(true);
    try {
      await cart.setQuantity(item, quantity);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box component="li" sx={{ display: 'grid', gridTemplateColumns: '76px 1fr', gap: 2, py: 2, borderBottom: `1px solid ${tokens.line}` }}>
      <Box component={RouterLink} to={`/buyer_products/${item.productId}`} onClick={() => cart.setOpen(false)}>
        <ProductImage src={item.product.images[0]} alt={item.product.name} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
          <Typography sx={{ fontWeight: 600, lineHeight: 1.3 }}>{item.product.name}</Typography>
          <Typography sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{formatMoney(item.lineTotal)}</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5 }}>
          <ColorDot hex={item.color} size={11} />
          {colorLabel(item.product, item.color)}, size {item.size}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1.25 }}>
          <QuantityStepper value={item.quantity} min={0} max={item.product.stock} onChange={change} disabled={busy} />
          <Button size="small" color="inherit" onClick={() => change(0)} disabled={busy} sx={{ color: 'text.secondary' }}>
            Remove
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default function CartDrawer() {
  const cart = useCart();
  const { isCustomer } = useAuth();
  const navigate = useNavigate();
  const close = () => cart.setOpen(false);
  const go = (path) => {
    close();
    navigate(path);
  };

  return (
    <Drawer anchor="right" open={cart.open} onClose={close} PaperProps={{ sx: { width: { xs: '100%', sm: 440 }, display: 'flex', flexDirection: 'column' } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2, borderBottom: `1px solid ${tokens.line}` }}>
        <Typography variant="h4" component="h2">
          Your bag{cart.count > 0 && ` (${cart.count})`}
        </Typography>
        <IconButton onClick={close} aria-label="Close bag">
          <CloseIcon />
        </IconButton>
      </Box>

      {!isCustomer ? (
        <EmptyState
          icon={<ShoppingBagOutlinedIcon />}
          title="Log in to use your bag"
          action={<Button variant="contained" onClick={() => go('/login')}>Log in</Button>}
        >
          Your bag is saved to your account, so it&apos;s there on any device.
        </EmptyState>
      ) : cart.items.length === 0 ? (
        <EmptyState
          icon={<ShoppingBagOutlinedIcon />}
          title="Your bag is empty"
          action={<Button variant="contained" onClick={() => go('/shop')}>Browse the shop</Button>}
        >
          Pieces you add will show up here.
        </EmptyState>
      ) : (
        <>
          <Box component="ul" sx={{ listStyle: 'none', m: 0, px: 3, flex: 1, overflowY: 'auto' }}>
            {cart.items.map((item) => (
              <CartLine key={`${item.productId}-${item.size}-${item.color}`} item={item} />
            ))}
          </Box>
          <Box sx={{ px: 3, py: 2.5, borderTop: `1px solid ${tokens.line}`, bgcolor: 'background.paper' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography sx={{ fontWeight: 700 }}>Subtotal</Typography>
              <Typography sx={{ fontWeight: 700 }}>{formatMoney(cart.total)}</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Free delivery in Malaysia. You can spend points at checkout.
            </Typography>
            <Button variant="contained" fullWidth size="large" onClick={() => go('/checkout')}>
              Check out
            </Button>
          </Box>
        </>
      )}
    </Drawer>
  );
}
