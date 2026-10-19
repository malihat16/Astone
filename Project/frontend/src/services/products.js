import api from '../lib/api';
import { normalizeProduct } from '../lib/product';

export async function getProducts({ gender } = {}) {
  const res = await api.get('/products/', { params: gender ? { gender } : undefined });
  return res.data.map(normalizeProduct);
}

export async function getProduct(id) {
  const res = await api.get(`/products/${id}/`);
  return normalizeProduct(res.data);
}
