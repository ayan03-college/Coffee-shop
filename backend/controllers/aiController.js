const asyncHandler = require('../utils/asyncHandler');
const Product = require('../models/Product');

// Google auto-updates this alias to whichever Flash model is current, so we
// don't have to manually chase model retirements/renames going forward.
const GEMINI_MODEL = 'gemini-flash-latest';
const geminiEnabled = !!process.env.GEMINI_API_KEY;

// @desc    Chat with the AI Barista (recommendations, FAQ, menu help)
// @route   POST /api/ai/barista
// @access  Public
const chatWithBarista = asyncHandler(async (req, res) => {
  if (!geminiEnabled) {
    return res.status(503).json({
      success: false,
      message:
        'AI Barista is not configured. Set GEMINI_API_KEY in the backend .env file to enable this feature.',
    });
  }

  const { message, history } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, message: 'Message is required' });
  }

  // Give the model light grounding in the current menu so recommendations are real
  const products = await Product.find({})
    .select('name category price rating description isBestSeller isTodaySpecial')
    .limit(40)
    .lean();

  const menuContext = products
    .map(
      (p) =>
        `- ${p.name} (${p.category}) - ₹${p.price} - rating ${p.rating}/5${
          p.isBestSeller ? ' - Best Seller' : ''
        }${p.isTodaySpecial ? ' - Today\'s Special' : ''}`
    )
    .join('\n');

  const systemPrompt = `You are "Milo", the friendly AI barista for Brewhouse Coffee Co., a premium coffee shop. You help customers pick drinks, answer questions about ingredients, caffeine content, and store policies, and give warm, concise recommendations. Keep replies short (2-4 sentences) and conversational, like a real barista chatting at the counter. Only recommend drinks from the menu below. If asked something unrelated to coffee, the shop, or orders, politely redirect back to how you can help with their order.

Current menu:
${menuContext}`;

  const conversationHistory = Array.isArray(history)
    ? history.slice(-8).map((h) => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: String(h.content || '').slice(0, 2000) }],
      }))
    : [];

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [...conversationHistory, { role: 'user', parts: [{ text: message }] }],
          generationConfig: {
          maxOutputTokens: 1024,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    });

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      console.error('AI Barista error:', data?.error?.message || geminiRes.statusText);
      return res.status(502).json({ success: false, message: 'AI Barista is temporarily unavailable' });
    }

    const reply = (data?.candidates?.[0]?.content?.parts || [])
      .map((part) => part.text || '')
      .join('\n')
      .trim();

    if (!reply) {
      return res.status(502).json({ success: false, message: 'AI Barista is temporarily unavailable' });
    }

    res.json({ success: true, reply });
  } catch (error) {
    console.error('AI Barista error:', error.message);
    res.status(502).json({ success: false, message: 'AI Barista is temporarily unavailable' });
  }
});

// @desc    Chat with the AI Barista, streamed token-by-token in real time
// @route   POST /api/ai/barista/stream
// @access  Public
const chatWithBaristaStream = asyncHandler(async (req, res) => {
  if (!geminiEnabled) {
    return res.status(503).json({
      success: false,
      message:
        'AI Barista is not configured. Set GEMINI_API_KEY in the backend .env file to enable this feature.',
    });
  }

  const { message, history } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, message: 'Message is required' });
  }

  const products = await Product.find({})
    .select('name category price rating description isBestSeller isTodaySpecial')
    .limit(40)
    .lean();

  const menuContext = products
    .map(
      (p) =>
        `- ${p.name} (${p.category}) - ₹${p.price} - rating ${p.rating}/5${
          p.isBestSeller ? ' - Best Seller' : ''
        }${p.isTodaySpecial ? ' - Today\'s Special' : ''}`
    )
    .join('\n');

  const systemPrompt = `You are "Milo", the friendly AI barista for Brewhouse Coffee Co., a premium coffee shop. You help customers pick drinks, answer questions about ingredients, caffeine content, and store policies, and give warm, concise recommendations. Keep replies short (2-4 sentences) and conversational, like a real barista chatting at the counter. Only recommend drinks from the menu below. If asked something unrelated to coffee, the shop, or orders, politely redirect back to how you can help with their order.

Current menu:
${menuContext}`;

  const conversationHistory = Array.isArray(history)
    ? history.slice(-8).map((h) => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: String(h.content || '').slice(0, 2000) }],
      }))
    : [];

  try {
    // Gemini's streamGenerateContent endpoint + alt=sse sends the reply back
    // in small chunks as they're generated, instead of one big blob.
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse`;
    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [...conversationHistory, { role: 'user', parts: [{ text: message }] }],
        generationConfig: {
          maxOutputTokens: 1024,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    });

    if (!geminiRes.ok || !geminiRes.body) {
      console.error('AI Barista stream error:', geminiRes.statusText);
      return res.status(502).json({ success: false, message: 'AI Barista is temporarily unavailable' });
    }

    // Tell the browser (and any proxy in front of it) not to buffer this
    // response — we want each chunk flushed to the client immediately.
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('X-Accel-Buffering', 'no');

    const reader = geminiRes.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // last (possibly incomplete) line stays in the buffer

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;

        const jsonStr = trimmed.slice(5).trim();
        if (!jsonStr) continue;

        try {
          const parsed = JSON.parse(jsonStr);
          const textChunk = (parsed?.candidates?.[0]?.content?.parts || [])
            .map((part) => part.text || '')
            .join('');
          if (textChunk) {
            res.write(textChunk); // push this piece straight to the browser
          }
        } catch {
          // Incomplete/partial JSON chunk — safe to skip, next read fills it in
        }
      }
    }

    res.end();
  } catch (error) {
    console.error('AI Barista stream error:', error.message);
    if (!res.headersSent) {
      res.status(502).json({ success: false, message: 'AI Barista is temporarily unavailable' });
    } else {
      res.end();
    }
  }
});

module.exports = { chatWithBarista, chatWithBaristaStream };
