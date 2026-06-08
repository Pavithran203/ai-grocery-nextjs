"use client";
import { Plus, Minus } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function AddToCartButton({ product }) {
  const { cartItems, addToCart, updateQuantity } = useCart();
  
  const inCart = cartItems.find(item => item.id === product.id);

  if (inCart) {
    return (
      <div className="flex items-center justify-between w-full bg-white dark:bg-gray-900 rounded-[20px] p-1.5 border border-emerald-100 dark:border-emerald-900/50 shadow-md">
        <button 
          onClick={(e) => { e.stopPropagation(); e.preventDefault(); updateQuantity(product.id, inCart.quantity - 1); }}
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 hover:scale-105 active:scale-95 transition-all"
        >
          <Minus className="w-4 h-4" strokeWidth={3} />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-lg font-black text-gray-900 dark:text-white leading-none">{inCart.quantity}</span>
          <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-1">In Cart</span>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); e.preventDefault(); updateQuantity(product.id, inCart.quantity + 1); }}
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-emerald-500 text-white shadow-md shadow-emerald-500/10 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" strokeWidth={3} />
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={(e) => { e.stopPropagation(); e.preventDefault(); addToCart(product); }}
      className="w-full bg-[#16A34A] text-white rounded-[20px] py-3.5 sm:py-4 lg:py-3.5 font-black text-sm sm:text-base hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 group"
    >
      <Plus className="w-4.5 h-4.5 transition-transform group-hover:rotate-90" strokeWidth={3} />
      Add to Cart
    </button>
  );
}
