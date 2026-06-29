"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useOrders } from "../../context/OrdersContext";
import { useLoyalty } from "../../context/LoyaltyContext";
import { useAddress } from "../../context/AddressContext";
import { 
  ShoppingBag, 
  MapPin, 
  CreditCard, 
  ChevronRight, 
  Clock, 
  Star,
  ShieldCheck,
  Zap
} from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function ProfileOverview() {
  const { user } = useAuth();
  const { orders } = useOrders();
  const { coins } = useLoyalty();
  const { addresses } = useAddress();
  const { t } = useTranslation();

  const [savedCardsCount, setSavedCardsCount] = useState(0);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('nearmart_payment_methods');
      if (stored) {
        const methods = JSON.parse(stored);
        const cards = methods.filter(m => m.type === 'card');
        setSavedCardsCount(cards.length);
      } else {
        setSavedCardsCount(0);
      }
    } catch (e) {
      setSavedCardsCount(0);
    }
  }, []);

  const stats = [
    { label: t('profile.totalOrders'), value: orders?.length?.toString() || '0', icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/20', href: '/orders' },
    { label: t('profile.savedAddresses'), value: (addresses?.length || 0).toString(), icon: MapPin, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20', href: '/profile/addresses' },
    { label: t('profile.savedCards'), value: savedCardsCount.toString(), icon: CreditCard, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/20', href: '/profile/payments' },
  ];

  const formatOrderDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Info */}
      <div className="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8">
          <Zap className="w-12 h-12 text-emerald-500/10 rotate-12" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter mb-2">
            {t('profile.welcomeBack', { name: user?.name || 'User' })}
          </h1>
          <p className="text-gray-500 font-bold max-w-md uppercase text-xs tracking-widest leading-relaxed">
            {t('profile.manageProfile')}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <Link href={stat.href} key={i} className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 flex items-center gap-4 group hover:border-emerald-200 transition-all cursor-pointer shadow-sm">
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter leading-none mt-0.5">{stat.value}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h2 className="font-black text-gray-900 dark:text-white uppercase text-sm tracking-widest">{t('profile.recentActivity')}</h2>
            <Link href="/orders" className="text-[10px] font-black text-emerald-600 hover:underline uppercase tracking-widest">{t('profile.viewAll', { defaultValue: 'View All' })}</Link>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {orders && orders.length > 0 ? orders.slice(0, 3).map((order, i) => (
              <Link key={i} href={`/orders?orderId=${order.id || order._id}`} className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group/order">
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover/order:bg-emerald-50 group-hover/order:text-emerald-600 transition-colors">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black text-gray-800 dark:text-gray-100 group-hover/order:text-emerald-600 transition-colors">{order.id || `ORD-${String(order._id).substring(0,8).toUpperCase()}`}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                    {order.status.toLowerCase() === 'delivered' ? 'Delivered on' : 'Placed on'} {formatOrderDate(order.createdAt || order.placedAt)}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover/order:text-emerald-500 group-hover/order:translate-x-1 transition-all" />
              </Link>
            )) : (
              <div className="p-8 text-center">
                <p className="text-sm font-bold text-gray-400">{t('profile.noActivity', { defaultValue: 'No recent activity.' })}</p>
              </div>
            )}
          </div>
        </div>

        {/* Account Security Card */}
        <div style={{ background: 'linear-gradient(135deg, #064E3B 0%, #115E59 100%)' }} className="rounded-[32px] p-8 text-white relative overflow-hidden group">
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-400/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-400/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg" style={{ backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <ShieldCheck className="w-6 h-6 text-emerald-300" />
            </div>
            <h2 className="text-2xl font-black tracking-tighter mb-2">{t('profile.accountSecurity')}</h2>
            <p className="text-sm font-medium mb-6" style={{ color: '#A7F3D0' }}>
              {t('profile.securityDesc')}
            </p>
            <Link href="/profile/security" className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all text-white" style={{ backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.1)' }}>
              {t('profile.manageSecurity')} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Rewards Teaser */}
      {(() => {
        // Use the actual scoped loyalty coins instead of manually deriving it globally
        const totalCoins = coins || 0;
        const currentTier = Math.floor(totalCoins / 500) + 1;
        const coinsForNextTier = (currentTier * 500) - totalCoins;
        const progressPercentage = ((totalCoins % 500) / 500) * 100;

        return (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-[32px] border border-emerald-100 dark:border-emerald-800/30 p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm">
            <div className="w-20 h-20 shrink-0 bg-white dark:bg-gray-900 rounded-[28px] shadow-xl flex items-center justify-center text-4xl border border-emerald-200/50 dark:border-emerald-800/50">
              🏆
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight mb-1">{t('profile.loyaltyProgramTier', { tier: currentTier })}</h2>
              <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mb-4">{t('profile.coinsAway', { coins: coinsForNextTier, nextTier: currentTier + 1 })}</p>
              <div className="w-full h-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.4)] transition-all duration-1000" 
                  style={{ width: `${progressPercentage}%` }} 
                />
              </div>
            </div>
            <Link href="/rewards" className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-110 shadow-lg shadow-emerald-500/20 shrink-0 active:scale-95 transition-all">
              {t('profile.learnMore')}
            </Link>
          </div>
        );
      })()}
    </div>
  );
}
