import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coffee,
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu as MenuIcon,
  X,
  Sun,
  Moon,
  LogOut,
  Package,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { fetchSearchSuggestions } from '../services/api.js';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totals } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (query.trim().length < 1) {
      setSuggestions([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const res = await fetchSearchSuggestions(query);
        setSuggestions(res.data.suggestions);
      } catch {
        setSuggestions([]);
      }
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  const submitSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/menu?search=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery('');
      setMobileOpen(false);
    }
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/menu', label: 'Menu' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-50 glass shadow-soft">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-coffee-mocha text-white shadow-soft">
            <Coffee size={20} />
          </div>
          <span className="hidden font-display text-xl font-bold text-coffee-espresso dark:text-coffee-cream sm:block">
            Brewhouse
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="font-medium text-coffee-espresso/80 transition-colors hover:text-coffee-mocha dark:text-coffee-cream/80 dark:hover:text-coffee-latte"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative" ref={searchRef}>
            <button
              onClick={() => setSearchOpen((o) => !o)}
              className="rounded-full p-2 text-coffee-espresso hover:bg-coffee-latte/30 dark:text-coffee-cream"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-80 rounded-2xl bg-white p-3 shadow-soft dark:bg-[#2A1D14]"
                >
                  <form onSubmit={submitSearch}>
                    <input
                      autoFocus
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search for coffee..."
                      className="input-field"
                    />
                  </form>
                  {suggestions.length > 0 && (
                    <ul className="mt-2 max-h-64 overflow-y-auto">
                      {suggestions.map((s) => (
                        <li key={s._id}>
                          <Link
                            to={`/product/${s.slug}`}
                            onClick={() => {
                              setSearchOpen(false);
                              setQuery('');
                            }}
                            className="flex items-center gap-3 rounded-xl p-2 hover:bg-coffee-cream dark:hover:bg-coffee-bean/20"
                          >
                            <img src={s.image} alt={s.name} className="h-10 w-10 rounded-lg object-cover" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">{s.name}</p>
                              <p className="text-xs text-coffee-bean">₹{s.price}</p>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={toggleTheme}
            className="rounded-full p-2 text-coffee-espresso hover:bg-coffee-latte/30 dark:text-coffee-cream"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {isAuthenticated && (
            <Link
              to="/wishlist"
              className="rounded-full p-2 text-coffee-espresso hover:bg-coffee-latte/30 dark:text-coffee-cream"
              aria-label="Wishlist"
            >
              <Heart size={20} />
            </Link>
          )}

          <Link
            to="/cart"
            className="relative rounded-full p-2 text-coffee-espresso hover:bg-coffee-latte/30 dark:text-coffee-cream"
            aria-label="Cart"
          >
            <ShoppingCart size={20} />
            {totals.itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-coffee-mocha text-[10px] font-bold text-white">
                {totals.itemCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-coffee-bean text-sm font-bold text-white"
              >
                {user.name.charAt(0).toUpperCase()}
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl bg-white shadow-soft dark:bg-[#2A1D14]"
                  >
                    <div className="border-b border-coffee-latte/30 px-4 py-3">
                      <p className="truncate font-semibold">{user.name}</p>
                      <p className="truncate text-xs text-coffee-bean">{user.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-coffee-cream dark:hover:bg-coffee-bean/20"
                    >
                      <User size={16} /> Profile
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-coffee-cream dark:hover:bg-coffee-bean/20"
                    >
                      <Package size={16} /> My Orders
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-coffee-cream dark:hover:bg-coffee-bean/20"
                      >
                        <LayoutDashboard size={16} /> Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                        navigate('/');
                      }}
                      className="flex w-full items-center gap-2 border-t border-coffee-latte/30 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/login" className="btn-primary hidden sm:inline-flex !px-4 !py-2 text-sm">
              Sign In
            </Link>
          )}

          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="rounded-full p-2 text-coffee-espresso hover:bg-coffee-latte/30 dark:text-coffee-cream md:hidden"
          >
            {mobileOpen ? <X size={20} /> : <MenuIcon size={20} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-coffee-latte/30 md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-3 py-2.5 font-medium hover:bg-coffee-cream dark:hover:bg-coffee-bean/20"
                >
                  {link.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary mt-2 justify-center"
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
