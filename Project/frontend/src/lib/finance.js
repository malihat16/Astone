/** Summarise a seller's order lines into totals and a best-seller table. */
export function summarizeSales(rows) {
  const orders = new Set();
  const products = new Map();
  let revenue = 0;
  let items = 0;
  rows.forEach((row) => {
    const lineTotal = Number(row.price) * row.quantity;
    revenue += lineTotal;
    items += row.quantity;
    orders.add(row.order_id);
    const entry = products.get(row.product_name) || { name: row.product_name, items: 0, revenue: 0 };
    entry.items += row.quantity;
    entry.revenue += lineTotal;
    products.set(row.product_name, entry);
  });
  return {
    revenue,
    items,
    orders: orders.size,
    averageOrder: orders.size ? revenue / orders.size : 0,
    byProduct: [...products.values()].sort((a, b) => b.revenue - a.revenue),
  };
}
