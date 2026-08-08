import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { fetchAllOrders, updateOrderStatusApi } from '../../services/api.js';

const statuses = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];
const statusColors = {
  Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  Preparing: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  'Out for Delivery': 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400',
  Delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  Cancelled: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAllOrders({ status: filterStatus || undefined, limit: 100 });
      setOrders(res.data.orders);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleStatusChange = async (id, status) => {
    try {
      await updateOrderStatusApi(id, status);
      toast.success('Order status updated');
      loadOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update status');
    }
  };

  return (
    <AdminLayout title="Manage Orders">
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setFilterStatus('')}
          className={`rounded-full px-4 py-1.5 text-sm font-medium ${
            !filterStatus ? 'bg-coffee-mocha text-white' : 'bg-white dark:bg-coffee-bean/20'
          }`}
        >
          All
        </button>
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              filterStatus === s ? 'bg-coffee-mocha text-white' : 'bg-white dark:bg-coffee-bean/20'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner fullScreen />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-coffee-latte/30 text-left text-coffee-bean">
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Items</th>
                <th className="p-4">Total</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b border-coffee-latte/10">
                  <td className="p-4 font-mono text-xs">{order._id.slice(-8).toUpperCase()}</td>
                  <td className="p-4">
                    <p className="font-medium">{order.customerInfo.name}</p>
                    <p className="text-xs text-coffee-bean">{order.customerInfo.email}</p>
                  </td>
                  <td className="p-4">{order.items.length}</td>
                  <td className="p-4 font-medium">₹{order.grandTotal.toFixed(2)}</td>
                  <td className="p-4">{order.paymentMethod}</td>
                  <td className="p-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className={`rounded-full border-0 px-3 py-1.5 text-xs font-semibold ${statusColors[order.status]}`}
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <p className="p-6 text-center text-coffee-bean">No orders found</p>}
        </div>
      )}
    </AdminLayout>
  );
}
