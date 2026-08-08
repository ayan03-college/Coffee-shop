import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { User, Mail, Phone, MapPin, Trash2, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { saveAddress, deleteAddress } from '../services/api.js';

export default function Profile() {
  const { user, updateProfile, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
  });

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ name, phone });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    const { address, city, state, pincode, phone: addrPhone } = addressForm;
    if (!address || !city || !state || !pincode || !addrPhone) {
      toast.error('Please fill in all address fields');
      return;
    }
    try {
      const res = await saveAddress(addressForm);
      setUser({ ...user, addresses: res.data.addresses });
      toast.success('Address saved');
      setShowAddressForm(false);
      setAddressForm({ label: 'Home', address: '', city: '', state: '', pincode: '', phone: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save address');
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const res = await deleteAddress(id);
      setUser({ ...user, addresses: res.data.addresses });
      toast.success('Address removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not remove address');
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="section-title mb-8">My Profile</h1>

      <motion.form onSubmit={handleSaveProfile} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card space-y-4 p-6">
        <h3 className="font-display text-xl font-bold">Account Details</h3>
        <div className="relative">
          <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-coffee-bean" />
          <input value={name} onChange={(e) => setName(e.target.value)} className="input-field pl-11" placeholder="Full name" />
        </div>
        <div className="relative">
          <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-coffee-bean" />
          <input value={user.email} disabled className="input-field pl-11 opacity-60" />
        </div>
        <div className="relative">
          <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-coffee-bean" />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field pl-11" placeholder="Phone number" />
        </div>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </motion.form>

      <div className="card mt-6 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-xl font-bold">Saved Addresses</h3>
          <button onClick={() => setShowAddressForm((s) => !s)} className="btn-secondary !px-4 !py-2 text-sm">
            <Plus size={16} /> Add
          </button>
        </div>

        {showAddressForm && (
          <form onSubmit={handleAddAddress} className="mb-4 space-y-3 rounded-xl bg-coffee-cream/40 p-4 dark:bg-coffee-bean/10">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                placeholder="Label (e.g. Home)"
                value={addressForm.label}
                onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                className="input-field"
              />
              <input
                placeholder="Phone"
                value={addressForm.phone}
                onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                className="input-field"
              />
              <input
                placeholder="Address"
                value={addressForm.address}
                onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                className="input-field sm:col-span-2"
              />
              <input
                placeholder="City"
                value={addressForm.city}
                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                className="input-field"
              />
              <input
                placeholder="State"
                value={addressForm.state}
                onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                className="input-field"
              />
              <input
                placeholder="Pincode"
                value={addressForm.pincode}
                onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                className="input-field"
              />
            </div>
            <button type="submit" className="btn-primary !px-5 !py-2 text-sm">
              Save Address
            </button>
          </form>
        )}

        {user.addresses?.length > 0 ? (
          <div className="space-y-3">
            {user.addresses.map((addr) => (
              <div key={addr._id} className="flex items-start justify-between rounded-xl border border-coffee-latte/30 p-4">
                <div className="flex gap-3">
                  <MapPin size={18} className="mt-0.5 text-coffee-mocha" />
                  <div>
                    <p className="font-semibold">{addr.label}</p>
                    <p className="text-sm text-coffee-bean">
                      {addr.address}, {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    <p className="text-sm text-coffee-bean">{addr.phone}</p>
                  </div>
                </div>
                <button onClick={() => handleDeleteAddress(addr._id)} className="text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-coffee-bean">No saved addresses yet.</p>
        )}
      </div>
    </div>
  );
}
