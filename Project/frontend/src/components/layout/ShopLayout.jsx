import { Suspense } from 'react';
import { Box } from '@mui/material';
import { Outlet, ScrollRestoration } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from '../CartDrawer';
import HelpDial from '../HelpDial';
import PageLoader from '../states/PageLoader';

/** Every shopper-facing page shares this header, footer, bag drawer and help button. */
export default function ShopLayout() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <a href="#main" className="visually-hidden">Skip to content</a>
      <Header />
      <Box component="main" id="main" sx={{ flex: 1 }}>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </Box>
      <Footer />
      <CartDrawer />
      <HelpDial />
      <ScrollRestoration />
    </Box>
  );
}
