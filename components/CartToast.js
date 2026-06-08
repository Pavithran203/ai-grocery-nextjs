"use client";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, X, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

export default function CartToast() {
  const { cartToast, setCartToast, setIsCartOpen } = useCart();
  const [visible, setVisible] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (cartToast) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => setCartToast(null), 300); // Wait for fade out
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [cartToast, setCartToast]);

  if (!cartToast && !visible) return null;

  return (
    <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-32px)] max-w-md transition-all duration-300 ${visible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
      <div className="bg-emerald-600 text-white rounded-3xl p-4 shadow-[0_20px_50px_rgba(16,185,129,0.4)] border border-emerald-400/30 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
            <ShoppingBag size={20} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-emerald-100 leading-none mb-1">{t('common.added', 'Added!')}</p>
            <p className="text-sm font-bold truncate max-w-[200px]">{cartToast?.name}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              setVisible(false);
              setTimeout(() => setIsCartOpen(true), 300);
            }}
            className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all"
          >
            {t('common.view', 'View')} <ArrowRight size={12} />
          </button>
          <button onClick={() => setVisible(false)} className="p-1 hover:bg-white/10 rounded-full">
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
