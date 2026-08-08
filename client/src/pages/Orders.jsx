import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Package, ChevronDown, XCircle } from 'lucide-react';
import { fetchMyOrders, cancelOrderApi } from '../services/api.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const statusSteps = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered'];
const statusColors = {
  Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  Preparing: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  'Out for Delivery': 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400',
  Delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  Cancelled: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetchMyOrders();
      setOrders(res.data.orders);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleCancel = async (id) => {
    try {
      await cancelOrderApi(id);
      toast.success('Order cancelled');
      loadOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel order');
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  if (orders.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 text-center">
        <Package size={64} className="text-coffee-latte" />
        <h2 className="mt-6 font-display text-2xl font-bold">No orders yet</h2>
        <p className="mt-2 text-coffee-bean">When you place an order, it'll show up here.</p>
        <Link to="/menu" className="btn-primary mt-6">
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="section-title mb-8">My Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <motion.div key={order._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
            <button
              onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}
              className="flex w-full items-center justify-between p-5 text-left"
            >
              <div>
                <p className="font-mono text-xs text-coffee-bean">Order #{order._id.slice(-8).toUpperCase()}</p>
                <p className="mt-1 font-semibold">
                  {order.items.length} item{order.items.length > 1 ? 's' : ''} · ₹{order.grandTotal.toFixed(2)}
                </p>
                <p className="text-xs text-coffee-bean">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[order.status]}`}>
                  {order.status}
                </span>
                <ChevronDown
                  size={18}
                  className={`transition-transform ${expandedId === order._id ? 'rotate-180' : ''}`}
                />
              </div>
            </button>

            {expandedId === order._id && (
              <div className="border-t border-coffee-latte/30 p-5">
                {order.status !== 'Cancelled' && (
                  <div className="mb-6 flex items-center justify-between">
                    {statusSteps.map((step, i) => {
                      const currentIdx = statusSteps.indexOf(order.status);
                      const active = i <= currentIdx;
                      return (
                        <div key={step} className="flex flex-1 flex-col items-center text-center">
                          <div
                            className={`h-3 w-3 rounded-full ${active ? 'bg-coffee-mocha' : 'bg-coffee-latte/40'}`}
                          />
                          <p className="mt-2 text-[10px] font-medium sm:text-xs">{step}</p>
                          {i < statusSteps.length - 1 && (
                            <div
                              className={`absolute mt-1.5 h-0.5 w-full translate-x-1/2 ${
                                i < currentIdx ? 'bg-coffee-mocha' : 'bg-coffee-latte/40'
                              }`}
                              style={{ position: 'relative', top: '-14px', left: '50%' }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm">
                      <img src={item.image} alt={item.name} className="h-10 w-10 rounded-lg object-cover" />
                      <span className="flex-1">
                        {item.name} ({item.size}) x{item.quantity}
                      </span>
                      <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 border-t border-coffee-latte/30 pt-4 text-sm">
                  <p className="text-coffee-bean">Delivering to:</p>
                  <p>
                    {order.customerInfo.address}, {order.customerInfo.city}, {order.customerInfo.state} -{' '}
                    {order.customerInfo.pincode}
                  </p>
                </div>

                {order.status === 'Pending' && (
                  <button
                    onClick={() => handleCancel(order._id)}
                    className="mt-4 flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-600"
                  >
                    <XCircle size={16} /> Cancel Order
                  </button>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
