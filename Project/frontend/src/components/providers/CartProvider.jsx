import { useCallback, useEffect, useMemo, useState } from 'react';
import { CartContext, useAuth } from '../../lib/contexts';
import { normalizeProduct } from '../../lib/product';
import * as ordersApi from '../../services/orders';

const EMPTY = { items: [], count: 0, total: 0 };

function normalizeCart(data) {
  if (!data) return EMPTY;
  const items = (data.cart_items || []).map((row) => ({
    productId: row.product_id,
    product: normalizeProduct(row.product),
    size: row.size,
    color: row.color,
    quantity: row.quantity,
    price: Number(row.price),
    lineTotal: Number(row.total_price),
  }));
  return {
    items,
    count: data.item_count ?? items.reduce((sum, item) => sum + item.quantity, 0),
    total: Number(data.total_price) || 0,
  };
}

export default function CartProvider({ children }) {
  const { isCustomer } = useAuth();
  const [cart, setCart] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const refresh = useCallback(async () => {
    if (!isCustomer) {
      setCart(EMPTY);
      return EMPTY;
    }
    setLoading(true);
    try {
      const next = normalizeCart(await ordersApi.getCart());
      setCart(next);
      return next;
    } finally {
      setLoading(false);
    }
  }, [isCustomer]);

  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);

  const add = useCallback(async (productId, options) => {
    const data = await ordersApi.addToCart(productId, options);
    setCart(normalizeCart(data));
  }, []);

  const setQuantity = useCallback(async (item, quantity) => {
    const data = await ordersApi.updateCartItem(item.productId, { size: item.size, color: item.color, quantity });
    setCart(normalizeCart(data));
  }, []);

  const value = useMemo(
    () => ({ ...cart, loading, open, setOpen, refresh, add, setQuantity, clear: () => setCart(EMPTY) }),
    [cart, loading, open, refresh, add, setQuantity],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
