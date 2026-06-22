"use client";
import { Plus, Minus } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function AddToCartButton({ product }) {
  const { cartItems, addToCart, updateQuantity } = useCart();
  
  const inCart = cartItems.find(item => item.id === product.id);

  if (inCart) {
    return (
      <div className="flex items-center justify-between w-full sm:w-64 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl p-2 border-2 border-emerald-500 shadow-sm">
        <button 
          onClick={() => updateQuantity(product.id, inCart.quantity - 1)}
          className="w-12 h-12 flex items-center justify-center rounded-xl bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 shadow-sm hover:scale-105 transition-transform"
        >
          <Minus className="w-5 h-5" />
        </button>
        <span className="text-xl font-bold w-12 text-center text-emerald-800 dark:text-emerald-100">{inCart.quantity}</span>
        <button 
          onClick={() => updateQuantity(product.id, inCart.quantity + 1)}
          className="w-12 h-12 flex items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm hover:scale-105 transition-transform"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={() => addToCart(product)}
      className="w-full sm:w-64 bg-emerald-500 text-white rounded-2xl py-4 font-bold text-lg hover:bg-emerald-600 hover:shadow-lg transition-all focus:ring-4 focus:ring-emerald-200"
    >
      Add to Cart
    </button>
  );
}
