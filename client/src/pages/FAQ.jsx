import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'What payment methods do you accept?',
    a: 'We accept Cash on Delivery, Credit/Debit Cards, and UPI. Card and UPI payments are processed securely through Stripe.',
  },
  {
    q: 'How long does delivery take?',
    a: 'Most orders are delivered within 30-45 minutes. Delivery is free on orders above ₹500.',
  },
  {
    q: 'Can I cancel my order?',
    a: 'Yes, you can cancel an order from the "My Orders" page as long as it is still in the "Pending" status.',
  },
  {
    q: 'How do I apply a coupon code?',
    a: 'Enter your coupon code in the cart page before checkout. Valid codes include WELCOME10, COFFEE20, and FIRSTORDER.',
  },
  {
    q: 'Do you offer decaf or dairy-free options?',
    a: 'Yes! Most of our drinks can be customized. Reach out via our contact page for specific requests.',
  },
  {
    q: 'How do I track my order?',
    a: 'Head to "My Orders" from your profile menu to see real-time status updates for every order.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="section-title text-center">Frequently Asked Questions</h1>
      <div className="mt-10 space-y-3">
        {faqs.map((faq, i) => (
          <div key={faq.q} className="card overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
              className="flex w-full items-center justify-between p-5 text-left font-medium"
            >
              {faq.q}
              <ChevronDown
                size={18}
                className={`shrink-0 transition-transform ${openIndex === i ? 'rotate-180' : ''}`}
              />
            </button>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-sm text-coffee-espresso/70 dark:text-coffee-cream/70">
                    {faq.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
