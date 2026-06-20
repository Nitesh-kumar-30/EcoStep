import express from 'express';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// In-Memory cache for AI Chatbot responses (mitigates quota drainage and enhances efficiency)
const chatCache = new Map();
const MAX_CACHE_SIZE = 100;
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes Time-To-Live

// Periodic garbage collection for expired entries
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of chatCache.entries()) {
    if (now > val.expiry) {
      chatCache.delete(key);
    }
  }
}, 600000); // Runs every 10 mins

// Local Rule-Based fallback responder
const getFallbackResponse = (query, username) => {
  const q = query.toLowerCase();
  
  if (q.includes('hello') || q.includes('hi ') || q.includes('hey')) {
    return `Hello ${username || 'there'}! How can I help you take steps towards sustainability today? 🌿`;
  }
  
  if (q.includes('score') || q.includes('good carbon') || q.includes('average')) {
    return `In the US/Europe, the average carbon footprint is around 16,000 kg CO2/year! A sustainable global target is under **2,000 kg CO2/year**.\n\nUse our **Calculator** to get your current score, then check the **Dashboard** for custom tips!`;
  }

  if (q.includes('transport') || q.includes('car') || q.includes('fly') || q.includes('flight')) {
    return `Transportation represents a major portion of individual emissions. Here are top reductions:\n\n• **Ditch the single-passenger drive**: Carpool, walk, cycle, or use public transit.\n• **Fly less**: One round-trip international flight can equal a whole year of driving! Consider rail or holidaying closer to home.\n• **Drive efficiently**: Check tire pressure, avoid heavy acceleration, and switch to electric when possible.`;
  }

  if (q.includes('electricity') || q.includes('energy') || q.includes('light') || q.includes('heat') || q.includes('power')) {
    return `Energy conservation is easy and saves you money! 💡\n\n• **Unplug standby power**: Off-devices still drain power (phantom load).\n• **Switch to LED bulbs**: They use 75% less energy and last 25x longer.\n• **Smart Thermostat**: Adjust temperature by 1-2 degrees.\n• **Renewable Plan**: Ask your local electricity provider for green tariffs (solar/wind source).`;
  }

  if (q.includes('food') || q.includes('eat') || q.includes('meat') || q.includes('vegan') || q.includes('vegetarian')) {
    return `Food habits heavily affect global emissions! 🍎\n\n• **Embrace plant-based**: Beef production creates 10x the emissions of poultry and 30x of vegetables. Going meatless just 1-2 days a week makes a massive impact.\n• **Buy local and seasonal**: Reduces food-miles (freight emissions).\n• **Compost**: Food rotting in landfills releases methane, a powerful greenhouse gas!`;
  }

  if (q.includes('waste') || q.includes('recycle') || q.includes('plastic')) {
    return `Minimizing waste helps keep landfills empty and reduces production energy:\n\n• **Ditch single-use plastic**: Carry reusable bottles, bags, and cups.\n• **Compost organics**: Diverts landfill waste.\n• **Buy secondhand**: Extends the lifecycle of products.\n• **Recycle correctly**: Clean your recyclables before placing them in bins.`;
  }

  if (q.includes('points') || q.includes('eco-points') || q.includes('earn') || q.includes('leaderboard')) {
    return `You can earn **Eco-Points (EP)** by:\n\n1. Logging your carbon footprint in the **Calculator** (+50 EP).\n2. Completing daily challenges in the **Action Center** (+10 to +20 EP).\n3. Accomplishing carbon reduction **Goals** (+150 EP bonus!).\n\nExchange 100 EP to **plant a virtual tree** in our tracker!`;
  }

  if (q.includes('tree') || q.includes('plant')) {
    return `Virtual trees can be planted from the **Action Center**!\n\nFor every 100 Eco-Points you redeem, we log a tree under your profile and broadcast it to the Community. This represents your commitment to reforestation and offsetting carbon!`;
  }

  return `Interesting question! To reduce emissions, remember the core hierarchy: **Refuse, Reduce, Reuse, Recycle**.\n\nWould you like tips on **transportation**, **food**, **energy**, or **waste**? Just ask me! 🌍`;
};

// @route   POST /api/chat
// @desc    Get AI sustainability guidance using Gemini API or rule-based fallback
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { message } = req.body;
    const username = req.user.username;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Chat message cannot be empty.' });
    }

    const cleanMsg = message.trim();
    // Cache key incorporates username to avoid cross-user response contamination
    const cacheKey = `${username}_${cleanMsg.toLowerCase()}`;

    // Check Cache first
    if (chatCache.has(cacheKey)) {
      const cached = chatCache.get(cacheKey);
      if (Date.now() < cached.expiry) {
        return res.json({ reply: cached.reply, source: 'cache' });
      } else {
        chatCache.delete(cacheKey);
      }
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Check if the key is default/placeholder or missing
    if (!apiKey || apiKey === 'your_api_key' || apiKey.startsWith('your_')) {
      const reply = getFallbackResponse(cleanMsg, username);
      return res.json({ reply, source: 'fallback' });
    }

    // Call Gemini API directly using native node fetch
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const systemPrompt = `You are EcoBot, a helpful, encouraging sustainability assistant on the EcoStep Carbon Footprint Awareness platform. 
The user logged in is named "${username}".
Your job is to answer the user's questions about environment, sustainability, climate change, and reducing carbon footprint.
Keep your responses concise (under 150 words), structured with bullet points and clear emojis.
If they ask about platform features, describe:
- Eco-Points (EP): Calculator yields 50 EP, Challenges yield 10-20 EP, Goals yields 150 EP.
- Trees: Plant a virtual tree in Action Center using 100 EP.
- Badges: Completed goals unlock category badges like "Green Commuter" or "Energy Saver".`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: systemPrompt },
              { text: `User message: "${message}"` }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn('Gemini API call failed, falling back to rule-based response. Error:', errorData);
      const reply = getFallbackResponse(cleanMsg, username);
      return res.json({ reply, source: 'fallback-after-error' });
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
      const reply = data.candidates[0].content.parts[0].text;

      // Save to Cache
      if (chatCache.size >= MAX_CACHE_SIZE) {
        // Evict oldest entry (Map keeps insertion order)
        const oldestKey = chatCache.keys().next().value;
        chatCache.delete(oldestKey);
      }
      chatCache.set(cacheKey, {
        reply,
        expiry: Date.now() + CACHE_TTL
      });

      return res.json({ reply, source: 'gemini' });
    } else {
      console.warn('Invalid response structure from Gemini API, falling back.');
      const reply = getFallbackResponse(cleanMsg, username);
      return res.json({ reply, source: 'fallback-invalid-structure' });
    }

  } catch (err) {
    console.error('Chat endpoint error:', err);
    try {
      const reply = getFallbackResponse(req.body.message, req.user?.username);
      res.json({ reply, source: 'fallback-catch-error' });
    } catch (fallbackErr) {
      next(err); // Centralized error handling
    }
  }
});

export default router;
