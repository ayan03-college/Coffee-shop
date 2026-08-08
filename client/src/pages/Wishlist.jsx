import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { fetchWishlist, removeFromWishlistApi } from '../services/api.js';
import { useCart } from '../context/CartContext.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchWishlist();
      setItems(res.data.wishlist);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRemove = async (id) => {
    try {
      await removeFromWishlistApi(id);
      setItems((prev) => prev.filter((p) => p._id !== id));
      toast.success('Removed from wishlist');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not remove item');
    }
  };

  const handleMoveToCart = async (product) => {
    const success = await addToCart(product._id, 'Medium', 1);
    if (success) handleRemove(product._id);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 text-center">
        <Heart size={64} className="text-coffee-latte" />
        <h2 className="mt-6 font-display text-2xl font-bold">Your wishlist is empty</h2>
        <p className="mt-2 text-coffee-bean">Save your favorite coffees to order them later.</p>
        <Link to="/menu" className="btn-primary mt-6">
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="section-title mb-8">My Wishlist</h1>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((product) => (
          <motion.div key={product._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
            <Link to={`/product/${product.slug}`}>
              <img src={product.image} alt={product.name} className="h-44 w-full object-cover" />
            </Link>
            <div className="p-4">
              <Link to={`/product/${product.slug}`}>
                <h3 className="font-display font-semibold">{product.name}</h3>
              </Link>
              <p className="mt-1 font-bold text-coffee-mocha">₹{product.price}</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => handleMoveToCart(product)} className="btn-primary flex-1 !px-3 !py-2 text-sm">
                  <ShoppingCart size={14} /> Move to Cart
                </button>
                <button
                  onClick={() => handleRemove(product._id)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
