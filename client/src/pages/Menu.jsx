import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '../components/ProductCard.jsx';
import ProductCardSkeleton from '../components/ProductCardSkeleton.jsx';
import { fetchProducts } from '../services/api.js';

const categories = [
  'All',
  'Hot Coffee',
  'Cold Coffee',
  'Espresso',
  'Cappuccino',
  'Latte',
  'Mocha',
  'Americano',
  'Frappuccino',
];

export default function Menu() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const category = searchParams.get('category') || 'All';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || '';
  const featured = searchParams.get('featured') || '';
  const bestSeller = searchParams.get('bestSeller') || '';
  const newArrival = searchParams.get('newArrival') || '';

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchProducts({
        category: category === 'All' ? undefined : category,
        search: search || undefined,
        sort: sort || undefined,
        featured: featured || undefined,
        bestSeller: bestSeller || undefined,
        newArrival: newArrival || undefined,
        page,
        limit: 12,
      });
      setProducts(res.data.products);
      setPages(res.data.pages);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [category, search, sort, featured, bestSeller, newArrival, page]);

  useEffect(() => {
    setPage(1);
  }, [category, search, sort, featured, bestSeller, newArrival]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const clearFilters = () => setSearchParams({});

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="section-title">Our Coffee Menu</h1>
        <p className="mt-2 text-coffee-espresso/60 dark:text-coffee-cream/60">
          {products.length > 0 || loading ? 'Explore our full lineup of handcrafted coffee' : 'No coffees matched your search'}
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Filters sidebar */}
        <aside className="lg:w-64 lg:shrink-0">
          <button
            onClick={() => setFiltersOpen((o) => !o)}
            className="btn-secondary mb-4 w-full lg:hidden"
          >
            <SlidersHorizontal size={16} /> Filters
          </button>

          <div className={`${filtersOpen ? 'block' : 'hidden'} space-y-6 lg:block`}>
            <div className="card p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-semibold">Category</p>
                {(category !== 'All' || search) && (
                  <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-coffee-mocha">
                    <X size={12} /> Clear
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => updateParam('category', cat === 'All' ? '' : cat)}
                    className={`rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                      category === cat
                        ? 'bg-coffee-mocha text-white'
                        : 'hover:bg-coffee-cream dark:hover:bg-coffee-bean/20'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="card p-4">
              <p className="mb-3 font-semibold">Sort By</p>
              <select
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="input-field text-sm"
              >
                <option value="">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Best Rating</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {loading
              ? [...Array(9)].map((_, i) => <ProductCardSkeleton key={i} />)
              : products.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
          </div>

          {!loading && products.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-lg font-medium">No coffees found</p>
              <p className="text-coffee-bean">Try adjusting your filters or search term</p>
              <button onClick={clearFilters} className="btn-primary mt-4">
                Reset Filters
              </button>
            </div>
          )}

          {pages > 1 && (
            <div className="mt-10 flex justify-center gap-2">
              {[...Array(pages)].map((_, i) => (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setPage(i + 1)}
                  className={`h-10 w-10 rounded-full font-medium ${
                    page === i + 1
                      ? 'bg-coffee-mocha text-white'
                      : 'bg-white hover:bg-coffee-cream dark:bg-coffee-bean/20 dark:hover:bg-coffee-bean/40'
                  }`}
                >
                  {i + 1}
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
