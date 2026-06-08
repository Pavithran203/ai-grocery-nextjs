"use client";
import React, { useState, useEffect, useCallback, memo } from 'react';
import { Clock, RotateCcw, ShoppingCart, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useOrders } from '@/context/OrdersContext';
import { useCart } from '@/context/CartContext';
import { getBuyAgainItems, getLastOrder, formatOrderDate } from '@/services/orderService';
import Link from 'next/link';
import Image from 'next/image';

const BuyAgainCard = memo(({ item, onAdd, language }) => {
  if (!item || !item.id) return null;
  const itemName = item[`name_${language}`] || item.name;
  return (
    <div className="min-w-[160px] bg-white dark:bg-gray-900 rounded-[32px] p-4 mr-4 shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-800">
      <div className="bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-lg inline-block mb-3">
        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter">
          {item._frequency >= 3 ? '🔄 Frequent' : item._frequency >= 2 ? '✌️ x' + item._frequency : '📦 x1'}
        </span>
      </div>

      <div className="relative w-full h-24 rounded-2xl bg-gray-50 dark:bg-gray-800 mb-3 overflow-hidden">
        <Image 
          src={(item.image || item.image_url || '').startsWith('http') || (item.image || item.image_url || '').startsWith('/') ? (item.image || item.image_url) : 'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_200,h_200,q_auto,f_auto/samples/food/spices.jpg'} 
          alt={itemName || 'Product Image'} 
          fill
          sizes="(max-width: 768px) 160px, 160px"
          className="object-cover" 
        />
      </div>

      <h3 className="text-sm font-black text-gray-900 dark:text-white line-clamp-2 mb-1 leading-tight h-8" suppressHydrationWarning>
        {itemName}
      </h3>
      <p className="text-[10px] text-gray-400 font-bold mb-4">
        {formatOrderDate(item._lastOrderDate)} • Qty: {item._totalQty}
      </p>

      <div className="flex justify-between items-center">
        <span className="text-lg font-black text-emerald-600">₹{item.price}</span>
        <button 
          onClick={(e) => { e.stopPropagation(); onAdd(item); }}
          className="flex items-center gap-2 bg-gradient-to-br from-[#16A34A] to-[#22C55E] text-white px-4 py-2.5 rounded-xl text-[11px] font-black shadow-lg shadow-emerald-500/25 hover:brightness-110 active:scale-95 transition-all relative z-10"
        >
          <RotateCcw size={14} strokeWidth={3} />
          <span>BUY</span>
        </button>
      </div>
    </div>
  );
});

BuyAgainCard.displayName = 'BuyAgainCard';

export default function BuyAgain() {
  const [buyAgainItems, setBuyAgainItems] = useState([]);
  const [lastOrder, setLastOrder] = useState(null);
  const { orders } = useOrders();
  const { addToCart } = useCart();
  const { i18n } = useTranslation();
  const language = i18n.language;

  useEffect(() => {
    if (orders && orders.length > 0) {
      const items = getBuyAgainItems(orders);
      setBuyAgainItems(items.slice(0, 12));
      setLastOrder(getLastOrder(orders));
    } else {
      setBuyAgainItems([]);
      setLastOrder(null);
    }
  }, [orders]);

  const handleAdd = useCallback((item) => {
    addToCart(item, 1);
  }, [addToCart]);

  const handleReorderAll = useCallback(() => {
    if (!lastOrder || !lastOrder.items) return;
    lastOrder.items.forEach(item => {
      if (item && item.id) addToCart(item, item.quantity || 1);
    });
  }, [lastOrder, addToCart]);

  if (buyAgainItems.length === 0) return null;

  return (
    <div className="mx-4 my-12 bg-emerald-50 dark:bg-emerald-950/20 rounded-[48px] p-8 border border-emerald-100 dark:border-emerald-900/30">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-3xl bg-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-600/40">
            <Clock size={28} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-emerald-900 dark:text-emerald-100">Buy Again</h2>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mt-1">Quick restock your favorites</p>
          </div>
        </div>
        {lastOrder && (
          <button 
            onClick={handleReorderAll}
            className="flex items-center gap-2 bg-gradient-to-br from-[#16A34A] to-[#22C55E] px-6 py-3 rounded-2xl text-white font-black text-xs hover:brightness-110 active:scale-95 transition-all shadow-[0_8px_20px_rgba(22,163,74,0.2)]"
          >
            <ShoppingCart size={18} strokeWidth={3} />
            <span>REORDER ALL</span>
          </button>
        )}
      </div>

      {lastOrder && (
        <Link 
          href="/orders"
          className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-[28px] p-5 mb-8 border border-emerald-100 dark:border-emerald-800 shadow-xl shadow-emerald-900/5 hover:shadow-2xl transition-all group"
        >
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                <RotateCcw size={20} />
             </div>
             <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Last Order Insight</p>
               <p className="text-base font-black text-emerald-900 dark:text-emerald-100">
                 #{lastOrder.id?.slice(-6)} • {lastOrder.items?.length} items • ₹{lastOrder.totalAmount}
               </p>
             </div>
          </div>
          <ChevronRight size={24} className="text-emerald-200 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
        </Link>
      )}

      <div className="flex overflow-x-auto no-scrollbar pb-2">
        {buyAgainItems.map((item) => (
          <BuyAgainCard key={`ba-${item.id}`} item={item} onAdd={handleAdd} language={language} />
        ))}
      </div>
    </div>
  );
}
