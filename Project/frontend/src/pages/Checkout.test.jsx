import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Checkout from './Checkout';
import { loginAs, renderRoute, rawProduct } from '../test/render';
import * as ordersApi from '../services/orders';
import * as customerApi from '../services/customer';

vi.mock('../services/orders');
vi.mock('../services/customer');

const cart = {
  cart_items: [{ product_id: 1, product: rawProduct(), size: 'M', color: '#FF0000', quantity: 2, price: 50, total_price: 100 }],
  item_count: 2,
  total_price: 100,
};

beforeEach(() => {
  loginAs('customer');
  ordersApi.getCart.mockResolvedValue(cart);
  customerApi.getMe.mockResolvedValue({ email: 'amy@example.com', first_name: 'Amy', last_name: 'Tan', address: '1 Jalan Ampang', phone_number: '', points: 30 });
});

it('applies points and places the order with them', async () => {
  const user = userEvent.setup();
  ordersApi.placeOrder.mockResolvedValue({ order_id: 7, cashback: 7, points_balance: 7 });
  renderRoute(<Checkout />, { path: '/checkout', extraRoutes: [{ path: '/orders/:id', element: <p>Order page</p> }] });

  expect(await screen.findByDisplayValue('1 Jalan Ampang')).toBeInTheDocument();
  await user.click(screen.getByLabelText(/Use 30 of your 30 points/));
  expect(screen.getByRole('button', { name: 'Review and pay RM 70.00' })).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: /Review and pay/ }));
  await user.click(await screen.findByRole('button', { name: 'Pay and place order' }));
  expect(ordersApi.placeOrder).toHaveBeenCalledWith({ address: 'Amy Tan, 1 Jalan Ampang', pointsToUse: 30 });
  expect(await screen.findByText('Order page')).toBeInTheDocument();
});

it('needs a delivery address', async () => {
  const user = userEvent.setup();
  customerApi.getMe.mockResolvedValue({ email: 'amy@example.com', first_name: 'Amy', points: 0 });
  renderRoute(<Checkout />, { path: '/checkout' });
  await user.click(await screen.findByRole('button', { name: /Review and pay/ }));
  expect(screen.getByText('Add who the parcel is for and the delivery address.')).toBeInTheDocument();
  expect(ordersApi.placeOrder).not.toHaveBeenCalled();
});

it('shows the server reason when an order fails', async () => {
  const user = userEvent.setup();
  ordersApi.placeOrder.mockRejectedValue({ response: { status: 400, data: { detail: 'Sorry, only 1 of "Everyday Tee" left in stock.' } } });
  renderRoute(<Checkout />, { path: '/checkout' });
  await user.click(await screen.findByRole('button', { name: /Review and pay/ }));
  await user.click(await screen.findByRole('button', { name: 'Pay and place order' }));
  expect(await screen.findByText('Sorry, only 1 of "Everyday Tee" left in stock.')).toBeInTheDocument();
});
