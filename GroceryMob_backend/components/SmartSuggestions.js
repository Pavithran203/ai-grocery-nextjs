"use client";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { api } from "@/services/api";
import ProductCard from "./ProductCard";
import { BrainCircuit } from "lucide-react";

export default function SmartSuggestions() {
  const { cartItems } = useCart();
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      const ids = cartItems.map(item => item._id || item.id);
      const res = await api.getSmartSuggestions(ids);
      setSuggestions(res);
    };
    if (cartItems.length > 0) {
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [cartItems]);

  if (suggestions.length === 0) return null;

  return (
    <div className="mt-8 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-900 shadow-sm backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4 text-indigo-600 dark:text-indigo-400">
         <BrainCircuit className="w-5 h-5" />
         <h3 className="font-bold text-lg">AI Smart Pairing</h3>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Based on your cart, you might also need these:</p>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {suggestions.map(p => (
          <ProductCard key={`sug-${p._id || p.id}`} product={p} />
        ))}
      </div>
    </div>
  );
}
