import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all fields');
      return;
    }
    setSending(true);
    setTimeout(() => {
      toast.success("Message sent! We'll get back to you soon.");
      setForm({ name: '', email: '', message: '' });
      setSending(false);
    }, 800);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="section-title">Get in Touch</h1>
        <p className="mt-2 text-coffee-espresso/60 dark:text-coffee-cream/60">
          Questions, feedback, or just want to say hi? We'd love to hear from you.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <motion.form
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          onSubmit={handleSubmit}
          className="card space-y-4 p-6"
        >
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Your name"
            className="input-field"
          />
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Your email"
            className="input-field"
          />
          <textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Your message"
            className="input-field min-h-[140px]"
          />
          <button type="submit" disabled={sending} className="btn-primary w-full">
            <Send size={16} /> {sending ? 'Sending...' : 'Send Message'}
          </button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          {[
            { icon: MapPin, title: 'Visit Us', text: '42 Brew Street, Bandra, Mumbai, MH 400050' },
            { icon: Phone, title: 'Call Us', text: '+91 98765 43210' },
            { icon: Mail, title: 'Email Us', text: 'hello@brewhouse.coffee' },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="card flex items-start gap-4 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-coffee-cream text-coffee-mocha dark:bg-coffee-bean/20">
                <Icon size={20} />
              </div>
              <div>
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-coffee-bean">{text}</p>
              </div>
            </div>
          ))}
          <div className="card overflow-hidden">
            <img
              src="https://source.unsplash.com/600x300/?mumbai,street"
              alt="Our location"
              className="h-48 w-full object-cover"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
