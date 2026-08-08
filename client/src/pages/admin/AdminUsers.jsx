import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ShieldCheck, Ban, CheckCircle } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { fetchAllUsers, updateUserApi, deleteUserApi } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetchAllUsers();
      setUsers(res.data.users);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleActive = async (u) => {
    try {
      await updateUserApi(u._id, { isActive: !u.isActive });
      toast.success(u.isActive ? 'User deactivated' : 'User activated');
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update user');
    }
  };

  const toggleAdmin = async (u) => {
    try {
      await updateUserApi(u._id, { role: u.role === 'admin' ? 'user' : 'admin' });
      toast.success('Role updated');
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update role');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      await deleteUserApi(id);
      toast.success('User deleted');
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete user');
    }
  };

  return (
    <AdminLayout title="Manage Users">
      {loading ? (
        <LoadingSpinner fullScreen />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-coffee-latte/30 text-left text-coffee-bean">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Joined</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-coffee-latte/10">
                  <td className="p-4 font-medium">{u.name}</td>
                  <td className="p-4 text-coffee-bean">{u.email}</td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        u.role === 'admin'
                          ? 'bg-coffee-mocha text-white'
                          : 'bg-coffee-cream text-coffee-espresso dark:bg-coffee-bean/20 dark:text-coffee-cream'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        u.isActive
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                      }`}
                    >
                      {u.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="p-4 text-coffee-bean">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <div className="flex gap-3">
                      <button
                        onClick={() => toggleAdmin(u)}
                        disabled={u._id === currentUser._id}
                        title="Toggle admin role"
                        className="text-coffee-mocha disabled:opacity-30"
                      >
                        <ShieldCheck size={16} />
                      </button>
                      <button
                        onClick={() => toggleActive(u)}
                        disabled={u._id === currentUser._id}
                        title="Toggle active status"
                        className="text-amber-600 disabled:opacity-30"
                      >
                        {u.isActive ? <Ban size={16} /> : <CheckCircle size={16} />}
                      </button>
                      <button
                        onClick={() => handleDelete(u._id)}
                        disabled={u._id === currentUser._id}
                        className="text-red-500 disabled:opacity-30"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
