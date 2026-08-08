import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  fetchCart,
  addToCartApi,
  updateCartItemApi,
  removeCartItemApi,
  clearCartApi,
  applyCouponApi,
  removeCouponApi,
} from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const GST_RATE = 0.05;
const FREE_DELIVERY_THRESHOLD = 500;
const DELIVERY_CHARGE = 40;

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], coupon: { code: null, discountAmount: 0 } });
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({ items: [], coupon: { code: null, discountAmount: 0 } });
      return;
    }
    setLoading(true);
    try {
      const res = await fetchCart();
      setCart(res.data.cart);
    } catch (err) {
      // silently fail - not critical
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = useCallback(
    async (productId, size, quantity = 1) => {
      if (!isAuthenticated) {
        toast.error('Please log in to add items to your cart');
        return false;
      }
      try {
        const res = await addToCartApi({ productId, size, quantity });
        setCart(res.data.cart);
        toast.success('Added to cart');
        return true;
      } catch (err) {
        toast.error(err.response?.data?.message || 'Could not add to cart');
        return false;
      }
    },
    [isAuthenticated]
  );

  const updateQuantity = useCallback(async (itemId, quantity) => {
    try {
      const res = await updateCartItemApi({ itemId, quantity });
      setCart(res.data.cart);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update cart');
    }
  }, []);

  const removeItem = useCallback(async (itemId) => {
    try {
      const res = await removeCartItemApi(itemId);
      setCart(res.data.cart);
      toast.success('Item removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not remove item');
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      const res = await clearCartApi();
      setCart(res.data.cart);
    } catch (err) {
      // ignore
    }
  }, []);

  const applyCoupon = useCallback(async (code) => {
    try {
      const res = await applyCouponApi(code);
      setCart(res.data.cart);
      toast.success(res.data.message);
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
      return false;
    }
  }, []);

  const removeCoupon = useCallback(async () => {
    try {
      const res = await removeCouponApi();
      setCart(res.data.cart);
    } catch (err) {
      // ignore
    }
  }, []);

  const totals = useMemo(() => {
    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const gst = Math.round(subtotal * GST_RATE * 100) / 100;
    const deliveryCharge = subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
    const discount = cart.coupon?.discountAmount || 0;
    const grandTotal = Math.max(0, Math.round((subtotal + gst + deliveryCharge - discount) * 100) / 100);
    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    return { subtotal, gst, deliveryCharge, discount, grandTotal, itemCount };
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        totals,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        applyCoupon,
        removeCoupon,
        refreshCart,
        FREE_DELIVERY_THRESHOLD,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
