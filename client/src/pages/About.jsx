import { motion } from 'framer-motion';
import { Leaf, Users, Award } from 'lucide-react';

export default function About() {
  return (
    <div>
      <section className="bg-coffee-espresso py-20 text-center text-white">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-4xl font-bold sm:text-5xl"
        >
          Our Story
        </motion.h1>
        <p className="mx-auto mt-4 max-w-xl px-4 text-coffee-cream/70">
          From a single cart on a Mumbai street corner to a beloved coffee house — this is Brewhouse.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <motion.img
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            src="https://source.unsplash.com/600x500/?coffee-shop,barista"
            alt="Our coffee shop"
            className="rounded-3xl object-cover shadow-soft"
          />
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">Brewed From Passion</h2>
            <p className="mt-4 text-coffee-espresso/70 dark:text-coffee-cream/70">
              Founded in 2018, Brewhouse Coffee Co. started with a simple mission: to serve
              honest, delicious coffee made from ethically-sourced beans. What began as a tiny
              cart has grown into a beloved neighborhood coffee house — but our commitment to
              quality has never changed.
            </p>
            <p className="mt-4 text-coffee-espresso/70 dark:text-coffee-cream/70">
              Every bean is hand-selected, every drink is crafted with care, and every customer
              is treated like family.
            </p>
          </motion.div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            { icon: Leaf, title: 'Ethically Sourced', text: 'Direct trade with farmers who share our values.' },
            { icon: Award, title: 'Award-Winning', text: 'Recognized for quality and sustainability since 2020.' },
            { icon: Users, title: 'Community First', text: 'A gathering place for coffee lovers of every kind.' },
          ].map(({ icon: Icon, title, text }) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="card p-6 text-center"
            >
              <Icon size={28} className="mx-auto text-coffee-mocha" />
              <h3 className="mt-3 font-display font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-coffee-bean">{text}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
