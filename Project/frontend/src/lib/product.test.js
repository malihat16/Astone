import { formatMoney, imageUrl, normalizeProduct, parseCategories, parseColors, parseSizes } from './product';
import { API_BASE_URL } from './config';
import { rawProduct } from '../test/render';

describe('normalizeProduct', () => {
  it('parses numbers and detects a sale', () => {
    const p = normalizeProduct(rawProduct({ price: '40.00', original_price: '50.00' }));
    expect(p.price).toBe(40);
    expect(p.onSale).toBe(true);
    expect(p.discountPercent).toBe(20);
    expect(p.genderLabel).toBe('Unisex');
  });

  it('is not on sale when prices match or original is missing', () => {
    expect(normalizeProduct(rawProduct()).onSale).toBe(false);
    expect(normalizeProduct(rawProduct({ original_price: null })).onSale).toBe(false);
  });

  it('builds absolute image URLs', () => {
    expect(normalizeProduct(rawProduct()).images).toEqual([`${API_BASE_URL}/media/images/tee.jpg`]);
    expect(imageUrl('https://res.cloudinary.com/x.jpg')).toBe('https://res.cloudinary.com/x.jpg');
    expect(imageUrl('images/x.jpg')).toBe(`${API_BASE_URL}/media/images/x.jpg`);
  });

  it('ignores the old "0" placeholder brand and unknown genders', () => {
    const p = normalizeProduct(rawProduct({ brand: '0', gender: '0' }));
    expect(p.brand).toBe('');
    expect(p.gender).toBe('');
  });
});

describe('legacy data formats', () => {
  it('reads categories as comma lists, JSON or Python-style lists', () => {
    expect(parseCategories('Top,Bottom')).toEqual(['Top', 'Bottom']);
    expect(parseCategories("['Top', 'Bottom']")).toEqual(['Top', 'Bottom']);
    expect(parseCategories('[{"name": "Top"}]')).toEqual(['Top']);
  });

  it('reads colours with either hex or code', () => {
    expect(parseColors('[{"name": "Red", "code": "#FF0000"}]')).toEqual([{ name: 'Red', hex: '#FF0000' }]);
    expect(parseColors([{ name: 'Blue', hex: '#00F' }])).toEqual([{ name: 'Blue', hex: '#00F' }]);
  });

  it('reads sizes with value/label or name/code', () => {
    expect(parseSizes('[{"name": "Small", "code": "S"}]')).toEqual([{ value: 'S', label: 'Small' }]);
    expect(parseSizes([{ value: 'M', label: 'Medium' }])).toEqual([{ value: 'M', label: 'Medium' }]);
  });
});

it('formats ringgit', () => {
  expect(formatMoney('47.2')).toBe('RM 47.20');
  expect(formatMoney(5, 'USD')).toBe('USD 5.00');
});
