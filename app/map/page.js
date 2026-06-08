"use client";
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function MapPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 h-[calc(100vh-80px)] flex flex-col">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-3xl font-black">Store Locator Map</h1>
      </div>
      
      <div className="flex-1 bg-gray-100 dark:bg-gray-900 rounded-[40px] border border-gray-200 dark:border-gray-800 flex items-center justify-center relative overflow-hidden">
         <div className="text-center z-10">
            <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/20 animate-bounce">
               <span className="text-4xl">📍</span>
            </div>
            <h2 className="text-2xl font-black mb-2">Interactive Map View</h2>
            <p className="text-gray-500 max-w-md mx-auto">This view allows you to see all nearby stores on a map. Our team is finalizing the map integration details.</p>
         </div>
         {/* Simple background pattern to simulate a map */}
         <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>
    </div>
  );
}
