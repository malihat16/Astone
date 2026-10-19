import api from '../lib/api';

export const getCart = () => api.get('/cart/').then((r) => r.data);
export const addToCart = (productId, { size, color, quantity = 1 }) =>
  api.post(`/add_to_cart/${productId}/`, { size, color, quantity }).then((r) => r.data);
export const updateCartItem = (productId, { size, color, quantity }) =>
  api.post(`/update_cart/${productId}/`, { size, color, quantity }).then((r) => r.data);
export const placeOrder = ({ address, pointsToUse = 0 }) =>
  api.post('/place_order/', { address, points_to_use: pointsToUse }).then((r) => r.data);
export const getOrders = () => api.get('/orders/').then((r) => r.data);
export const getOrder = (id) => api.get(`/order/${id}/`).then((r) => r.data);
