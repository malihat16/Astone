import { useState } from 'react';
import { Link as RouterLink, NavLink, useNavigate } from 'react-router-dom';
import {
  Badge, Box, Button, Divider, Drawer, IconButton, InputBase, List, ListItemButton, ListItemText, Menu, MenuItem, Tooltip,
} from '@mui/material';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { useAuth, useCart } from '../../lib/contexts';
import { tokens } from '../../theme';
import PageContainer from './PageContainer';
import Wordmark from './Wordmark';

const NAV = [
  { label: 'Men', to: '/men' },
  { label: 'Women', to: '/women' },
  { label: 'Unisex', to: '/unisex' },
  { label: 'Compare', to: '/compare' },
];

const navLinkSx = {
  textDecoration: 'none',
  color: 'text.secondary',
  fontWeight: 600,
  fontSize: '0.95rem',
  py: 0.5,
  borderBottom: '2px solid transparent',
  '&:hover': { color: 'text.primary' },
  '&.active': { color: 'text.primary', borderBottomColor: tokens.ink },
};

function SearchBox({ onDone }) {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const submit = (e) => {
    e.preventDefault();
    navigate(q.trim() ? `/shop?q=${encodeURIComponent(q.trim())}` : '/shop');
    onDone?.();
  };
  return (
    <Box
      component="form"
      role="search"
      onSubmit={submit}
      sx={{ display: 'flex', alignItems: 'center', bgcolor: 'background.paper', border: `1px solid ${tokens.line}`, borderRadius: 999, pl: 2, pr: 0.5, height: 40, width: { xs: '100%', md: 280 } }}
    >
      <InputBase
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search tees, brands…"
        inputProps={{ 'aria-label': 'Search products' }}
        sx={{ flex: 1, fontSize: '0.95rem' }}
      />
      <IconButton type="submit" size="small" aria-label="Search">
        <SearchIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}

function AccountButton() {
  const { isCustomer, isSeller, customer, logout } = useAuth();
  const [anchor, setAnchor] = useState(null);
  const navigate = useNavigate();

  if (isSeller) {
    return (
      <Button component={RouterLink} to="/sellerDashboard" variant="outlined" size="small">
        Seller Centre
      </Button>
    );
  }
  if (!isCustomer) {
    return (
      <Button component={RouterLink} to="/login" variant="outlined" size="small" startIcon={<PersonOutlineIcon />}>
        Log in
      </Button>
    );
  }
  const close = () => setAnchor(null);
  return (
    <>
      <Button
        onClick={(e) => setAnchor(e.currentTarget)}
        variant="outlined"
        size="small"
        aria-haspopup="menu"
        aria-expanded={Boolean(anchor)}
        startIcon={<PersonOutlineIcon />}
      >
        {customer?.first_name || 'Account'}
      </Button>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={close} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <MenuItem disabled sx={{ opacity: '1 !important', fontSize: 14 }}>
          {customer?.points ?? 0} points to spend
        </MenuItem>
        <Divider />
        <MenuItem component={RouterLink} to="/orders" onClick={close}>Your orders</MenuItem>
        <MenuItem component={RouterLink} to="/settings" onClick={close}>Account settings</MenuItem>
        <MenuItem
          onClick={() => {
            close();
            logout();
            navigate('/');
          }}
        >
          Log out
        </MenuItem>
      </Menu>
    </>
  );
}

export default function Header() {
  const { isCustomer } = useAuth();
  const cart = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Box component="header" sx={{ position: 'sticky', top: 0, zIndex: 1100, bgcolor: 'rgba(246,245,248,0.92)', backdropFilter: 'blur(10px)', borderBottom: `1px solid ${tokens.line}` }}>
      <PageContainer sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 4 }, height: 68 }}>
        <IconButton sx={{ display: { md: 'none' }, ml: -1 }} onClick={() => setMenuOpen(true)} aria-label="Open menu">
          <MenuIcon />
        </IconButton>
        <Wordmark />
        <Box component="nav" aria-label="Shop" sx={{ display: { xs: 'none', md: 'flex' }, gap: 3, ml: 2 }}>
          {NAV.map((item) => (
            <Box key={item.to} component={NavLink} to={item.to} sx={navLinkSx}>
              {item.label}
            </Box>
          ))}
        </Box>
        <Box sx={{ flex: 1 }} />
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          {searchOpen ? (
            <SearchBox onDone={() => setSearchOpen(false)} />
          ) : (
            <Tooltip title="Search">
              <IconButton onClick={() => setSearchOpen(true)} aria-label="Search">
                <SearchIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        <Tooltip title={isCustomer ? 'Your bag' : 'Log in to use your bag'}>
          <IconButton onClick={() => cart.setOpen(true)} aria-label={`Bag, ${cart.count} items`}>
            <Badge badgeContent={cart.count} color="primary" max={99}>
              <ShoppingBagOutlinedIcon />
            </Badge>
          </IconButton>
        </Tooltip>
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          <AccountButton />
        </Box>
      </PageContainer>

      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} PaperProps={{ sx: { width: 300, p: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Wordmark size={22} />
          <IconButton onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <CloseIcon />
          </IconButton>
        </Box>
        <SearchBox onDone={() => setMenuOpen(false)} />
        <List sx={{ mt: 1 }} onClick={() => setMenuOpen(false)}>
          {[...NAV, { label: 'Shop everything', to: '/shop' }].map((item) => (
            <ListItemButton key={item.to} component={NavLink} to={item.to} sx={{ borderRadius: 2 }}>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 700, fontSize: 18 }} />
            </ListItemButton>
          ))}
        </List>
        <Divider sx={{ my: 1 }} />
        <Box sx={{ p: 1 }} onClick={() => setMenuOpen(false)}>
          <AccountButton />
        </Box>
      </Drawer>
    </Box>
  );
}
