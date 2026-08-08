import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Coffee, Truck, ShieldCheck, Star } from 'lucide-react';
import ProductCard from '../components/ProductCard.jsx';
import ProductCardSkeleton from '../components/ProductCardSkeleton.jsx';
import { fetchProducts } from '../services/api.js';

const Section = ({ title, subtitle, children, viewAllLink }) => (
  <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="section-title">{title}</h2>
        {subtitle && (
          <p className="mt-2 text-coffee-espresso/60 dark:text-coffee-cream/60">{subtitle}</p>
        )}
      </div>
      {viewAllLink && (
        <Link
          to={viewAllLink}
          className="flex items-center gap-1 font-medium text-coffee-mocha hover:underline"
        >
          View All <ArrowRight size={16} />
        </Link>
      )}
    </div>
    {children}
  </section>
);

const testimonials = [
  { name: 'Ananya Rao', text: 'The caramel macchiato here is unbeatable. Rich, smooth, and perfectly balanced every single time.', rating: 5 },
  { name: 'Rohan Mehta', text: 'Best cold brew in the city. The AI barista even helped me pick a drink I never would have tried!', rating: 5 },
  { name: 'Priya Nair', text: 'Cozy vibe, fast delivery, and the loyalty coupons make it even sweeter. My go-to coffee spot.', rating: 4 },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [popular, setPopular] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [todaySpecial, setTodaySpecial] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const [f, p, n, t] = await Promise.all([
          fetchProducts({ featured: true, limit: 4 }),
          fetchProducts({ bestSeller: true, limit: 4 }),
          fetchProducts({ newArrival: true, limit: 4 }),
          fetchProducts({ todaySpecial: true, limit: 4 }),
        ]);
        setFeatured(f.data.products);
        setPopular(p.data.products);
        setNewArrivals(n.data.products);
        setTodaySpecial(t.data.products);
      } catch (err) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-coffee-espresso via-coffee-bean to-coffee-mocha text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-coffee-latte blur-3xl" />
          <div className="absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-coffee-cream blur-3xl" />
        </div>
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28 lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-xs">
              ☕ Freshly Roasted, Daily
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              Crafted Coffee, <br />
              <span className="text-coffee-latte">Poured With Passion</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-coffee-cream/80">
              From single-origin espresso to indulgent frappuccinos — discover premium coffee
              made for every mood, delivered straight to your door.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/menu" className="btn-primary !bg-coffee-latte !text-coffee-espresso hover:!bg-white">
                Order Now <ArrowRight size={18} />
              </Link>
              <Link to="/about" className="btn-secondary !border-white !text-white hover:!bg-white hover:!text-coffee-espresso">
                Our Story
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="animate-float rounded-full bg-white/10 p-8 backdrop-blur-xs">
              <img
                src="https://source.unsplash.com/500x500/?latte,coffee-art"
                alt="Signature latte"
                className="h-72 w-72 rounded-full object-cover shadow-glow sm:h-96 sm:w-96"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-b border-coffee-latte/20 bg-white dark:bg-[#241812]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-10 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            { icon: Coffee, title: '100% Arabica Beans', text: 'Ethically sourced, freshly roasted' },
            { icon: Truck, title: 'Fast Delivery', text: 'Free delivery on orders above ₹500' },
            { icon: ShieldCheck, title: 'Secure Checkout', text: 'Safe payments, every time' },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-coffee-cream text-coffee-mocha dark:bg-coffee-bean/20">
                <Icon size={22} />
              </div>
              <div>
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-coffee-espresso/60 dark:text-coffee-cream/60">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Section title="Featured Coffees" subtitle="Our signature blends, handpicked for you" viewAllLink="/menu?featured=true">
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? [...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)
            : featured.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
        </div>
      </Section>

      <section className="bg-coffee-cream/40 dark:bg-coffee-bean/10">
        <Section title="Popular Drinks" subtitle="What everyone's ordering this week" viewAllLink="/menu?bestSeller=true">
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {loading
              ? [...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)
              : popular.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
          </div>
        </Section>
      </section>

      <Section title="New Arrivals" subtitle="Fresh off the menu" viewAllLink="/menu?newArrival=true">
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? [...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)
            : newArrivals.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
        </div>
      </Section>

      <section className="bg-coffee-espresso text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="section-title !text-coffee-cream">Today's Special</h2>
          <p className="mt-2 text-coffee-cream/60">Limited-time picks, brewed just for today</p>
          <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {loading
              ? [...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)
              : todaySpecial.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
          </div>
        </div>
      </section>

      <Section title="What Our Customers Say">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card p-6"
            >
              <div className="flex gap-1">
                {[...Array(5)].map((_, idx) => (
                  <Star
                    key={idx}
                    size={16}
                    className={idx < t.rating ? 'fill-amber-400 text-amber-400' : 'text-coffee-latte'}
                  />
                ))}
              </div>
              <p className="mt-3 text-sm text-coffee-espresso/80 dark:text-coffee-cream/80">
                "{t.text}"
              </p>
              <p className="mt-4 font-semibold">{t.name}</p>
            </motion.div>
          ))}
        </div>
      </Section>
    </div>
  );
}
