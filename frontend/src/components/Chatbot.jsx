import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Leaf, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Chatbot = () => {
  const { user, askChatbot } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! I'm EcoBot, your sustainability assistant. Ask me anything about carbon footprints, green actions, or how to use this platform!",
      time: new Date()
    }
  ]);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Local rule-based NLP response generator
  const getBotResponse = (query) => {
    const q = query.toLowerCase();
    
    // Quick keyword matching for rich responses
    if (q.includes('hello') || q.includes('hi ') || q.includes('hey')) {
      return `Hello! How can I help you take steps towards sustainability today? 🌿`;
    }
    
    if (q.includes('score') || q.includes('good carbon') || q.includes('average')) {
      return `In the US/Europe, the average carbon footprint is around 16,000 kg CO2/year! A sustainable global target is under **2,000 kg CO2/year**.
      
Use our **Calculator** to get your current score, then check the **Dashboard** for custom tips!`;
    }

    if (q.includes('transport') || q.includes('car') || q.includes('fly') || q.includes('flight')) {
      return `Transportation represents a major portion of individual emissions. Here are top reductions:
      
• **Ditch the single-passenger drive**: Carpool, walk, cycle, or use public transit.
• **Fly less**: One round-trip international flight can equal a whole year of driving! Consider rail or holidaying closer to home.
• **Drive efficiently**: Check tire pressure, avoid heavy acceleration, and switch to electric when possible.`;
    }

    if (q.includes('electricity') || q.includes('energy') || q.includes('light') || q.includes('heat') || q.includes('power')) {
      return `Energy conservation is easy and saves you money! 💡
      
• **Unplug standby power**: Off-devices still drain power (phantom load).
• **Switch to LED bulbs**: They use 75% less energy and last 25x longer.
• **Smart Thermostat**: Adjust temperature by 1-2 degrees.
• **Renewable Plan**: Ask your local electricity provider for green tariffs (solar/wind source).`;
    }

    if (q.includes('food') || q.includes('eat') || q.includes('meat') || q.includes('vegan') || q.includes('vegetarian')) {
      return `Food habits heavily affect global emissions! 🍎
      
• **Embrace plant-based**: Beef production creates 10x the emissions of poultry and 30x of vegetables. Going meatless just 1-2 days a week makes a massive impact.
• **Buy local and seasonal**: Reduces food-miles (freight emissions).
• **Compost**: Food rotting in landfills releases methane, a powerful greenhouse gas!`;
    }

    if (q.includes('waste') || q.includes('recycle') || q.includes('plastic')) {
      return `Minimizing waste helps keep landfills empty and reduces production energy:
      
• **Ditch single-use plastic**: Carry reusable bottles, bags, and cups.
• **Compost organics**: Diverts landfill waste.
• **Buy secondhand**: Extends the lifecycle of products.
• **Recycle correctly**: Clean your recyclables before placing them in bins.`;
    }

    if (q.includes('points') || q.includes('eco-points') || q.includes('earn') || q.includes('leaderboard')) {
      return `You can earn **Eco-Points (EP)** by:
      
1. Logging your carbon footprint in the **Calculator** (+50 EP).
2. Completing daily challenges in the **Action Center** (+10 to +20 EP).
3. Accomplishing carbon reduction **Goals** (+150 EP bonus!).
      
Exchange 100 EP to **plant a virtual tree** in our tracker!`;
    }

    if (q.includes('tree') || q.includes('plant')) {
      return `Virtual trees can be planted from the **Action Center**! 🌲
      
For every 100 Eco-Points you redeem, we log a tree under your profile and broadcast it to the Community. This represents your commitment to reforestation and offsetting carbon!`;
    }

    if (q.includes('badge') || q.includes('milestone')) {
      return `Badges are unlocked by completing carbon reduction goals.
      
• **Transport goals** yield the **"Green Commuter"** badge.
• **Energy goals** yield **"Energy Saver"** badge.
• **Food goals** yield **"Food Defender"** badge.
• **Waste goals** yield **"Waste Warrior"** badge.
      
Achieving goals also awards a major +150 Eco-Points bonus! 🏆`;
    }

    if (q.includes('help') || q.includes('what can you do') || q.includes('features')) {
      return `I can guide you through the platform:
      
• Type **"points"** to learn about Eco-Points.
• Type **"transport"**, **"energy"**, **"food"** or **"waste"** for sustainability tips.
• Type **"score"** to understand emissions thresholds.
• Type **"badges"** to see achievements info.`;
    }

    // Default response
    return `Interesting question! To reduce emissions, remember the core hierarchy: **Refuse, Reduce, Reuse, Recycle**.
    
Would you like tips on **transportation**, **food**, **energy**, or **waste**? Just type the category! 🌍`;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      sender: 'user',
      text: input,
      time: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');

    // Call API with fallback
    const reply = await askChatbot(currentInput);
    const botReply = {
      sender: 'bot',
      text: reply || getBotResponse(currentInput),
      time: new Date()
    };
    setMessages(prev => [...prev, botReply]);
  };

  const handleQuickReply = async (text) => {
    const userMessage = {
      sender: 'user',
      text: text,
      time: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    // Call API with fallback
    const reply = await askChatbot(text);
    const botReply = {
      sender: 'bot',
      text: reply || getBotResponse(text),
      time: new Date()
    };
    setMessages(prev => [...prev, botReply]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-eco-500 to-ocean-500 text-white shadow-xl hover:shadow-eco-500/25 transition-all duration-300 transform hover:scale-110 active:scale-95 animate-bounce"
          style={{ animationDuration: '3s' }}
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}

      {/* Chatbox Window */}
      {isOpen && (
        <div className="w-[330px] sm:w-[380px] h-[500px] flex flex-col rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-all duration-300 animate-slide-up">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-eco-500 to-ocean-500 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-white">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-none flex items-center">
                  EcoBot Assistant
                  <Sparkles className="h-3 w-3 ml-1 text-yellow-200 animate-pulse" />
                </h3>
                <span className="text-[10px] text-white/80">Active now</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Panel */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-950/40">
            {messages.map((msg, index) => {
              const isBot = msg.sender === 'bot';
              return (
                <div
                  key={index}
                  className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm whitespace-pre-line leading-relaxed ${
                      isBot
                        ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-100 dark:border-slate-700/50'
                        : 'bg-eco-500 text-white rounded-tr-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap gap-1.5">
            <button
              onClick={() => handleQuickReply('How to earn points?')}
              className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-eco-50 dark:hover:bg-eco-950/30 hover:text-eco-600 dark:hover:text-eco-400 border border-slate-200 dark:border-slate-700/50 transition-all font-medium"
            >
              🌱 Earn Points
            </button>
            <button
              onClick={() => handleQuickReply('Reduce transport footprint')}
              className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-eco-50 dark:hover:bg-eco-950/30 hover:text-eco-600 dark:hover:text-eco-400 border border-slate-200 dark:border-slate-700/50 transition-all font-medium"
            >
              🚗 Transport Tips
            </button>
            <button
              onClick={() => handleQuickReply('Reduce electricity')}
              className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-eco-50 dark:hover:bg-eco-950/30 hover:text-eco-600 dark:hover:text-eco-400 border border-slate-200 dark:border-slate-700/50 transition-all font-medium"
            >
              💡 Energy Savings
            </button>
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSend}
            className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 bg-slate-50 dark:bg-slate-850 px-4 py-2 text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-eco-500 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-eco-500 hover:bg-eco-600 text-white shadow-md shadow-eco-500/10 transition-colors"
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
};

export default Chatbot;
