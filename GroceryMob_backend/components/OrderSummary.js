"use client";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function OrderSummary({ showButton = true }) {
  const { getCartTotal } = useCart();
  const subtotal = getCartTotal();
  const tax = subtotal * 0.05;
  const delivery = subtotal >= 500 ? 0 : 49;
  const total = subtotal + tax + delivery;

  if (subtotal === 0) return null;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
      <h3 className="text-lg font-bold mb-4 border-b border-gray-200 dark:border-gray-800 pb-4">
        Order Summary
      </h3>

      <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300 mb-6">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-medium">₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax (5%)</span>
          <span className="font-medium">₹{tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Delivery Fee</span>
          <span className="font-medium">
            {delivery === 0 ? <span className="text-emerald-500">Free</span> : `₹${delivery.toFixed(2)}`}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-800 pt-4 mb-6">
        <span className="font-bold text-gray-800 dark:text-gray-100">Total</span>
        <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
          ₹{total.toFixed(2)}
        </span>
      </div>

      {showButton && (
        <Link href="/checkout" className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 transition-colors flex items-center justify-center">
          Proceed to Checkout
        </Link>
      )}
    </div>
  );
}
