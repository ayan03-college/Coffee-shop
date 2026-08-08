import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import toast from 'react-hot-toast';
import { addToWishlistApi } from '../services/api.js';

export default function ProductCard({ product, index = 0 }) {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart(product._id, 'Medium', 1);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please log in to save favorites');
      return;
    }
    try {
      await addToWishlistApi(product._id);
      toast.success('Added to wishlist');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add to wishlist');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: (index % 8) * 0.05 }}
      whileHover={{ y: -6 }}
      className="group"
    >
      <Link to={`/product/${product.slug}`} className="card block h-full overflow-hidden">
        <div className="relative h-48 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <button
            onClick={handleWishlist}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-coffee-mocha shadow-soft transition-transform hover:scale-110"
            aria-label="Add to wishlist"
          >
            <Heart size={16} />
          </button>
          {product.isBestSeller && (
            <span className="absolute left-3 top-3 rounded-full bg-coffee-mocha px-3 py-1 text-xs font-bold text-white">
              Best Seller
            </span>
          )}
          {product.isNewArrival && !product.isBestSeller && (
            <span className="absolute left-3 top-3 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">
              New
            </span>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-lg font-semibold leading-tight">{product.name}</h3>
          </div>
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-coffee-mocha">
            {product.category}
          </p>
          <p className="mt-2 line-clamp-2 text-sm text-coffee-espresso/70 dark:text-coffee-cream/70">
            {product.description}
          </p>
          <div className="mt-3 flex items-center gap-1 text-sm">
            <Star size={14} className="fill-amber-400 text-amber-400" />
            <span className="font-medium">{product.rating.toFixed(1)}</span>
            <span className="text-coffee-espresso/50 dark:text-coffee-cream/50">
              ({product.numReviews})
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="font-display text-xl font-bold text-coffee-mocha">
              ₹{product.price}
            </span>
            <button
              onClick={handleQuickAdd}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-coffee-espresso text-white transition-colors hover:bg-coffee-mocha"
              aria-label="Add to cart"
            >
              <ShoppingCart size={16} />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
