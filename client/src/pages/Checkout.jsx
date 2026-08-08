import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Truck, CreditCard, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { checkoutApi, createRazorpayOrderApi, verifyRazorpayPaymentApi } from '../services/api.js';

const paymentOptions = [
  { id: 'COD', label: 'Cash on Delivery', icon: Truck },
  { id: 'Card', label: 'Card / UPI (Razorpay)', icon: CreditCard },
];

// Loads the Razorpay Checkout script once and reuses it on later renders
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function Checkout() {
  const { cart, totals, refreshCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [placing, setPlacing] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    const requiredFields = ['name', 'email', 'phone', 'address', 'city', 'state', 'pincode'];
    for (const field of requiredFields) {
      if (!form[field].trim()) {
        toast.error(`Please enter your ${field}`);
        return;
      }
    }
    if (cart.items.length === 0) {
      toast.error('Your cart is empty');
      navigate('/menu');
      return;
    }

    setPlacing(true);
    try {
      if (paymentMethod === 'COD') {
        const res = await checkoutApi({ customerInfo: form, paymentMethod });
        toast.success('Order placed successfully!');
        await refreshCart();
        navigate(`/order-success/${res.data.order._id}`);
        setPlacing(false);
        return;
      }

      // Card / UPI via Razorpay
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Could not load Razorpay. Check your internet connection.');
        setPlacing(false);
        return;
      }

      const orderRes = await createRazorpayOrderApi();
      const { orderId, amount, keyId } = orderRes.data;

      const razorpay = new window.Razorpay({
        key: keyId,
        amount: Math.round(amount * 100),
        currency: 'INR',
        name: 'Brewhouse Coffee Co.',
        description: 'Order payment',
        order_id: orderId,
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: '#6f4e37' },
        handler: async (response) => {
          try {
            await verifyRazorpayPaymentApi(response);
            const res = await checkoutApi({
              customerInfo: form,
              paymentMethod,
              razorpayPaymentId: response.razorpay_payment_id,
            });
            toast.success('Payment successful! Order placed.');
            await refreshCart();
            navigate(`/order-success/${res.data.order._id}`);
          } catch (err) {
            toast.error(err.response?.data?.message || 'Payment verification failed');
          } finally {
            setPlacing(false);
          }
        },
        modal: {
          ondismiss: () => setPlacing(false),
        },
      });

      razorpay.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not place order');
      setPlacing(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 text-center">
        <h2 className="font-display text-2xl font-bold">Your cart is empty</h2>
        <p className="mt-2 text-coffee-bean">Add some coffee before checking out.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="section-title mb-8">Checkout</h1>
      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
            <h3 className="mb-4 flex items-center gap-2 font-display text-xl font-bold">
              <MapPin size={20} /> Customer Information
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input name="name" value={form.name} onChange={handleChange} placeholder="Full Name" className="input-field" />
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" className="input-field" />
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone Number" className="input-field" />
              <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="Pincode" className="input-field" />
              <input name="address" value={form.address} onChange={handleChange} placeholder="Address" className="input-field sm:col-span-2" />
              <input name="city" value={form.city} onChange={handleChange} placeholder="City" className="input-field" />
              <input name="state" value={form.state} onChange={handleChange} placeholder="State" className="input-field" />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
            <h3 className="mb-4 font-display text-xl font-bold">Payment Method</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {paymentOptions.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPaymentMethod(id)}
                  className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-colors ${
                    paymentMethod === id
                      ? 'border-coffee-mocha bg-coffee-mocha/10'
                      : 'border-coffee-latte/40 hover:border-coffee-mocha'
                  }`}
                >
                  <Icon size={22} />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
            {paymentMethod !== 'COD' && (
              <p className="mt-3 text-xs text-coffee-bean">
                This runs on Razorpay's test mode. Use test card <strong>4111 1111 1111 1111</strong>, any
                future expiry, and any CVC — or any UPI ID ending in <strong>@razorpay</strong> — when
                Razorpay is configured on the backend.
              </p>
            )}
          </motion.div>
        </div>

        <div className="card h-fit p-6">
          <h3 className="mb-4 font-display text-xl font-bold">Order Summary</h3>
          <div className="max-h-48 space-y-2 overflow-y-auto border-b border-coffee-latte/30 pb-4">
            {cart.items.map((item) => (
              <div key={item._id} className="flex justify-between text-sm">
                <span>
                  {item.name} ({item.size}) x{item.quantity}
                </span>
                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2 text-sm">
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
                <span>Discount ({cart.coupon.code})</span>
                <span>-₹{totals.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="mt-3 flex justify-between border-t border-coffee-latte/30 pt-3 text-lg font-bold">
              <span>Grand Total</span>
              <span className="text-coffee-mocha">₹{totals.grandTotal.toFixed(2)}</span>
            </div>
          </div>
          <button type="submit" disabled={placing} className="btn-primary mt-6 w-full">
            {placing ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </form>
    </div>
  );
}
