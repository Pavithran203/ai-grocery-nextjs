"use client";
import { Plus, Minus, Zap } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

export default function AddToCartButton({ product }) {
  const router = useRouter();
  const { cartItems, addToCart, updateQuantity } = useCart();
  
  const inCart = cartItems.find(item => item.id === product.id);

  const handleBuyNow = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (typeof window !== 'undefined') {
      const buyNowItem = {
        ...product,
        quantity: 1
      };
      sessionStorage.setItem('nearmart_direct_buy_item', JSON.stringify(buyNowItem));
      router.push('/checkout?directBuy=true');
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full">
      {/* Add / Adjust Cart Button */}
      <div className="flex-1 min-w-[150px]">
        {inCart ? (
          <div className="flex items-center justify-between w-full bg-white dark:bg-gray-900 rounded-[20px] p-1.5 border border-emerald-100 dark:border-emerald-900/50 shadow-md h-12">
            <button 
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); updateQuantity(product.id, inCart.quantity - 1); }}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 hover:scale-105 active:scale-95 transition-all animate-press"
            >
              <Minus className="w-4 h-4" strokeWidth={3} />
            </button>
            <div className="flex flex-col items-center">
              <span className="text-base font-black text-gray-900 dark:text-white leading-none">{inCart.quantity}</span>
              <span className="text-[7px] font-black text-emerald-500 uppercase tracking-widest mt-0.5">In Cart</span>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); updateQuantity(product.id, inCart.quantity + 1); }}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-emerald-500 text-white shadow-md shadow-emerald-500/10 hover:scale-105 active:scale-95 transition-all animate-press"
            >
              <Plus className="w-4 h-4" strokeWidth={3} />
            </button>
          </div>
        ) : (
          <button 
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); addToCart(product); }}
            className="w-full bg-[#16A34A] text-white rounded-[20px] h-12 font-black text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 group"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" strokeWidth={3} />
            Add to Cart
          </button>
        )}
      </div>

      {/* Instant Buy Now Button */}
      <button 
        onClick={handleBuyNow}
        className="flex-1 w-full bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-[20px] h-12 font-black text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
      >
        <Zap className="w-4 h-4 text-white fill-current animate-pulse" />
        Buy Now
      </button>
    </div>
  );
}
