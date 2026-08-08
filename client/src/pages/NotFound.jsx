import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Coffee, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex h-24 w-24 items-center justify-center rounded-full bg-coffee-cream text-coffee-mocha dark:bg-coffee-bean/20"
      >
        <Coffee size={40} />
      </motion.div>
      <h1 className="mt-6 font-display text-5xl font-bold">404</h1>
      <p className="mt-2 text-lg font-medium">Looks like this cup ran empty</p>
      <p className="mt-1 text-coffee-bean">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary mt-8">
        <Home size={18} /> Back to Home
      </Link>
    </div>
  );
}
