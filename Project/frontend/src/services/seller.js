import api from '../lib/api';
import { normalizeProduct } from '../lib/product';

export const loginSeller = (email, password) =>
  api.post('/seller/token/', { username: email, password }).then((r) => r.data);
export const registerSeller = (details) => api.post('/seller/register/', details).then((r) => r.data);
export const getSellerProfile = () => api.get('/seller/me/').then((r) => r.data);
export const updateSellerProfile = (details) => api.patch('/seller/me/', details).then((r) => r.data);
export const requestSellerPasswordReset = (email) =>
  api.post('/seller/seller-forgot-password/', { email }).then((r) => r.data);
export const resetSellerPassword = (token, password) =>
  api.post('/seller/seller-change-password/', { token, password }).then((r) => r.data);

export const getMyProducts = () => api.get('/auth_products/').then((r) => r.data.map(normalizeProduct));

export function createProduct({ name, description, categories, colors, sizes, price, stock, brand, gender, images }) {
  const form = new FormData();
  form.append('name', name);
  form.append('description', description);
  form.append('category', categories.join(','));
  form.append('colors', JSON.stringify(colors));
  form.append('sizes', JSON.stringify(sizes));
  form.append('currency', 'MYR');
  form.append('price', price);
  form.append('stock', stock);
  form.append('rating', 0);
  form.append('brand', brand);
  form.append('gender', gender);
  images.forEach((file) => form.append('images', file));
  return api.post('/auth_products/', form).then((r) => normalizeProduct(r.data));
}

export const updateProduct = (id, changes) =>
  api.patch(`/products/${id}/edit`, changes).then((r) => normalizeProduct(r.data));
export const deleteProduct = (id) => api.delete(`/products/${id}/`);

export const startPromotion = ({ productId, discountPercentage, startDate, endDate }) =>
  api
    .post('/promotions/', {
      product: productId,
      discount_percentage: discountPercentage,
      start_date: startDate,
      end_date: endDate,
      is_active: true,
    })
    .then((r) => r.data);
export const endPromotion = (promotionId) => api.delete(`/promotions/${promotionId}/delete/`);

export const getSellerOrders = ({ includeShipped = false } = {}) =>
  api.get('/seller/orders/', { params: includeShipped ? { all: 1 } : undefined }).then((r) => r.data);
export const shipOrderItem = (itemId) => api.post(`/seller/orders/${itemId}/ship/`).then((r) => r.data);
