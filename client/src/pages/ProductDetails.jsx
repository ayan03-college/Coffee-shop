import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Star, Minus, Plus, ShoppingCart, Heart, Flame } from 'lucide-react';
import { fetchProductById, addToWishlistApi } from '../services/api.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ProductCard from '../components/ProductCard.jsx';
import ReviewsSection from '../components/ReviewsSection.jsx';

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [size, setSize] = useState('Medium');
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState('description');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchProductById(id);
        setProduct(res.data.product);
        setRelated(res.data.related);
        setSize('Medium');
        setQuantity(1);
        window.scrollTo(0, 0);
      } catch (err) {
        toast.error('Product not found');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (!product) return null;

  const sizeInfo = product.sizes.find((s) => s.label === size) || { priceModifier: 0 };
  const finalPrice = product.price + sizeInfo.priceModifier;

  const handleAddToCart = async () => {
    await addToCart(product._id, size, quantity);
  };

  const handleWishlist = async () => {
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
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative"
        >
          <img
            src={product.image}
            alt={product.name}
            className="aspect-square w-full rounded-3xl object-cover shadow-soft"
          />
          {product.isTodaySpecial && (
            <span className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-coffee-mocha px-3 py-1.5 text-xs font-bold text-white">
              <Flame size={14} /> Today's Special
            </span>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <p className="text-sm font-semibold uppercase tracking-wide text-coffee-mocha">
            {product.category}
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">{product.name}</h1>

          <div className="mt-3 flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star size={18} className="fill-amber-400 text-amber-400" />
              <span className="font-medium">{product.rating.toFixed(1)}</span>
            </div>
            <span className="text-coffee-bean">({product.numReviews} reviews)</span>
          </div>

          <p className="mt-4 text-coffee-espresso/70 dark:text-coffee-cream/70">
            {product.description}
          </p>

          <p className="mt-6 font-display text-3xl font-bold text-coffee-mocha">₹{finalPrice}</p>

          <div className="mt-6">
            <p className="mb-2 font-medium">Choose Size</p>
            <div className="flex gap-3">
              {product.sizes.map((s) => (
                <button
                  key={s.label}
                  onClick={() => setSize(s.label)}
                  className={`rounded-xl border-2 px-4 py-2 text-sm font-medium transition-colors ${
                    size === s.label
                      ? 'border-coffee-mocha bg-coffee-mocha text-white'
                      : 'border-coffee-latte/50 hover:border-coffee-mocha'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="mb-2 font-medium">Quantity</p>
            <div className="flex w-fit items-center gap-4 rounded-full border-2 border-coffee-latte/50 px-4 py-2">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
                <Minus size={16} />
              </button>
              <span className="w-6 text-center font-semibold">{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)} aria-label="Increase quantity">
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button onClick={handleAddToCart} className="btn-primary flex-1">
              <ShoppingCart size={18} /> Add to Cart
            </button>
            <button
              onClick={handleWishlist}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-coffee-mocha text-coffee-mocha hover:bg-coffee-mocha hover:text-white"
            >
              <Heart size={18} />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Tabs: description / ingredients / nutrition */}
      <div className="mt-14">
        <div className="flex gap-2 border-b border-coffee-latte/30">
          {['description', 'ingredients', 'nutrition'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-medium capitalize transition-colors ${
                tab === t
                  ? 'border-b-2 border-coffee-mocha text-coffee-mocha'
                  : 'text-coffee-espresso/60 dark:text-coffee-cream/60'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="py-6">
          {tab === 'description' && (
            <p className="text-coffee-espresso/80 dark:text-coffee-cream/80">{product.description}</p>
          )}
          {tab === 'ingredients' && (
            <ul className="list-inside list-disc space-y-1 text-coffee-espresso/80 dark:text-coffee-cream/80">
              {product.ingredients.map((ing) => (
                <li key={ing}>{ing}</li>
              ))}
            </ul>
          )}
          {tab === 'nutrition' && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {Object.entries(product.nutrition).map(([key, value]) => (
                <div key={key} className="card p-4 text-center">
                  <p className="text-xs uppercase text-coffee-bean">{key}</p>
                  <p className="mt-1 text-xl font-bold">
                    {value}
                    {key === 'calories' ? ' kcal' : key === 'caffeine' ? ' mg' : ' g'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ReviewsSection productId={product._id} />

      {related.length > 0 && (
        <div className="mt-14">
          <h3 className="section-title text-2xl">Related Products</h3>
          <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p, i) => (
              <ProductCard key={p._id} product={p} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
