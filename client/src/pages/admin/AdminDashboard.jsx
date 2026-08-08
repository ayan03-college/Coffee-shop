import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, ShoppingBag, TrendingUp, Award } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { fetchAnalytics } from '../../services/api.js';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
    <div className="flex items-center gap-3">
      <div className={`flex h-11 w-11 items-center justify-center rounded-full ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-coffee-bean">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  </motion.div>
);

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics()
      .then((res) => setAnalytics(res.data.analytics))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const maxRevenue = analytics ? Math.max(...analytics.revenueByDay.map((d) => d.revenue), 1) : 1;
  const maxQty = analytics?.topSelling?.length ? Math.max(...analytics.topSelling.map((p) => p.quantity)) : 1;

  return (
    <AdminLayout title="Dashboard">
      {loading || !analytics ? (
        <LoadingSpinner fullScreen />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={IndianRupee}
              label="Total Revenue"
              value={`₹${analytics.totalRevenue.toFixed(0)}`}
              color="bg-coffee-mocha"
            />
            <StatCard icon={ShoppingBag} label="Total Orders" value={analytics.totalOrders} color="bg-emerald-600" />
            <StatCard
              icon={TrendingUp}
              label="Pending Orders"
              value={analytics.statusCounts.Pending || 0}
              color="bg-amber-500"
            />
            <StatCard
              icon={Award}
              label="Delivered Orders"
              value={analytics.statusCounts.Delivered || 0}
              color="bg-blue-600"
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="card p-6">
              <h3 className="mb-4 font-display text-lg font-bold">Revenue - Last 7 Days</h3>
              <div className="flex h-48 items-end justify-between gap-2">
                {analytics.revenueByDay.map((d) => (
                  <div key={d.date} className="flex flex-1 flex-col items-center gap-2">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(4, (d.revenue / maxRevenue) * 100)}%` }}
                      className="w-full rounded-t-lg bg-coffee-mocha"
                      style={{ minHeight: 4 }}
                      title={`₹${d.revenue.toFixed(0)}`}
                    />
                    <span className="text-[10px] text-coffee-bean">
                      {new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="mb-4 font-display text-lg font-bold">Top Selling Coffee</h3>
              <div className="space-y-3">
                {analytics.topSelling.length === 0 && <p className="text-sm text-coffee-bean">No sales data yet</p>}
                {analytics.topSelling.map((item, i) => (
                  <div key={item.name}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-medium">
                        {i + 1}. {item.name}
                      </span>
                      <span className="text-coffee-bean">{item.quantity} sold</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-coffee-cream dark:bg-coffee-bean/20">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.quantity / maxQty) * 100}%` }}
                        className="h-full rounded-full bg-coffee-mocha"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 card p-6">
            <h3 className="mb-4 font-display text-lg font-bold">Order Status Overview</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
              {Object.entries(analytics.statusCounts).map(([status, count]) => (
                <div key={status} className="rounded-xl bg-coffee-cream/60 p-4 text-center dark:bg-coffee-bean/10">
                  <p className="text-2xl font-bold text-coffee-mocha">{count}</p>
                  <p className="text-xs text-coffee-bean">{status}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
