import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Coffee, Instagram, Twitter, Facebook, MapPin, Phone, Mail, Send } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }
    toast.success('Thanks for subscribing! Check your inbox for a welcome offer ☕');
    setEmail('');
  };

  return (
    <footer className="mt-20 bg-coffee-espresso text-coffee-cream">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-coffee-mocha">
                <Coffee size={20} />
              </div>
              <span className="font-display text-xl font-bold">Brewhouse</span>
            </div>
            <p className="mt-4 text-sm text-coffee-cream/70">
              Premium, ethically-sourced coffee crafted with care. From bean to cup, every sip
              tells a story.
            </p>
            <div className="mt-5 flex gap-3">
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-coffee-mocha"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold">Quick Links</h4>
            <ul className="mt-4 space-y-2 text-sm text-coffee-cream/70">
              <li><Link to="/menu" className="hover:text-coffee-latte">Our Menu</Link></li>
              <li><Link to="/about" className="hover:text-coffee-latte">About Us</Link></li>
              <li><Link to="/faq" className="hover:text-coffee-latte">FAQ</Link></li>
              <li><Link to="/contact" className="hover:text-coffee-latte">Contact</Link></li>
              <li><Link to="/orders" className="hover:text-coffee-latte">Track Order</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold">Get in Touch</h4>
            <ul className="mt-4 space-y-3 text-sm text-coffee-cream/70">
              <li className="flex items-center gap-2">
                <MapPin size={16} /> 42 Brew Street, Bandra, Mumbai
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} /> +91 98765 43210
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} /> hello@brewhouse.coffee
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold">Newsletter</h4>
            <p className="mt-4 text-sm text-coffee-cream/70">
              Subscribe for exclusive offers, new arrivals, and brewing tips.
            </p>
            <form onSubmit={handleSubscribe} className="mt-4 flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="w-full rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm placeholder:text-coffee-cream/40 focus:outline-none focus:ring-2 focus:ring-coffee-mocha"
              />
              <button
                type="submit"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-coffee-mocha hover:bg-coffee-latte hover:text-coffee-espresso"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-coffee-cream/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Brewhouse Coffee Co. All rights reserved.</p>
          <p>Crafted with ☕ and care.</p>
        </div>
      </div>
    </footer>
  );
}
