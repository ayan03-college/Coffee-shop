import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, Tag, X } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Cart() {
  const { cart, totals, updateQuantity, removeItem, applyCoupon, removeCoupon, FREE_DELIVERY_THRESHOLD } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');
  const [applying, setApplying] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setApplying(true);
    await applyCoupon(couponInput.trim());
    setApplying(false);
    setCouponInput('');
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 text-center">
        <ShoppingBag size={64} className="text-coffee-latte" />
        <h2 className="mt-6 font-display text-2xl font-bold">Sign in to view your cart</h2>
        <p className="mt-2 text-coffee-bean">Log in to add items and start your order.</p>
        <Link to="/login" className="btn-primary mt-6">
          Sign In
        </Link>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 text-center">
        <ShoppingBag size={64} className="text-coffee-latte" />
        <h2 className="mt-6 font-display text-2xl font-bold">Your cart is empty</h2>
        <p className="mt-2 text-coffee-bean">Looks like you haven't added any coffee yet.</p>
        <Link to="/menu" className="btn-primary mt-6">
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="section-title mb-8">Your Cart</h1>

      {totals.subtotal < FREE_DELIVERY_THRESHOLD && (
        <div className="mb-6 rounded-xl bg-coffee-cream p-3 text-sm dark:bg-coffee-bean/20">
          Add <span className="font-semibold">₹{(FREE_DELIVERY_THRESHOLD - totals.subtotal).toFixed(2)}</span> more to
          get <span className="font-semibold">FREE delivery</span>!
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <AnimatePresence>
            {cart.items.map((item) => (
              <motion.div
                key={item._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="card flex items-center gap-4 p-4"
              >
                <img src={item.image} alt={item.name} className="h-20 w-20 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{item.name}</p>
                  <p className="text-sm text-coffee-bean">Size: {item.size}</p>
                  <p className="font-medium text-coffee-mocha">₹{item.price}</p>
                </div>
                <div className="flex items-center gap-3 rounded-full border-2 border-coffee-latte/50 px-3 py-1.5">
                  <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>
                    <Minus size={14} />
                  </button>
                  <span className="w-5 text-center font-semibold">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>
                    <Plus size={14} />
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item._id)}
                  className="text-red-500 hover:text-red-600"
                  aria-label="Remove item"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="card h-fit p-6">
          <h3 className="mb-4 font-display text-xl font-bold">Order Summary</h3>

          {cart.coupon?.code ? (
            <div className="mb-4 flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2 text-sm dark:bg-emerald-950/30">
              <span className="flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
                <Tag size={14} /> {cart.coupon.code} applied
              </span>
              <button onClick={removeCoupon} className="text-emerald-700 dark:text-emerald-400">
                <X size={16} />
              </button>
            </div>
          ) : (
            <form onSubmit={handleApplyCoupon} className="mb-4 flex gap-2">
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="Coupon code"
                className="input-field !py-2 text-sm uppercase"
              />
              <button
                type="submit"
                disabled={applying}
                className="btn-secondary !px-4 !py-2 text-sm"
              >
                Apply
              </button>
            </form>
          )}

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-coffee-bean">Subtotal</span>
              <span>₹{totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-coffee-bean">GST (5%)</span>
              <span>₹{totals.gst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-coffee-bean">Delivery</span>
              <span>{totals.deliveryCharge === 0 ? 'FREE' : `₹${totals.deliveryCharge.toFixed(2)}`}</span>
            </div>
            {totals.discount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Discount</span>
                <span>-₹{totals.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="mt-3 flex justify-between border-t border-coffee-latte/30 pt-3 text-lg font-bold">
              <span>Grand Total</span>
              <span className="text-coffee-mocha">₹{totals.grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <button onClick={() => navigate('/checkout')} className="btn-primary mt-6 w-full">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
