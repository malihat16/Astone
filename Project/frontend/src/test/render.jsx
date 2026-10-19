import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import theme from '../theme';
import AuthProvider from '../components/providers/AuthProvider';
import CartProvider from '../components/providers/CartProvider';
import ToastProvider from '../components/providers/ToastProvider';

/** Render a page inside the real providers and an in-memory router. */
export function renderRoute(element, { path = '/', at = path, extraRoutes = [] } = {}) {
  const router = createMemoryRouter(
    [{ path, element }, ...extraRoutes, { path: '*', element: <p>Other page</p> }],
    { initialEntries: [at] },
  );
  const utils = render(
    <ThemeProvider theme={theme}>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <RouterProvider router={router} />
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>,
  );
  return { ...utils, router };
}

export function loginAs(role) {
  localStorage.setItem('access', 'test-access');
  localStorage.setItem('refresh', 'test-refresh');
  localStorage.setItem('role', role);
}

export const rawProduct = (overrides = {}) => ({
  id: 1,
  name: 'Everyday Tee',
  description: 'Cotton tee',
  category: 'Top',
  colors: [{ name: 'Red', hex: '#FF0000' }],
  sizes: [{ value: 'M', label: 'Medium' }, { value: 'L', label: 'Large' }],
  currency: 'MYR',
  price: '50.00',
  original_price: '50.00',
  stock: 10,
  rating: 4,
  brand: 'Astoné Basics',
  gender: 'U',
  images: [{ image_url: '/media/images/tee.jpg' }],
  promotions: null,
  seller: 1,
  ...overrides,
});
