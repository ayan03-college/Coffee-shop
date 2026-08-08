import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Package } from 'lucide-react';
import { fetchOrderById } from '../services/api.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderById(id)
      .then((res) => setOrder(res.data.order))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (!order) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
      >
        <CheckCircle2 size={80} className="mx-auto text-emerald-500" />
      </motion.div>
      <h1 className="mt-6 font-display text-3xl font-bold">Order Placed Successfully!</h1>
      <p className="mt-2 text-coffee-bean">
        Thank you for your order, {order.customerInfo.name.split(' ')[0]}. We're brewing it fresh.
      </p>

      <div className="card mt-8 space-y-3 p-6 text-left">
        <div className="flex justify-between">
          <span className="text-coffee-bean">Order ID</span>
          <span className="font-mono text-sm">{order._id}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-coffee-bean">Status</span>
          <span className="font-semibold text-coffee-mocha">{order.status}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-coffee-bean">Payment Method</span>
          <span>{order.paymentMethod}</span>
        </div>
        <div className="flex justify-between border-t border-coffee-latte/30 pt-3 text-lg font-bold">
          <span>Total Paid</span>
          <span className="text-coffee-mocha">₹{order.grandTotal.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link to="/orders" className="btn-primary">
          <Package size={18} /> View My Orders
        </Link>
        <Link to="/menu" className="btn-secondary">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
