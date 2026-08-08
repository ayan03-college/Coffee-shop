import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Plus, Trash2, X } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { fetchCoupons, createCoupon, deleteCoupon, updateCoupon } from '../../services/api.js';

const emptyForm = {
  code: '',
  type: 'percentage',
  value: '',
  minOrderAmount: '',
  maxDiscountAmount: '',
  expiresAt: '',
  description: '',
};

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetchCoupons();
      setCoupons(res.data.coupons);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code || !form.value || !form.expiresAt) {
      toast.error('Please fill in code, value, and expiry date');
      return;
    }
    setSaving(true);
    try {
      await createCoupon({
        ...form,
        value: Number(form.value),
        minOrderAmount: Number(form.minOrderAmount) || 0,
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
      });
      toast.success('Coupon created');
      setModalOpen(false);
      setForm(emptyForm);
      loadCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create coupon');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (coupon) => {
    try {
      await updateCoupon(coupon._id, { isActive: !coupon.isActive });
      loadCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update coupon');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await deleteCoupon(id);
      toast.success('Coupon deleted');
      loadCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete coupon');
    }
  };

  return (
    <AdminLayout title="Manage Coupons">
      <div className="mb-4 flex justify-end">
        <button onClick={() => setModalOpen(true)} className="btn-primary !px-4 !py-2 text-sm">
          <Plus size={16} /> New Coupon
        </button>
      </div>

      {loading ? (
        <LoadingSpinner fullScreen />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coupons.map((c) => (
            <motion.div key={c._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-lg font-bold text-coffee-mocha">{c.code}</p>
                  <p className="text-sm text-coffee-bean">{c.description}</p>
                </div>
                <button onClick={() => handleDelete(c._id)} className="text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="mt-3 space-y-1 text-sm">
                <p>
                  Discount: <strong>{c.type === 'percentage' ? `${c.value}%` : `₹${c.value}`}</strong>
                </p>
                <p>Min order: ₹{c.minOrderAmount}</p>
                <p>Used: {c.usedCount} times</p>
                <p>Expires: {new Date(c.expiresAt).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => toggleActive(c)}
                className={`mt-3 w-full rounded-full px-3 py-1.5 text-xs font-semibold ${
                  c.isActive
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                }`}
              >
                {c.isActive ? 'Active - click to disable' : 'Inactive - click to enable'}
              </button>
            </motion.div>
          ))}
          {coupons.length === 0 && <p className="text-coffee-bean">No coupons yet</p>}
        </div>
      )}

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-[#2A1D14]"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-xl font-bold">New Coupon</h3>
                <button onClick={() => setModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="Coupon code (e.g. SAVE20)"
                  className="input-field"
                />
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="input-field"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="flat">Flat Amount</option>
                  </select>
                  <input
                    type="number"
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    placeholder={form.type === 'percentage' ? 'e.g. 10' : 'e.g. 200'}
                    className="input-field"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    value={form.minOrderAmount}
                    onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                    placeholder="Min order amount"
                    className="input-field"
                  />
                  <input
                    type="number"
                    value={form.maxDiscountAmount}
                    onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })}
                    placeholder="Max discount (optional)"
                    className="input-field"
                  />
                </div>
                <input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                  className="input-field"
                />
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Description"
                  className="input-field"
                />
                <button type="submit" disabled={saving} className="btn-primary w-full">
                  {saving ? 'Creating...' : 'Create Coupon'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
