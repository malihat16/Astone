import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductPage from './ProductPage';
import { loginAs, renderRoute, rawProduct } from '../test/render';
import { normalizeProduct } from '../lib/product';
import * as productsApi from '../services/products';
import * as ordersApi from '../services/orders';
import * as customerApi from '../services/customer';

vi.mock('../services/products');
vi.mock('../services/orders');
vi.mock('../services/customer');

const product = normalizeProduct(rawProduct({ price: '40.00', original_price: '50.00' }));

beforeEach(() => {
  productsApi.getProduct.mockResolvedValue(product);
  productsApi.getProducts.mockResolvedValue([product]);
  ordersApi.getCart.mockResolvedValue({ cart_items: [], item_count: 0, total_price: 0 });
  customerApi.getMe.mockResolvedValue({ email: 'amy@example.com', first_name: 'Amy', points: 0 });
});

const loginRoute = [{ path: '/login', element: <p>Login page</p> }];

it('shows the sale price and discount', async () => {
  renderRoute(<ProductPage />, { path: '/buyer_products/:id', at: '/buyer_products/1' });
  expect(await screen.findByRole('heading', { level: 1, name: 'Everyday Tee' })).toBeInTheDocument();
  expect(screen.getByText('RM 40.00')).toBeInTheDocument();
  expect(screen.getByText('20% off')).toBeInTheDocument();
});

it('sends logged-out shoppers to log in instead of failing silently', async () => {
  const user = userEvent.setup();
  renderRoute(<ProductPage />, { path: '/buyer_products/:id', at: '/buyer_products/1', extraRoutes: loginRoute });
  await user.click(await screen.findByRole('button', { name: 'Add to bag' }));
  expect(await screen.findByText('Login page')).toBeInTheDocument();
  expect(ordersApi.addToCart).not.toHaveBeenCalled();
});

it('asks for a size, then adds the chosen options and quantity to the bag', async () => {
  const user = userEvent.setup();
  loginAs('customer');
  ordersApi.addToCart.mockResolvedValue({ cart_items: [], item_count: 2, total_price: 80 });
  renderRoute(<ProductPage />, { path: '/buyer_products/:id', at: '/buyer_products/1' });

  await user.click(await screen.findByRole('button', { name: 'Add to bag' }));
  expect(screen.getByText('Choose a size first.')).toBeInTheDocument();

  await user.click(screen.getByRole('radio', { name: 'Large' }));
  await user.click(screen.getByRole('button', { name: 'Increase quantity' }));
  await user.click(screen.getByRole('button', { name: 'Add to bag' }));
  expect(ordersApi.addToCart).toHaveBeenCalledWith(1, { size: 'L', color: '#FF0000', quantity: 2 });
  expect(await screen.findByText('Added to your bag: Everyday Tee')).toBeInTheDocument();
});

it('explains when a product no longer exists', async () => {
  productsApi.getProduct.mockRejectedValue({ response: { status: 404, data: { detail: 'Not found.' } } });
  renderRoute(<ProductPage />, { path: '/buyer_products/:id', at: '/buyer_products/99' });
  expect(await screen.findByText("This product isn't available")).toBeInTheDocument();
});
