import { applyFilters, emptyFilters, filterOptions } from './filters';
import { normalizeProduct } from './product';
import { pointsDiscount, pointsEarned } from './points';
import { summarizeSales } from './finance';
import { orderStatus } from './orders';
import { validateSignup } from './validation';
import { rawProduct } from '../test/render';

const products = [
  rawProduct({ id: 1, name: 'Black Tee', brand: 'Pagi', price: '45.00', original_price: '45.00', category: 'Top' }),
  rawProduct({ id: 2, name: 'Linen Shirt', brand: 'Kain Studio', price: '120.00', original_price: '150.00', category: 'Top,Outerwear' }),
  rawProduct({ id: 3, name: 'Wide Trousers', brand: 'Pagi', price: '89.00', original_price: '89.00', category: 'Bottom' }),
].map(normalizeProduct);

describe('shop filters', () => {
  it('lists the brands, types and a rounded max price', () => {
    expect(filterOptions(products)).toEqual({ brands: ['Kain Studio', 'Pagi'], types: ['Bottom', 'Outerwear', 'Top'], maxPrice: 120 });
  });

  it('searches names and brands', () => {
    expect(applyFilters(products, { ...emptyFilters, q: 'kain' }).map((p) => p.id)).toEqual([2]);
  });

  it('combines brand, type, price and sale filters', () => {
    expect(applyFilters(products, { ...emptyFilters, brands: ['Pagi'] }).map((p) => p.id)).toEqual([3, 1]);
    expect(applyFilters(products, { ...emptyFilters, types: ['Bottom'] }).map((p) => p.id)).toEqual([3]);
    expect(applyFilters(products, { ...emptyFilters, price: [40, 90] }).map((p) => p.id)).toEqual([3, 1]);
    expect(applyFilters(products, { ...emptyFilters, saleOnly: true }).map((p) => p.id)).toEqual([2]);
  });

  it('sorts by price', () => {
    expect(applyFilters(products, { ...emptyFilters, sort: 'priceAsc' }).map((p) => p.id)).toEqual([1, 3, 2]);
    expect(applyFilters(products, { ...emptyFilters, sort: 'priceDesc' }).map((p) => p.id)).toEqual([2, 3, 1]);
  });
});

describe('points', () => {
  it('never discounts below zero or more than you have', () => {
    expect(pointsDiscount(120, 94.4)).toBe(94);
    expect(pointsDiscount(20, 100)).toBe(20);
    expect(pointsDiscount(20, 100, false)).toBe(0);
    expect(pointsEarned(80)).toBe(8);
  });
});

it('summarises seller sales', () => {
  const s = summarizeSales([
    { order_id: 1, product_name: 'Tee', price: '50.00', quantity: 2 },
    { order_id: 2, product_name: 'Tee', price: '50.00', quantity: 1 },
    { order_id: 2, product_name: 'Shirt', price: '120.00', quantity: 1 },
  ]);
  expect(s).toMatchObject({ revenue: 270, items: 4, orders: 2, averageOrder: 135 });
  expect(s.byProduct.map((p) => p.name)).toEqual(['Tee', 'Shirt']);
});

it('works out order status from shipped lines', () => {
  expect(orderStatus({ order_items: [{ is_shipped: false }] })).toBe('processing');
  expect(orderStatus({ order_items: [{ is_shipped: true }, { is_shipped: false }] })).toBe('partial');
  expect(orderStatus({ order_items: [{ is_shipped: true }] })).toBe('shipped');
});

it('validates the sign-up form', () => {
  expect(validateSignup({ first_name: 'A', last_name: 'B', email: 'a@b.co', password: '12345678' })).toEqual({});
  expect(Object.keys(validateSignup({ email: 'nope', password: 'short', phone_number: '12' }))).toEqual(
    ['first_name', 'last_name', 'email', 'password', 'phone_number'],
  );
});
