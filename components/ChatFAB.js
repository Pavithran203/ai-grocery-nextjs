"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, X, Send, Sparkles, User, Bot } from "lucide-react";

/* ─── Navigation helper: prepend back/home chips ─────────────── */
function withNav(chips, isHomeLevel = false) {
  const navChips = isHomeLevel ? ["🏠 Home"] : ["← Back", "🏠 Home"];
  const filtered = chips.filter(c => c !== "🏠 Home" && c !== "← Back");
  return [...navChips, ...filtered];
}

/* ─── FAQ Content Data ─────────────────────────────────────────── */
const FAQ_CONTENT = {
  delivery: {
    label: "🚚 Delivery Info",
    topics: {
      "Delivery Charges": "📋 **Delivery Charges**\n\n• **Free delivery** on orders above **₹199**\n• Orders below ₹199 — flat **₹29 delivery fee** (within 5 km)\n• Long-distance deliveries (>5 km) may have additional charges\n• No hidden fees — all charges shown at checkout",
      "Delivery Timing": "⏰ **Delivery Timing**\n\n• **Standard delivery:** 30–45 minutes within city limits\n• **Operating hours:** 7 AM to 10 PM daily\n• You can schedule a delivery slot at checkout\n• Peak hours (6–9 PM) may see slightly longer wait times",
      "Same-Day Delivery": "⚡ **Same-Day Delivery**\n\n• ✅ Orders placed before **7 PM** — delivered **same day**\n• ❌ Orders after 7 PM — delivered next morning\n• Same-day delivery is **free** on orders above ₹199\n• Available in all our current delivery zones",
      "Delivery Coverage": "📍 **Delivery Coverage Areas**\n\n• We deliver within a **30 km radius** of our store locations\n• Enter your delivery pincode on the homepage to check availability\n• Currently serving: All major zones within city limits\n• Expanding to new areas every month — stay tuned!",
    },
  },
  refund: {
    label: "💰 Refund Policy",
    topics: {
      "Refund Policy": "💰 **Refund Policy**\n\n• **100% refund or replacement** for:\n  - Damaged or spoilt items\n  - Expired products\n  - Incorrect item delivered\n  - Items not matching description\n• Refund is processed to the **original payment method**\n• **Refund or replacement** — your choice!",
      "Refund Processing Time": "⏳ **Refund Processing Time**\n\n• **Processing time:** 5–7 business days after approval\n• **UPI / Card payments:** May reflect in 2–3 business days\n• **Wallet credits:** Refunded instantly\n• You'll receive an email/SMS confirmation once refund is initiated",
      "Refund Eligibility": "✅ **Refund Eligibility**\n\nYou're eligible for a refund if:\n• Product arrived **damaged or spoilt**\n• Product is **expired**\n• **Wrong item** was delivered\n• **Missing items** from your order\n• Item doesn't match the **description or image**\n\n⚠️ Request must be raised within **48 hours** of delivery.",
    },
  },
  returns: {
    label: "📦 Returns",
    topics: {
      "Return Policy": "📦 **Return Policy**\n\n• We accept returns for **damaged, defective, or incorrect items**\n• Must be raised within **48 hours of delivery**\n• Items must be in **original packaging**\n• **Free pickup** arranged for eligible returns\n• Replacement or refund — whichever you prefer",
      "Return Eligibility": "✅ **Return Eligibility**\n\n**Eligible for return:**\n• Damaged or spoiled products\n• Expired items\n• Wrong product delivered\n• Items with packaging defects\n\n❌ **Not eligible for return:**\n• Fresh produce & vegetables\n• Personal care items (soap, shampoo, etc.)\n• Products with tampered seals",
      "Return Process": "📋 **Return Process (Step by Step)**\n\n**Step 1:** Go to **My Orders** in your profile\n**Step 2:** Select the order & tap **Return / Replace**\n**Step 3:** Choose the reason for return\n**Step 4:** Upload a photo (if damaged)\n**Step 5:** Submit — we'll arrange a **free pickup**\n\nNeed help? Contact support via live chat or call.",
    },
  },
  customerService: {
    label: "📞 Customer Service",
    topics: {
      "Contact Us": "📞 **Contact Us**\n\nYou can reach our support team through:\n\n• **Phone:** 1800-123-4567 (Toll Free)\n• **Email:** support@nearmart.in\n• **Live Chat:** Available on our website & app\n• **WhatsApp:** +91 98765 43210\n\nOur team is happy to help with any questions or concerns!",
      "Support Hours": "⏰ **Support Hours**\n\n• **Monday – Saturday:** 7:00 AM to 9:00 PM\n• **Sunday:** 9:00 AM to 6:00 PM\n• **Public Holidays:** 9:00 AM to 4:00 PM\n\n_Responses may take up to 2 hours during peak times._",
      "Live Chat": "💬 **Live Chat**\n\n• Available directly on our website & mobile app\n• **Estimated wait time:** Under 2 minutes\n• You can share images for damaged/wrong items\n• Chat history is saved in your account\n\n_Tap the chat icon on any page to start a conversation!_",
      "Complaint Escalation": "📋 **Complaint Escalation**\n\n**Level 1:** Contact our support team via live chat or call\n**Level 2:** Email your concern to escalation@nearmart.in\n**Level 3:** Reach out to our Grievance Officer at grievance@nearmart.in\n\nWe aim to resolve all complaints within **24–48 hours**.",
    },
  },
};

const DEFAULT_CHIPS = ["🚚 Delivery Info", "💰 Refund Policy", "📦 Returns", "📞 Customer Service"];
const FALLBACK_TEXT = `🤖 I'm here to help with delivery info, refunds, returns, and customer service. Try selecting one of the options below!`;

function getFAQResponse(text, flow, setFlow) {
  const lower = text.toLowerCase().trim();

  // Navigation: Back
  if (lower === "← back" || lower === "back") {
    const prev = flow.prevStep || "default";
    if (prev === "faq_categories") {
      setFlow({ step: "faq_categories" });
      return { text: "📋 **Frequently Asked Questions**\n\nChoose a category below:", chips: withNav(["🚚 Delivery Info", "💰 Refund Policy", "📦 Returns", "📞 Customer Service"], false) };
    }
    const categoryMap = {
      faq_delivery: { key: "delivery", step: "faq_delivery", label: "🚚 Delivery", chips: ["Delivery Charges", "Delivery Timing", "Same-Day Delivery", "Delivery Coverage"] },
      faq_refund: { key: "refund", step: "faq_refund", label: "💰 Refund", chips: ["Refund Policy", "Refund Processing Time", "Refund Eligibility"] },
      faq_returns: { key: "returns", step: "faq_returns", label: "📦 Returns", chips: ["Return Policy", "Return Eligibility", "Return Process"] },
      faq_customerService: { key: "customerService", step: "faq_customerService", label: "📞 Customer Service", chips: ["Contact Us", "Support Hours", "Live Chat", "Complaint Escalation"] },
    };
    if (categoryMap[prev]) {
      const cat = categoryMap[prev];
      setFlow({ step: cat.step, prevStep: "faq_categories" });
      return { text: `${cat.label}\n\nSelect a topic below:`, chips: withNav(cat.chips, false) };
    }
    setFlow({ step: "default" });
    return { text: "👋 Welcome back! How can I help you?", chips: DEFAULT_CHIPS };
  }

  // Navigation: Home — completely resets everything
  if (lower === "🏠 home" || lower === "home") {
    setFlow({ step: "default" });
    return { text: "👋 Hi! I'm **FAQ Assistant**. Ask me about delivery, refunds, returns, customer service, or anything about your order!", chips: DEFAULT_CHIPS, resetChat: true };
  }

  // Greetings
  if (["reset", "clear", "hi", "hello", "hey", "namaste"].includes(lower)) {
    setFlow({ step: "default" });
    return { text: "👋 Hi! I'm **FAQ Assistant**. Ask me about delivery, refunds, returns, customer service, or anything about your order!", chips: DEFAULT_CHIPS };
  }

  // Cancel
  if (lower === "cancel") {
    setFlow({ step: "default" });
    return { text: "Cancelled.", chips: DEFAULT_CHIPS, resetChat: true };
  }

  // FAQ Categories menu
  if (lower === "ask another question" || lower === "go back" || lower === "faq" || lower === "ℹ️ faq" || lower === "info") {
    setFlow({ step: "faq_categories" });
    return { text: "📋 **Frequently Asked Questions**\n\nChoose a category below:", chips: withNav(["🚚 Delivery Info", "💰 Refund Policy", "📦 Returns", "📞 Customer Service"], false) };
  }

  const faqHandlers = [
    { key: "delivery", label: "🚚 Delivery Info", step: "faq_delivery", data: FAQ_CONTENT.delivery, triggers: ["delivery", "🚚 delivery info"], keywordMap: { charge: "Delivery Charges", fee: "Delivery Charges", cost: "Delivery Charges", timing: "Delivery Timing", time: "Delivery Timing", "how long": "Delivery Timing", "same day": "Same-Day Delivery", today: "Same-Day Delivery", express: "Same-Day Delivery", coverage: "Delivery Coverage", area: "Delivery Coverage", radius: "Delivery Coverage", pincode: "Delivery Coverage", zone: "Delivery Coverage", where: "Delivery Coverage" }, topicChips: ["Delivery Charges", "Delivery Timing", "Same-Day Delivery", "Delivery Coverage"] },
    { key: "refund", label: "💰 Refund Policy", step: "faq_refund", data: FAQ_CONTENT.refund, triggers: ["refund", "💰 refund policy"], keywordMap: { policy: "Refund Policy", process: "Refund Processing Time", time: "Refund Processing Time", long: "Refund Processing Time", when: "Refund Processing Time", eligible: "Refund Eligibility", condition: "Refund Eligibility", qualify: "Refund Eligibility" }, topicChips: ["Refund Policy", "Refund Processing Time", "Refund Eligibility"] },
    { key: "returns", label: "📦 Returns", step: "faq_returns", data: FAQ_CONTENT.returns, triggers: ["return", "📦 returns"], keywordMap: { policy: "Return Policy", eligible: "Return Eligibility", condition: "Return Eligibility", qualify: "Return Eligibility", "not eligible": "Return Eligibility", cannot: "Return Eligibility", process: "Return Process", "how to": "Return Process", steps: "Return Process", procedure: "Return Process" }, topicChips: ["Return Policy", "Return Eligibility", "Return Process"] },
    { key: "customerService", label: "📞 Customer Service", step: "faq_customerService", data: FAQ_CONTENT.customerService, triggers: ["customer service", "📞 customer service", "support", "contact", "help", "complaint", "live chat", "call", "phone", "email"], keywordMap: { contact: "Contact Us", phone: "Contact Us", email: "Contact Us", call: "Contact Us", hours: "Support Hours", timing: "Support Hours", when: "Support Hours", "live chat": "Live Chat", chat: "Live Chat", complaint: "Complaint Escalation", escalation: "Complaint Escalation", grievance: "Complaint Escalation", issue: "Complaint Escalation", problem: "Complaint Escalation" }, topicChips: ["Contact Us", "Support Hours", "Live Chat", "Complaint Escalation"] },
  ];

  if (lower === "💬 more delivery faqs") {
    setFlow({ step: "faq_delivery", prevStep: "faq_categories" });
    return { text: "🚚 **Delivery Information**\n\nSelect a topic below:", chips: withNav(["Delivery Charges", "Delivery Timing", "Same-Day Delivery", "Delivery Coverage"], false) };
  }
  if (lower === "💬 more refund faqs") {
    setFlow({ step: "faq_refund", prevStep: "faq_categories" });
    return { text: "💰 **Refund Information**\n\nSelect a topic below:", chips: withNav(["Refund Policy", "Refund Processing Time", "Refund Eligibility"], false) };
  }
  if (lower === "💬 more return faqs") {
    setFlow({ step: "faq_returns", prevStep: "faq_categories" });
    return { text: "📦 **Return Information**\n\nSelect a topic below:", chips: withNav(["Return Policy", "Return Eligibility", "Return Process"], false) };
  }
  if (lower === "💬 more customer service faqs") {
    setFlow({ step: "faq_customerService", prevStep: "faq_categories" });
    return { text: "📞 **Customer Service**\n\nSelect a topic below:", chips: withNav(["Contact Us", "Support Hours", "Live Chat", "Complaint Escalation"], false) };
  }

  for (const handler of faqHandlers) {
    const isTriggered = handler.triggers.some(t => lower.includes(t) || lower === t);
    if (isTriggered) {
      const topicNames = Object.keys(handler.data.topics);
      let matchedTopic = null;
      for (const [kw, topic] of Object.entries(handler.keywordMap)) {
        if (lower.includes(kw)) { matchedTopic = topic; break; }
      }
      const directTopic = topicNames.find(t => lower === t.toLowerCase() || lower.includes(t.toLowerCase()));
      if (directTopic) matchedTopic = directTopic;
      if (matchedTopic && handler.data.topics[matchedTopic]) {
        setFlow({ step: `${handler.step}_topic`, prevStep: handler.step });
        const moreChip = `💬 More ${handler.label.split(" ").slice(1).join(" ")} FAQs`;
        return { text: handler.data.topics[matchedTopic], chips: withNav([moreChip], false) };
      }
      setFlow({ step: handler.step, prevStep: "faq_categories" });
      return { text: `${handler.label}\n\nSelect a topic below:`, chips: withNav(handler.topicChips, false) };
    }
  }

  return { text: FALLBACK_TEXT, chips: withNav(DEFAULT_CHIPS, true) };
}

export default function ChatFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: 'bot', text: "👋 Hi! I'm **FAQ Assistant**. Ask me about delivery, refunds, returns, customer service, or anything about your order!", chips: DEFAULT_CHIPS }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [flow, setFlow] = useState({ step: "default", prevStep: null });
  const [panelOpen, setPanelOpen] = useState(false);
  const [pos, setPos] = useState({ x: null, y: null });
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const widgetRef = useRef(null);
  const dragState = useRef({ dragging: false, startX: 0, startY: 0, origX: 0, origY: 0, wasDragging: false });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [chatHistory, isTyping]);

  // Detect when a right-side slide-over panel is open
  useEffect(() => {
    const checkPanel = () => {
      const dialog = document.querySelector('[role="dialog"][aria-modal="true"]');
      const cartDrawer = document.querySelector('[data-cart-drawer]');
      setPanelOpen(!!(dialog || cartDrawer));
    };
    checkPanel();
    const observer = new MutationObserver(checkPanel);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  // Close chat window when a panel opens
  useEffect(() => {
    if (panelOpen && isOpen) {
      setIsOpen(false);
    }
  }, [panelOpen]);

  /* ── Drag handlers ── */
  const onPointerDown = useCallback((e) => {
    const hasDragHandle = e.target.closest('.nma-drag-handle') !== null || e.target.closest('.nma-fab') !== null;
    if (!hasDragHandle) return;
    if (e.target.closest('button') || e.target.closest('input')) return;
    e.preventDefault();
    const el = widgetRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    dragState.current = { dragging: true, startX: e.clientX, startY: e.clientY, origX: rect.left, origY: rect.top, wasDragging: false };
    el.style.cursor = 'grabbing';
    el.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e) => {
    if (!dragState.current.dragging) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragState.current.wasDragging = true;
    const newX = dragState.current.origX + dx;
    const newY = dragState.current.origY + dy;
    const el = widgetRef.current;
    if (el) {
      const maxX = window.innerWidth - el.offsetWidth;
      const maxY = window.innerHeight - el.offsetHeight;
      setPos({ x: Math.max(0, Math.min(newX, maxX)), y: Math.max(0, Math.min(newY, maxY)) });
    }
  }, []);

  const onPointerUp = useCallback((e) => {
    if (!dragState.current.dragging) return;
    dragState.current.dragging = false;
    const el = widgetRef.current;
    if (el) {
      el.style.cursor = '';
      try { el.releasePointerCapture(e.pointerId); } catch (err) { }
    }
  }, []);

  const handleSend = () => {
    if (!message.trim()) return;
    const trimmed = message.trim();
    setMessage("");
    const newHistory = [...chatHistory, { role: 'user', text: trimmed }];
    setChatHistory(newHistory);
    setIsTyping(true);
    setTimeout(() => {
      const response = getFAQResponse(trimmed, flow, setFlow);
      if (response.resetChat) {
        setChatHistory([{ role: 'bot', text: response.text, chips: response.chips }]);
      } else {
        setChatHistory([...newHistory, { role: 'bot', text: response.text, chips: response.chips }]);
      }
      setIsTyping(false);
    }, 500 + Math.random() * 300);
  };

  const handleChipClick = (chip) => {
    const lowerChip = chip.toLowerCase();
    if (lowerChip.includes('cart') || lowerChip.includes('checkout') || lowerChip.includes('view cart')) {
      window.location.href = '/cart';
      return;
    }
    const trimmed = chip.trim();
    const newHistory = [...chatHistory, { role: 'user', text: trimmed }];
    setChatHistory(newHistory);
    setIsTyping(true);
    setTimeout(() => {
      const response = getFAQResponse(trimmed, flow, setFlow);
      if (response.resetChat) {
        setChatHistory([{ role: 'bot', text: response.text, chips: response.chips }]);
      } else {
        setChatHistory([...newHistory, { role: 'bot', text: response.text, chips: response.chips }]);
      }
      setIsTyping(false);
    }, 400);
  };

  const renderText = (text) => {
    return text.split("\n").map((line, lineIdx) => {
      const lineParts = line.split(/\*\*(.+?)\*\*/g).map((part, i) =>
        i % 2 === 1 ? <strong key={i}>{part}</strong> : part
      );
      return (
        <span key={lineIdx}>
          {lineParts}
          {lineIdx < text.split("\n").length - 1 && <br />}
        </span>
      );
    });
  };

  const posStyle = pos.x !== null
    ? { position: "fixed", left: pos.x, top: pos.y, right: "auto", bottom: "auto", zIndex: 1000 }
    : { position: "fixed", right: 24, bottom: 24, zIndex: 1000 };

  return (
    <div
      ref={widgetRef}
      style={posStyle}
      className="flex flex-col items-end gap-4"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {/* Chat Window */}
      {isOpen && !panelOpen && (
        <div className="w-[380px] h-[550px] bg-white dark:bg-gray-900 rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden animate-slideUp">
          {/* Header - draggable */}
          <div className="bg-emerald-600 p-6 text-white flex items-center justify-between nma-drag-handle">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-black text-sm uppercase tracking-widest">FAQ Assistant</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest">Online</span>
                </div>
              </div>
            </div>
            <button onClick={() => { setIsOpen(false); setPos({ x: null, y: null }); }} className="hover:bg-white/10 p-2 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
            {chatHistory.map((chat, i) => (
              <div key={i} className={`flex flex-col ${chat.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[90%] p-4 rounded-2xl ${chat.role === 'user'
                  ? 'bg-emerald-600 text-white rounded-tr-none'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-100 dark:border-gray-800'}`}>
                  <div className="flex items-start gap-2">
                    {chat.role === 'bot' && <Bot size={14} className="shrink-0 mt-0.5" />}
                    {chat.role === 'user' && <User size={14} className="shrink-0 mt-0.5" />}
                    <p className="text-sm font-medium leading-relaxed">{renderText(chat.text)}</p>
                  </div>
                </div>
                {chat.role === 'bot' && chat.chips && chat.chips.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 ml-2">
                    {chat.chips.map((chip, ci) => (
                      <button key={ci} onClick={() => handleChipClick(chip)}
                        className="px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 transition-colors whitespace-nowrap">
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-800 flex gap-1">
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-6 border-t border-gray-100 dark:border-gray-800">
            <div className="relative">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-emerald-500 rounded-2xl py-3.5 pl-6 pr-14 text-sm font-bold text-gray-800 dark:text-white outline-none transition-all"
              />
              <button onClick={handleSend}
                className="absolute right-2 top-2 w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-600/20">
                <Send size={18} />
              </button>
            </div>
            <div className="flex items-center justify-center gap-2 mt-4">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Powered by FAQ Assistant</p>
            </div>
          </div>
        </div>
      )}

      {/* FAB Button - draggable */}
      <button
        onClick={(e) => {
          if (dragState.current.wasDragging) {
            dragState.current.wasDragging = false;
            return;
          }
          setIsOpen(!isOpen);
        }}
        className={`w-16 h-16 rounded-[24px] flex items-center justify-center text-white shadow-2xl transition-all hover:scale-110 active:scale-90 group relative nma-fab ${isOpen ? 'bg-gray-900 rotate-90' : 'bg-emerald-600 shadow-emerald-600/30'}`}
      >
        {isOpen ? <X size={28} strokeWidth={3} /> : <MessageCircle size={28} strokeWidth={3} />}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 border-2 border-white rounded-full animate-pulse" />
        )}
      </button>
    </div>
  );
}