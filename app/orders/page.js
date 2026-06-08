"use client";
import React from 'react';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function OrdersPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-500">
        <ShoppingBag size={48} />
      </div>
      <h1 className="text-4xl font-black mb-4">Your Orders</h1>
      <p className="text-gray-500 mb-8 text-lg">You haven't placed any orders yet. Start shopping to fill your history!</p>
      <Link href="/" className="inline-block bg-emerald-500 text-white px-10 py-4 rounded-2xl font-black hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20">
        Browse Products
      </Link>
    </div>
  );
}
