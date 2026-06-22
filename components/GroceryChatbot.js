"use client";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, ShoppingCart, ArrowRight, Sparkles } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { products, categories } from "@/services/mockData";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/services/translations";
import SafeImage from "./SafeImage";

// ─── Bot knowledge base ───────────────────────────────────────────
const BOT_INTENTS = [
  {
    patterns: ['hi', 'hello', 'hey', 'hlo', 'namaste'],
    response: (name, t) => t.botWelcome.replace('Jenny', '**Jenny**'),
    chips: ['Fresh Fruits 🍎', 'Today\'s Deals 🏷️', 'Breakfast items 🌅'],
  },
  {
    patterns: ['fruit', 'apple', 'mango', 'banana', 'grape', 'watermelon'],
    response: () => `Here are our freshest fruits right now 🍎 All farm-picked within 24 hours!`,
    productCat: 'Fruits',
    chips: ['Add to cart', 'See all fruits'],
  },
  {
    patterns: ['vegetable', 'veggie', 'sabzi', 'tomato', 'onion', 'spinach', 'broccoli'],
    response: () => `Fresh veggies delivered daily from local farms 🥦 Here's what's available today:`,
    productCat: 'Vegetables',
    chips: ['Organic options', 'Add bundle to cart'],
  },
  {
    patterns: ['milk', 'dairy', 'egg', 'butter', 'cheese', 'curd', 'paneer', 'ghee'],
    response: () => `Our dairy section has everything for your kitchen 🥛 Cold-chain delivered in under 20 minutes:`,
    productCat: 'Dairy & Eggs',
    chips: ['See all dairy'],
  },
  {
    patterns: ['rice', 'dal', 'atta', 'flour', 'oil', 'staple', 'sugar', 'salt'],
    response: () => `Stocking up on staples? Great choice 🌾 Here are the best sellers:`,
    productCat: 'Staples',
    chips: ['Bundle & Save 20%'],
  },
  {
    patterns: ['snack', 'chips', 'biscuit', 'namkeen', 'maggi', 'noodle', 'cookie'],
    response: () => `Time for munchies? 🍿 These are flying off our shelves right now:`,
    productCat: 'Snacks',
    chips: ['Party snack box', 'Healthy snacks'],
  },
  {
    patterns: ['drink', 'juice', 'tea', 'coffee', 'beverage', 'water', 'cola'],
    response: () => `Thirsty? 🧃 Here are our top beverages — from morning chai to energy drinks:`,
    productCat: 'Beverages',
    chips: ['See all beverages'],
  },
  {
    patterns: ['breakfast', 'morning', 'subah'],
    response: () => `Good morning! 🌅 Here's the perfect breakfast combo — bread, milk, eggs & butter:`,
    productIds: ['301', '401', '302', '304'],
    chips: ['Add all to cart', 'Show more'],
  },
  {
    patterns: ['deal', 'offer', 'discount', 'sale', 'cheap', 'sasta', 'off'],
    response: () => `🔥 Flash deals active right now! Up to 20% off on these:`,
    productIds: ['402', '101', '404', '605'],
    chips: ['Apply coupon FRESH10', 'See all deals'],
  },
  {
    patterns: ['combo', 'bundle', 'package', 'offer box', 'saving'],
    response: (name, t) => t.botComboMsg,
    chips: ['✨ Traditional Combo', '🛡️ Immunity Booster', 'View all combos'],
  },
  {
    patterns: ['jaggery', 'gur', 'brown sugar', 'karupatti', 'sweetener'],
    response: () => `🍯 Our traditional jaggery is pure, organic, and perfect for a healthy lifestyle. Try these:`,
    productIds: ['411', '412', '413'],
    chips: ['Traditional Combo ✨', 'Staples section'],
  },
  {
    patterns: ['deliver', 'how long', 'time', 'fast', 'quick'],
    response: () => `⚡ We deliver in **10–20 minutes** across serviceable areas. Live tracking with delivery boy's location is shared as soon as order is placed. No minimum order for delivery (₹40 fee waived on orders ₹500+)!`,
    chips: ['Check my area', 'Place an order'],
  },
  {
    patterns: ['coupon', 'code', 'promo', 'discount code'],
    response: () => `🎁 Active coupon codes right now:\n\n**FRESH10** — 10% off on ₹200+\n**FIRST50** — ₹50 off your first order\n**ORGANIC15** — 15% off on ₹300+\n\nApply at checkout!`,
    chips: ['Shop & Apply', 'Go to checkout'],
  },
  {
    patterns: ['payment', 'pay', 'upi', 'card', 'cash', 'cod'],
    response: () => `💳 We support:\n- **UPI** (GPay, PhonePe, Paytm, BHIM)\n- **Credit/Debit Card** (Visa, Mastercard, Amex)\n- **Cash on Delivery**\n\nAll payments are 256-bit SSL encrypted 🔒`,
    chips: ['Place order', 'View cart'],
  },
  {
    patterns: ['help', 'support', 'problem', 'issue', 'return', 'refund'],
    response: () => `🙋 I'm here to help! For returns or refunds:\n- Orders can be returned within **24 hours** of delivery\n- Full refund processed in **2–3 business days**\n- Call us: **1800-XXX-XXXX** (free, 24/7)`,
    chips: ['Track my order', 'Place new order'],
  },
];

const FALLBACK = `Hmm, I didn't quite get that 🤔 Try asking:\n- "Show me today's deals"\n- "I need milk and bread"\n- "What's the delivery time?"`;

function matchIntent(text) {
  const lower = text.toLowerCase();
  for (const intent of BOT_INTENTS) {
    if (intent.patterns.some(p => lower.includes(p))) return intent;
  }
  return null;
}

function BotMessage({ msg, onChipClick, onAddToCart }) {
  return (
    <div className="flex items-start gap-2.5 max-w-[88%]">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center shrink-0 shadow-md mt-0.5">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="space-y-2 flex-1">
        {/* Text bubble */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-800 dark:text-gray-100 leading-relaxed whitespace-pre-line"
            dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
        </div>

        {/* Product suggestions */}
        {msg.products && msg.products.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {msg.products.slice(0, 3).map(p => (
              <div key={p.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-2.5 flex items-center gap-2 shadow-sm w-full sm:w-auto">
                <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                  <SafeImage 
                    src={p.image} 
                    alt={p.name} 
                    type="product"
                    entityId={p.id}
                    productName={p.name}
                    componentName="GroceryChatbot"
                    fill
                    sizes="36px"
                    objectFit="cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-800 dark:text-white truncate max-w-[100px]">{p.name}</p>
                  <p className="text-xs text-teal-600 font-black">₹{p.price}</p>
                </div>
                <button onClick={() => onAddToCart(p)}
                  className="shrink-0 p-1.5 rounded-xl text-white text-xs font-black flex items-center justify-center gap-1 transition-all hover:scale-105 active:scale-95 bg-gradient-to-br from-[#16A34A] to-[#22C55E]"
                  aria-label={`Add ${p.name} to cart`}>
                  <ShoppingCart className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Chips */}
        {msg.chips && msg.chips.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {msg.chips.map((chip, i) => (
              <button key={i} onClick={() => onChipClick(chip)}
                className="px-3 py-1.5 rounded-full text-xs font-bold border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30 hover:bg-teal-100 transition-colors">
                {chip}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function UserMessage({ text }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-tr-none text-white text-sm font-medium"
        style={{ background: 'linear-gradient(135deg,#00C9A7,#6366F1)' }}>
        {text}
      </div>
    </div>
  );
}

// ─── Main chatbot ───────────────────────────────────────────────
export default function GroceryChatbot() {
  // BLOCKED: Chatbot disabled until further notice
  return null;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const { addToCart, getCartCount } = useCart();
  const { language } = useLanguage();



  // Persistence and initialization
  const t = translations[language] || translations.EN;

  useEffect(() => {
    const savedMessages = sessionStorage.getItem('jenny_messages');
    const wasOpen = sessionStorage.getItem('jenny_was_open') === 'true';
    const hadInteracted = sessionStorage.getItem('jenny_interacted') === 'true';

    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
      setHasInteracted(hadInteracted);
      setOpen(wasOpen);
    } else {
      // First time welcome
      setMessages([{
        id: 1, role: 'bot',
        text: t.botWelcome,
        chips: ["I'm interested in Fruits 🍎", "Show me today's deals 🔥", 'What Snacks do you have? 🍿', 'Apply a coupon 🎁'],
        products: [],
      }]);
      
      // Auto-open only if never interacted
      if (!hadInteracted) {
        const timer = setTimeout(() => {
          setOpen(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem('jenny_messages', JSON.stringify(messages));
    }
    sessionStorage.setItem('jenny_was_open', open.toString());
    if (hasInteracted) {
      sessionStorage.setItem('jenny_interacted', 'true');
    }
  }, [messages, open, hasInteracted]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => {
    if (open) { setUnread(0); inputRef.current?.focus(); }
  }, [open]);

  const resolveProducts = (intent) => {
    if (intent.productIds) return intent.productIds.map(id => products.find(p => p.id === id)).filter(Boolean);
    if (intent.productCat) return products.filter(p => p.category === intent.productCat).slice(0, 3);
    return [];
  };

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setInput('');

    const userMsg = { id: Date.now(), role: 'user', text: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);

    await new Promise(r => setTimeout(r, 200 + Math.random() * 200));

    const intent = matchIntent(trimmed);
    const botText = intent ? intent.response(null, t) : FALLBACK;
    const botChips = intent?.chips || ['Fresh fruits 🍎', "Today's deals 🔥", 'Help 🙋'];
    const botProducts = intent ? resolveProducts(intent) : [];

    setTyping(false);
    setHasInteracted(true);
    setMessages(prev => [...prev, {
      id: Date.now() + 1, role: 'bot',
      text: botText, chips: botChips, products: botProducts,
    }]);
  };
  const handleChipClick = (chip) => {
    const lowerChip = chip.toLowerCase();
    if (lowerChip.includes('cart') || lowerChip.includes('checkout') || lowerChip.includes('view cart')) {
      window.location.href = '/cart';
      return;
    }
    if (lowerChip.includes('deal') || lowerChip.includes('offer')) {
      window.location.href = '/#deals';
      setOpen(false);
      return;
    }
    sendMessage(chip.replace(/[🍎🔥⚡🎁🌅🏷️🍿]/gu, '').replace("I'm interested in ", "").trim());
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    setMessages(prev => [...prev, {
      id: Date.now(), role: 'bot',
      text: `✅ **${product.name}** added to your cart! 🛒\n\nAnything else you need?`,
      chips: ['View cart 🛒', 'Continue shopping', 'Checkout now'],
      products: [],
    }]);
  };

  // Don't show on login page
  if (pathname === '/login') return null;

  return (
    <>
      {/* ── Floating trigger button ── */}
      <button
        onClick={() => { setOpen(o => !o); setHasInteracted(true); }}
        className="fixed bottom-24 sm:bottom-8 right-5 z-50 w-14 h-14 rounded-full text-white shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 animate-chatPing"
        style={{ background: 'linear-gradient(135deg,#16A34A 0%,#22C55E 100%)', boxShadow: '0 8px 32px rgba(34,197,94,0.35)' }}
        aria-label="Open AI Chat"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white">
            {unread}
          </span>
        )}
      </button>

      {/* ── Chat panel ── */}
      {open && (
        <div className="fixed bottom-44 sm:bottom-28 right-4 z-50 w-[340px] sm:w-[380px] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden animate-slideUp"
          style={{ maxHeight: '72vh', boxShadow: '0 32px 80px rgba(0,0,0,0.2)' }}>

          {/* Header */}
          <div className="px-5 py-4 text-white flex items-center justify-between shrink-0"
            style={{ background: 'linear-gradient(135deg,#16A34A 0%,#22C55E 100%)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-black text-sm">Jenny AI</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                  <p className="text-xs text-white/80 font-medium">Online · replies instantly</p>
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1.5 rounded-xl hover:bg-white/20 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950 no-scrollbar">
            {messages.map(msg =>
              msg.role === 'bot'
                ? <BotMessage key={msg.id} msg={msg} onChipClick={handleChipClick} onAddToCart={handleAddToCart} />
                : <UserMessage key={msg.id} text={msg.text} />
            )}
            {typing && (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-700 shadow-sm flex gap-1 items-center">
                  {[0,1,2].map(i => (
                    <span key={i} className="w-2 h-2 rounded-full bg-gray-400"
                      style={{ animation: `bounce 1.2s ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 text-sm px-4 py-2.5 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-teal-400/30 font-medium"
              />
              <button type="submit" disabled={!input.trim()}
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white disabled:opacity-40 transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg,#16A34A,#22C55E)' }}>
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="text-center text-[10px] text-gray-400 mt-2">Powered by Jenny AI · Not a real AI 😄</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </>
  );
}
