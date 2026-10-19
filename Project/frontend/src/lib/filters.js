/** Pure filtering + sorting for the shop page, kept separate so it's easy to test. */

export const SORTS = {
  newest: { label: 'Newest', compare: (a, b) => b.id - a.id },
  priceAsc: { label: 'Price: low to high', compare: (a, b) => a.price - b.price },
  priceDesc: { label: 'Price: high to low', compare: (a, b) => b.price - a.price },
};

export function filterOptions(products) {
  const brands = new Set();
  const types = new Set();
  let maxPrice = 0;
  products.forEach((p) => {
    if (p.brand) brands.add(p.brand);
    p.categories.forEach((c) => types.add(c));
    maxPrice = Math.max(maxPrice, p.price);
  });
  return {
    brands: [...brands].sort((a, b) => a.localeCompare(b)),
    types: [...types].sort((a, b) => a.localeCompare(b)),
    maxPrice: Math.max(50, Math.ceil(maxPrice / 10) * 10),
  };
}

export const emptyFilters = { q: '', brands: [], types: [], price: null, saleOnly: false, sort: 'newest' };

export function applyFilters(products, filters) {
  const q = filters.q.trim().toLowerCase();
  const result = products.filter((p) => {
    if (q && ![p.name, p.brand, p.description, ...p.categories].join(' ').toLowerCase().includes(q)) return false;
    if (filters.brands.length && !filters.brands.includes(p.brand)) return false;
    if (filters.types.length && !p.categories.some((c) => filters.types.includes(c))) return false;
    if (filters.price && (p.price < filters.price[0] || p.price > filters.price[1])) return false;
    if (filters.saleOnly && !p.onSale) return false;
    return true;
  });
  return result.sort((SORTS[filters.sort] || SORTS.newest).compare);
}

export function activeFilterCount(filters) {
  return (filters.q ? 1 : 0) + filters.brands.length + filters.types.length + (filters.price ? 1 : 0) + (filters.saleOnly ? 1 : 0);
}
