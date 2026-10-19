import { useMemo } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from './theme';
import routes from './routes';
import AuthProvider from './components/providers/AuthProvider';
import CartProvider from './components/providers/CartProvider';
import ToastProvider from './components/providers/ToastProvider';

export default function App() {
  const router = useMemo(() => createBrowserRouter(routes), []);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <RouterProvider router={router} />
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
