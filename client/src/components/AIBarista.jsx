import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, X, Send, Sparkles } from 'lucide-react';
import { chatWithBaristaApi } from '../services/api.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AIBarista() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi, I'm Milo, your AI barista! ☕ Ask me for a drink recommendation, or anything about our menu.",
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const sendMessage = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    const newMessages = [...messages, { role: 'user', content: trimmed }];
    setMessages(newMessages);
    setInput('');
    setSending(true);

    // Add an empty assistant bubble up front — we'll fill it in as chunks arrive
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    try {
      const response = await fetch(`${API_URL}/ai/barista/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, history: newMessages }),
      });

      if (!response.ok || !response.body) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || 'AI Barista is temporarily unavailable');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;

        // Append this chunk to the last (assistant) message, keeping the rest intact
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          updated[updated.length - 1] = { ...last, content: last.content + chunk };
          return updated;
        });
      }
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content:
            err.message || 'Sorry, I\'m having trouble connecting right now. Please try again in a moment.',
        };
        return updated;
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-coffee-mocha text-white shadow-glow"
        aria-label="Chat with AI Barista"
      >
        {open ? <X size={22} /> : <Coffee size={22} className="animate-float" />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-40 flex h-[28rem] w-[22rem] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-3xl bg-white shadow-soft dark:bg-[#2A1D14]"
          >
            <div className="flex items-center gap-2 bg-coffee-espresso px-4 py-3 text-white">
              <Sparkles size={18} />
              <div>
                <p className="font-display font-semibold leading-tight">Milo · AI Barista</p>
                <p className="text-xs text-coffee-cream/70">Ask for a recommendation</p>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    m.role === 'user'
                      ? 'ml-auto bg-coffee-mocha text-white'
                      : 'bg-coffee-cream text-coffee-espresso dark:bg-coffee-bean/30 dark:text-coffee-cream'
                  }`}
                >
                  {m.content}
                </div>
              ))}
              {sending && !messages[messages.length - 1]?.content && (
                <div className="flex w-fit items-center gap-1 rounded-2xl bg-coffee-cream px-3 py-2 dark:bg-coffee-bean/30">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-coffee-mocha"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={sendMessage} className="flex gap-2 border-t border-coffee-latte/30 p-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="What sounds good today?"
                className="input-field !py-2 text-sm"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={sending}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-coffee-mocha text-white disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
