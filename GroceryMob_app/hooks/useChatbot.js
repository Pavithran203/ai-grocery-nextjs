import { useState, useCallback } from 'react';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrdersContext';
import { useAddress } from '../context/AddressContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { getActiveCampaigns, PROMO_BANNERS } from '../data/campaigns';
import { triggerLight, triggerSuccess } from '../utils/Haptics';

export function useChatbot() {
  const { cartItems, addToCart, getCartTotal, clearCart } = useCart();
  const { orders, addLocalOrder } = useOrders();
  const { addresses } = useAddress();
  const { language } = useLanguage();

  const [messages, setMessages] = useState([
    { id: '1', type: 'bot', text: 'Hi! I\'m your FreshKart Assistant 🤖\nHow can I help you today?', isWidget: true, widgetType: 'welcome_actions' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const getID = () => Math.random().toString(36).substring(7);

  const addBotMessage = (text, widgetType = null, widgetData = null, delay = 600) => {
    setIsTyping(true);
    setTimeout(() => {
      triggerLight();
      setMessages(prev => [...prev, {
        id: getID(),
        type: 'bot',
        text,
        isWidget: !!widgetType,
        widgetType,
        widgetData
      }]);
      setIsTyping(false);
    }, delay);
  };

  // Fetch all categories from API
  const fetchCategories = async () => {
    try {
      const cats = await api.getCategories();
      if (cats && cats.length > 0) {
        addBotMessage('Here are all our categories. Tap one to browse products:', 'all_categories', cats);
      } else {
        addBotMessage('Sorry, no categories available right now. Please try again later.');
      }
    } catch (e) {
      addBotMessage('Could not load categories. Please check your connection.');
    }
  };

  // Fetch products for a category
  const fetchCategoryProducts = async (categoryName) => {
    addBotMessage(`Fetching ${categoryName} products... 🔍`, null, null, 200);
    try {
      const products = await api.getProducts(categoryName);
      if (products && products.length > 0) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: getID(),
            type: 'bot',
            text: `Found ${products.length} items in ${categoryName}:`,
            isWidget: true,
            widgetType: 'category_products',
            widgetData: { products, categoryName }
          }]);
        }, 800);
      } else {
        setTimeout(() => {
          addBotMessage(`No items available in ${categoryName} right now.`, null, null, 200);
        }, 800);
      }
    } catch (e) {
      setTimeout(() => {
        addBotMessage('Failed to load products. Please try again.', null, null, 200);
      }, 800);
    }
  };

  // Search products by keyword
  const searchProducts = async (keyword) => {
    try {
      const allProducts = await api.getProducts();
      const matches = allProducts.filter(p =>
        p.name.toLowerCase().includes(keyword.toLowerCase())
      );
      return matches;
    } catch (e) {
      return [];
    }
  };

  const parseUserIntent = useCallback(async (text) => {
    const raw = text.toLowerCase().trim();

    // Add user message
    setMessages(prev => [...prev, { id: getID(), type: 'user', text, isWidget: false }]);

    // ---- ORDER GROCERIES / BROWSE ----
    if (raw.includes('order groceries') || raw.includes('browse') || raw.includes('shop') || raw.includes('categories')) {
      fetchCategories();
      return;
    }

    // ---- CATEGORY CLICK (e.g., "show Fruits") ----
    if (raw.startsWith('show ') || raw.startsWith('browse ')) {
      const catName = raw.replace(/^(show|browse)\s+/i, '').replace(/\s*[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]+\s*/gu, '').trim();
      // Capitalize first letter
      const formatted = catName.charAt(0).toUpperCase() + catName.slice(1);
      fetchCategoryProducts(formatted);
      return;
    }

    // ---- QUICK ORDER ----
    if (raw.includes('quick order') || raw.includes('order fast')) {
      if (cartItems.length === 0) {
        addBotMessage("Your cart is empty! Add some items first before placing a quick order. 🛒", 'all_categories_fetch');
        setTimeout(() => fetchCategories(), 200);
        return;
      }
      if (addresses.length === 0) {
        addBotMessage("Oops! You don't have an address saved. Please add one from your profile first.");
        return;
      }

      addBotMessage("Processing your Quick Order... ⚡", null, null, 400);
      setTimeout(async () => {
        const total = getCartTotal();
        const shipping = total > 999 ? 0 : 50;
        const finalAmt = total + shipping;

        const newOrder = await addLocalOrder({
          items: [...cartItems],
          totalAmount: finalAmt,
          paymentMethod: 'COD',
          deliverySlot: 'ASAP (30 min)'
        });

        clearCart();
        triggerSuccess();
        addBotMessage(
          `Order placed successfully! 🎉\n\n📦 Order: #${newOrder?.id?.slice(-6) || 'NEW'}\n💰 Total: ₹${finalAmt}\n🚚 Delivery: ASAP (30 min)\n💵 Payment: Cash on Delivery`,
          'quick_order_success',
          newOrder
        );
      }, 1500);
      return;
    }

    // ---- CHECKOUT / CART ----
    if (raw.includes('checkout') || raw.includes('view cart') || raw.includes('cart') || raw.includes('pay')) {
      if (cartItems.length === 0) {
        addBotMessage("Your cart is empty! Let's add something:", 'all_categories_fetch');
        setTimeout(() => fetchCategories(), 200);
      } else {
        addBotMessage("Here is your current cart:", 'cart_summary', cartItems);
      }
      return;
    }

    // ---- BEST OFFERS / DEALS ----
    if (raw.includes('offer') || raw.includes('deal') || raw.includes('discount') || raw.includes('sale') || raw.includes('campaign')) {
      const campaigns = getActiveCampaigns();
      const promos = PROMO_BANNERS || [];
      const allOffers = [...campaigns, ...promos];

      if (allOffers.length > 0) {
        addBotMessage("🎁 Here are our current offers:", 'offer_campaigns', allOffers);
      } else {
        addBotMessage("No active offers right now. Check back soon!");
      }
      return;
    }

    // ---- TRACK ORDER ----
    if (raw.includes('track') || raw.includes('status') || raw.includes('where is my order')) {
      const activeOrders = orders.filter(o => o.status !== 'Cancelled' && o.status !== 'Delivered');
      if (activeOrders.length > 0) {
        addBotMessage("📍 Here's your latest order status:", 'order_tracker', activeOrders[0]);
      } else if (orders.length > 0) {
        const latest = orders[0];
        addBotMessage(`Your latest order #${latest.id?.slice(-6)} is ${latest.status}.`, 'order_tracker', latest);
      } else {
        addBotMessage("You have no active orders. Place one to get started! 🛒", 'welcome_actions');
      }
      return;
    }

    // ---- REORDER ----
    if (raw.includes('reorder') || raw.includes('order again') || raw.includes('repeat')) {
      if (orders.length === 0) {
        addBotMessage("You don't have any past orders to reorder!");
      } else {
        addBotMessage("I found your last order. Would you like to add these items to your cart?", 'reorder_summary', orders[0]);
      }
      return;
    }

    // ---- PAYMENT ----
    if (raw.includes('payment') || raw.includes('online') || raw.includes('upi')) {
      addBotMessage("We support Cash on Delivery (COD) for this demo. Online payments coming soon! 💸");
      return;
    }

    // ---- LANGUAGE ----
    if (raw.includes('language') || raw.includes('speak') || raw.includes('tamil') || raw.includes('telugu') || raw.includes('kannada') || raw.includes('malayalam')) {
      addBotMessage("You can switch your language below:", 'language_selector', language);
      return;
    }

    // ---- CLEAR CART ----
    if (raw.includes('clear cart') || raw.includes('empty cart') || raw.includes('remove everything')) {
      clearCart();
      addBotMessage("I've emptied your cart for you! 🗑️");
      return;
    }

    // ---- DELIVERY ----
    if (raw.includes('delivery') || raw.includes('shipping')) {
      addBotMessage("🚚 Free delivery on orders above ₹999!\nStandard delivery fee: ₹50\nDelivery time: 30-45 minutes");
      return;
    }

    // ---- HELP / MENU ----
    if (raw.includes('help') || raw.includes('menu') || raw.includes('what can you do')) {
      addBotMessage("I'm your intelligent shopping assistant! Here's what I can do:", 'help_menu');
      return;
    }

    // ---- ADD TO CART (Search-based) ----
    if (raw.includes('add') || raw.includes('buy')) {
      const keyword = raw.replace(/(add|buy|to cart|please|some|the|me|i want)/gi, '').trim();
      if (keyword.length > 1) {
        setIsTyping(true);
        const matches = await searchProducts(keyword);
        setIsTyping(false);
        
        if (matches.length === 1) {
          addToCart(matches[0]);
          triggerSuccess();
          addBotMessage(`Added ${matches[0].name} to your cart! ✅ (₹${matches[0].price})`);
        } else if (matches.length > 1) {
          addBotMessage(`Found ${matches.length} results for "${keyword}". Pick one:`, 'category_products', { products: matches.slice(0, 8), categoryName: `Results for "${keyword}"` });
        } else {
          addBotMessage(`Couldn't find "${keyword}". Try browsing categories:`, 'all_categories_fetch');
          setTimeout(() => fetchCategories(), 200);
        }
      } else {
        addBotMessage("What would you like to add? Try typing 'add milk' or 'buy apples'.");
      }
      return;
    }

    // ---- SPECIFIC CATEGORY NAMES ----
    const categoryNames = ['fruits', 'vegetables', 'dairy', 'bakery', 'beverages', 'snacks', 'meat', 'pantry'];
    const matchedCat = categoryNames.find(c => raw.includes(c));
    if (matchedCat) {
      const formatted = matchedCat.charAt(0).toUpperCase() + matchedCat.slice(1);
      fetchCategoryProducts(formatted);
      return;
    }

    // ---- GREETINGS ----
    if (raw.match(/^(hi|hello|hey|hola|namaste)/)) {
      addBotMessage("Hello! 👋 How can I help you today?", 'welcome_actions');
      return;
    }

    // ---- FALLBACK ----
    addBotMessage("I can help with orders, offers, tracking, and more. Try tapping one of the options below:", 'welcome_actions');
  }, [cartItems, addresses, orders, language, getCartTotal]);

  const sendInteractiveCommand = (cmd) => {
    parseUserIntent(cmd);
  };

  const addQuickBotMsg = (text) => {
    triggerLight();
    setMessages(prev => [...prev, { id: getID(), type: 'bot', text, isWidget: false }]);
  };

  return {
    messages,
    isTyping,
    sendMessage: parseUserIntent,
    sendInteractiveCommand,
    fetchCategoryProducts,
    addQuickBotMsg,
  };
}
