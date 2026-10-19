/** An order is "Shipped" once every line has been shipped by its seller. */
export function orderStatus(order) {
  const items = order?.order_items || [];
  if (!items.length) return 'processing';
  const shipped = items.filter((i) => i.is_shipped).length;
  if (shipped === items.length) return 'shipped';
  if (shipped > 0) return 'partial';
  return 'processing';
}
