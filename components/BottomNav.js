"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Store, ClipboardList, ShoppingCart, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useTranslation } from 'react-i18next';

export default function BottomNav() {
  const pathname = usePathname();
  const { getCartCount, setIsCartOpen } = useCart();
  const { t } = useTranslation();

  const NAV_ITEMS = [
    { id: 'home', label: t('navbar.home') || 'Home', icon: Home, path: '/' },
    { id: 'stores', label: t('navbar.stores') || 'Stores', icon: Store, path: '/stores' },
    { id: 'orders', label: t('navbar.orders') || 'Orders', icon: ClipboardList, path: '/orders' },
    { id: 'cart', label: t('navbar.cart') || 'Cart', icon: ShoppingCart, path: '/cart', isCart: true },
    { id: 'profile', label: t('navbar.profile') || 'Profile', icon: User, path: '/profile' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/95 dark:bg-gray-950/95 backdrop-blur-lg border-t border-gray-100 dark:border-gray-900 pb-safe shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
      <div className="flex items-center justify-around h-16 sm:h-20 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;

          if (item.isCart) {
            return (
              <button
                key={item.id}
                onClick={() => setIsCartOpen(true)}
                className="flex flex-col items-center justify-center gap-1 min-w-[64px] relative group"
              >
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  {getCartCount() > 0 && (
                    <span className="absolute top-1 right-3 bg-rose-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                      {getCartCount()}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-tighter transition-colors ${isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.path}
              className="flex flex-col items-center justify-center gap-1 min-w-[64px] group"
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400'}`}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-tighter transition-colors ${isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
