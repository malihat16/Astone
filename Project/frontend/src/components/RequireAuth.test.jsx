import { screen } from '@testing-library/react';
import RequireAuth from './RequireAuth';
import { loginAs, renderRoute } from '../test/render';
import * as customerApi from '../services/customer';

vi.mock('../services/customer');
vi.mock('../services/orders', () => ({ getCart: vi.fn().mockResolvedValue({ cart_items: [] }) }));

const routes = [
  { path: '/login', element: <p>Customer login</p> },
  { path: '/loginSeller', element: <p>Seller login</p> },
];

it('sends logged-out visitors to the customer login', async () => {
  renderRoute(<RequireAuth role="customer"><p>Secret orders</p></RequireAuth>, { path: '/orders', extraRoutes: routes });
  expect(await screen.findByText('Customer login')).toBeInTheDocument();
  expect(screen.queryByText('Secret orders')).not.toBeInTheDocument();
});

it('keeps a shopper out of the Seller Centre', async () => {
  loginAs('customer');
  customerApi.getMe.mockResolvedValue({ email: 'a@b.co', points: 0 });
  renderRoute(<RequireAuth role="seller"><p>Dashboard</p></RequireAuth>, { path: '/sellerDashboard', extraRoutes: routes });
  expect(await screen.findByText('Seller login')).toBeInTheDocument();
});

it('lets the right role through', async () => {
  loginAs('seller');
  renderRoute(<RequireAuth role="seller"><p>Dashboard</p></RequireAuth>, { path: '/sellerDashboard', extraRoutes: routes });
  expect(await screen.findByText('Dashboard')).toBeInTheDocument();
});
