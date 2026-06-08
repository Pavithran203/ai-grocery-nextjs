"use client";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useTranslation } from "react-i18next";

export default function OrderSummary({ showButton = true }) {
  const { getCartTotal } = useCart();
  const { t } = useTranslation();
  const subtotal = getCartTotal();
  const tax = subtotal * 0.05;
  const delivery = subtotal > 500 ? 0 : 49;
  const total = subtotal + tax + delivery;

  if (subtotal === 0) return null;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
      <h3 className="text-lg font-bold mb-4 border-b border-gray-200 dark:border-gray-800 pb-4">
        {t('cart.orderSummary')}
      </h3>
      
      <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300 mb-6">
        <div className="flex justify-between">
          <span>{t('cart.subtotal')}</span>
          <span className="font-medium">₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>{t('cart.tax')} (5%)</span>
          <span className="font-medium">₹{tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>{t('cart.deliveryFee')}</span>
          <span className="font-medium">{delivery === 0 ? <span className="text-emerald-500">{t('common.free')}</span> : `₹${delivery.toFixed(2)}`}</span>
        </div>
      </div>

      <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-800 pt-4 mb-6">
        <span className="font-bold text-gray-800 dark:text-gray-100">{t('cart.total')}</span>
        <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
          ₹{total.toFixed(2)}
        </span>
      </div>

      {showButton && (
        <Link href="/checkout" className="block w-full text-center bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-4 rounded-2xl font-black text-base hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0">
          🛒 {t('cart.proceedToCheckout')} →
        </Link>
      )}
    </div>
  );
}
