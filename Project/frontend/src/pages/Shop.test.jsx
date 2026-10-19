import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Shop from './Shop';
import { renderRoute, rawProduct } from '../test/render';
import { normalizeProduct } from '../lib/product';
import * as productsApi from '../services/products';

vi.mock('../services/products');

const catalogue = [
  rawProduct({ id: 1, name: 'Black Tee', brand: 'Pagi', price: '45.00', original_price: '45.00' }),
  rawProduct({ id: 2, name: 'Linen Shirt', brand: 'Kain Studio', price: '120.00', original_price: '150.00' }),
].map(normalizeProduct);

describe('Shop page (one page for men, women and unisex)', () => {
  it('shows skeletons, then the products for that gender', async () => {
    productsApi.getProducts.mockResolvedValue(catalogue);
    renderRoute(<Shop gender="M" />, { path: '/men' });
    expect(screen.getByLabelText('Loading products')).toBeInTheDocument();
    expect(await screen.findByText('Black Tee')).toBeInTheDocument();
    expect(productsApi.getProducts).toHaveBeenCalledWith({ gender: 'M' });
    expect(screen.getByRole('heading', { level: 1, name: 'Men' })).toBeInTheDocument();
    expect(screen.getByText(/2 of 2 pieces/)).toBeInTheDocument();
  });

  it('filters by brand and offers to clear when nothing matches', async () => {
    const user = userEvent.setup();
    productsApi.getProducts.mockResolvedValue(catalogue);
    renderRoute(<Shop gender="U" />, { path: '/unisex' });
    await screen.findByText('Black Tee');

    const filters = screen.getByRole('complementary', { name: 'Filters' });
    await user.click(within(filters).getByLabelText('Kain Studio'));
    expect(screen.queryByText('Black Tee')).not.toBeInTheDocument();
    expect(screen.getByText('Linen Shirt')).toBeInTheDocument();

    await user.type(within(filters).getByLabelText('Search this category'), 'zzz');
    expect(await screen.findByText('Nothing matches these filters')).toBeInTheDocument();
    await user.click(screen.getAllByRole('button', { name: 'Clear filters' })[0]);
    expect(await screen.findByText('Black Tee')).toBeInTheDocument();
  });

  it('shows an error with a working retry button', async () => {
    const user = userEvent.setup();
    productsApi.getProducts.mockRejectedValueOnce({ code: 'ERR_NETWORK' }).mockResolvedValueOnce(catalogue);
    renderRoute(<Shop />, { path: '/shop' });
    expect(await screen.findByText("Products didn't load")).toBeInTheDocument();
    expect(screen.getByText(/Can't reach the Astoné server/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('Linen Shirt')).toBeInTheDocument();
  });

  it('says so when a category has no products yet', async () => {
    productsApi.getProducts.mockResolvedValue([]);
    renderRoute(<Shop gender="F" />, { path: '/women' });
    await waitFor(() => expect(screen.getByText('Nothing here yet')).toBeInTheDocument());
  });
});
