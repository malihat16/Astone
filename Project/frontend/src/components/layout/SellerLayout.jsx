import { Suspense, useState } from 'react';
import { NavLink, Outlet, ScrollRestoration, useNavigate } from 'react-router-dom';
import { Box, Button, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';
import CheckroomOutlinedIcon from '@mui/icons-material/CheckroomOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../../lib/contexts';
import { tokens } from '../../theme';
import Wordmark from './Wordmark';
import PageLoader from '../states/PageLoader';

const NAV = [
  { label: 'Dashboard', to: '/sellerDashboard', icon: <SpaceDashboardOutlinedIcon /> },
  { label: 'Products', to: '/productlist', icon: <CheckroomOutlinedIcon /> },
  { label: 'Shipments', to: '/shipment', icon: <LocalShippingOutlinedIcon /> },
  { label: 'Finance', to: '/finance', icon: <AccountBalanceWalletOutlinedIcon /> },
  { label: 'Shop profile', to: '/sellerProfile', icon: <StorefrontOutlinedIcon /> },
  { label: 'Seller FAQ', to: '/faq', icon: <HelpOutlineIcon /> },
];

function SideNav({ onNavigate }) {
  return (
    <List component="nav" aria-label="Seller Centre" sx={{ px: 1.5 }}>
      {NAV.map((item) => (
        <ListItemButton
          key={item.to}
          component={NavLink}
          to={item.to}
          onClick={onNavigate}
          sx={{
            borderRadius: 2,
            mb: 0.5,
            color: 'text.secondary',
            '&.active': { bgcolor: tokens.plumSoft, color: 'primary.dark', '& .MuiListItemIcon-root': { color: 'primary.main' } },
          }}
        >
          <ListItemIcon sx={{ minWidth: 38, color: 'inherit' }}>{item.icon}</ListItemIcon>
          <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600 }} />
        </ListItemButton>
      ))}
    </List>
  );
}

/** Quieter, work-focused frame for the Seller Centre. */
export default function SellerLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '248px 1fr' }, bgcolor: tokens.paper }}>
      <Box component="aside" sx={{ display: { xs: 'none', md: 'block' }, borderRight: `1px solid ${tokens.line}`, bgcolor: 'background.paper', position: 'sticky', top: 0, height: '100vh' }}>
        <Box sx={{ px: 3, py: 3 }}>
          <Wordmark to="/sellerDashboard" suffix="Seller Centre" size={24} stacked />
        </Box>
        <SideNav />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Box component="header" sx={{ display: 'flex', alignItems: 'center', gap: 1, px: { xs: 2, md: 4 }, height: 64, borderBottom: `1px solid ${tokens.line}`, bgcolor: 'background.paper' }}>
          <IconButton sx={{ display: { md: 'none' } }} onClick={() => setOpen(true)} aria-label="Open menu">
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: { md: 'none' } }}>
            <Wordmark to="/sellerDashboard" size={20} />
          </Box>
          <Box sx={{ flex: 1 }} />
          <Button href="/" target="_blank" rel="noopener" size="small" color="inherit">
            View shop
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              logout();
              navigate('/sell');
            }}
          >
            Log out
          </Button>
        </Box>
        <Box component="main" sx={{ px: { xs: 2, md: 4 }, py: { xs: 3, md: 4 }, maxWidth: 1180 }}>
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </Box>
      </Box>
      <Drawer open={open} onClose={() => setOpen(false)} PaperProps={{ sx: { width: 270, bgcolor: 'background.paper' } }}>
        <Box sx={{ px: 3, py: 3 }}>
          <Wordmark to="/sellerDashboard" suffix="Seller Centre" size={22} stacked />
        </Box>
        <SideNav onNavigate={() => setOpen(false)} />
      </Drawer>
      <ScrollRestoration />
    </Box>
  );
}
