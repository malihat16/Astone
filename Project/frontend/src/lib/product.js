import { API_BASE_URL } from './config';

/*
 * The API has stored product data in a few shapes over time (JSON strings,
 * Python-style lists, `code` vs `hex`, `name` vs `value`). Everything the UI
 * shows goes through normalizeProduct so pages never have to care.
 */

export const GENDERS = {
  M: { label: 'Men', path: '/men' },
  F: { label: 'Women', path: '/women' },
  U: { label: 'Unisex', path: '/unisex' },
};

function parseList(value) {
  if (Array.isArray(value)) return value;
  if (value == null || value === '') return [];
  if (typeof value === 'string') {
    const text = value.trim();
    if (text.startsWith('[')) {
      try {
        return JSON.parse(text);
      } catch {
        try {
          return JSON.parse(text.replace(/'/g, '"'));
        } catch {
          return text.replace(/[[\]'"]/g, '').split(',');
        }
      }
    }
    return text.split(',');
  }
  return [];
}

export function parseCategories(value) {
  return parseList(value)
    .map((c) => (typeof c === 'object' && c ? c.name || c.code : c))
    .map((c) => String(c).trim())
    .filter(Boolean);
}

export function parseColors(value) {
  return parseList(value)
    .map((c) => {
      if (typeof c === 'string') return { name: c.trim(), hex: c.trim().startsWith('#') ? c.trim() : null };
      if (!c || typeof c !== 'object') return null;
      return { name: c.name || c.hex || c.code, hex: c.hex || c.code || null };
    })
    .filter((c) => c && c.name);
}

export function parseSizes(value) {
  return parseList(value)
    .map((s) => {
      if (typeof s === 'string') return { value: s.trim(), label: s.trim() };
      if (!s || typeof s !== 'object') return null;
      const code = s.value || s.code || s.name;
      return { value: code, label: s.label || s.name || code };
    })
    .filter((s) => s && s.value);
}

export function imageUrl(path) {
  if (!path) return null;
  if (/^(https?:|data:|blob:)/.test(path)) return path;
  if (path.startsWith('/')) return `${API_BASE_URL}${path}`;
  return `${API_BASE_URL}/media/${path}`;
}

const toNumber = (n) => {
  const value = Number.parseFloat(n);
  return Number.isFinite(value) ? value : 0;
};

export function normalizeProduct(raw) {
  if (!raw) return null;
  const price = toNumber(raw.price);
  const original = toNumber(raw.original_price) || price;
  const onSale = original > price + 0.001;
  const gender = String(raw.gender || '').toUpperCase();
  return {
    id: raw.id,
    name: raw.name || 'Untitled product',
    description: raw.description || '',
    brand: raw.brand && raw.brand !== '0' ? String(raw.brand) : '',
    gender: GENDERS[gender] ? gender : '',
    genderLabel: GENDERS[gender]?.label || '',
    categories: parseCategories(raw.category),
    colors: parseColors(raw.colors),
    sizes: parseSizes(raw.sizes),
    currency: raw.currency || 'MYR',
    price,
    originalPrice: original,
    onSale,
    discountPercent: onSale ? Math.round((1 - price / original) * 100) : 0,
    stock: Number.parseInt(raw.stock, 10) || 0,
    rating: Number(raw.rating) || 0,
    images: (raw.images || []).map((img) => imageUrl(img.image_url || img)).filter(Boolean),
    promotion: raw.promotions || null,
    seller: raw.seller,
  };
}

export function formatMoney(amount, currency = 'MYR') {
  const value = toNumber(amount).toFixed(2);
  return currency === 'MYR' ? `RM ${value}` : `${currency} ${value}`;
}

export function colorLabel(product, hex) {
  const match = product?.colors?.find((c) => c.hex?.toLowerCase() === String(hex).toLowerCase());
  return match?.name || hex;
}

/** Seller-facing product reference, e.g. AST000012. */
export const productCode = (id) => `AST${String(id).padStart(6, '0')}`;
