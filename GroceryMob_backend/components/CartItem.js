"use client";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-100 dark:border-gray-800">
      <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden shrink-0">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
      </div>
      
      <div className="flex-1">
        <h4 className="font-semibold text-gray-800 dark:text-gray-200">{item.name}</h4>
        <p className="text-sm text-gray-500">{item.category}</p>
        <span className="font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
          ₹{item.price.toFixed(2)}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button 
            onClick={() => updateQuantity(item._id || item.id, item.quantity - 1)}
            className="w-8 h-8 flex items-center justify-center rounded-md bg-white dark:bg-gray-700 shadow-sm text-gray-600 dark:text-gray-300 hover:text-emerald-500"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
          <button 
            onClick={() => updateQuantity(item._id || item.id, item.quantity + 1)}
            className="w-8 h-8 flex items-center justify-center rounded-md bg-white dark:bg-gray-700 shadow-sm text-gray-600 dark:text-gray-300 hover:text-emerald-500"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        <button 
          onClick={() => removeFromCart(item._id || item.id)}
          className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
