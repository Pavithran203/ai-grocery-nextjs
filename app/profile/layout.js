"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  User, 
  MapPin, 
  ShieldCheck, 
  Settings, 
  CreditCard, 
  Heart, 
  LogOut,
  ChevronRight,
  ShoppingBag,
  Star
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLoyalty } from "@/context/LoyaltyContext";
import { useOrders } from "@/context/OrdersContext";
import { useTranslation } from "react-i18next";

export default function ProfileLayout({ children }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { coins } = useLoyalty();
  const { orders } = useOrders();

  const isPremium = user?.accountType === 'premium' || user?.isPremium === true;
  const totalSavings = orders ? orders.reduce((sum, order) => sum + (Number(order.discount) || 0), 0) : 0;

  // Map menuItems back to correct targets
  const actualMenuItems = [
    { id: 'overview', label: t('profile.sidebar.overview'), icon: User, href: '/profile' },
    { id: 'orders', label: t('profile.sidebar.myOrders'), icon: ShoppingBag, href: '/orders' },
    { id: 'wishlist', label: t('profile.sidebar.myWishlist'), icon: Heart, href: '/wishlist' },
    { id: 'addresses', label: t('profile.sidebar.addresses'), icon: MapPin, href: '/profile/addresses' },
    { id: 'payments', label: t('profile.sidebar.payments'), icon: CreditCard, href: '/profile/payments' },
    { id: 'security', label: t('profile.sidebar.security'), icon: ShieldCheck, href: '/profile/security' },
    { id: 'settings', label: t('profile.sidebar.settings'), icon: Settings, href: '/profile/settings' },
  ];

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4">{t('profile.sidebar.pleaseSignIn')}</h2>
        <Link href="/" className="inline-block bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar */}
        <aside className="w-full lg:w-80 shrink-0">
          <div className="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden p-6">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 text-2xl font-black border border-emerald-100 dark:border-emerald-800">
                {(user?.name || 'U')[0].toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white leading-none">{user?.name}</h2>
                <p className="text-sm font-bold text-gray-400 mt-1">{user?.phone || user?.email}</p>
              </div>
            </div>

            <nav className="space-y-1">
              {actualMenuItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link 
                    key={item.id} 
                    href={item.href}
                    className={`flex items-center justify-between p-4 rounded-2xl transition-all group ${
                      active 
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border border-emerald-100 dark:border-emerald-800/30 shadow-sm' 
                        : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-5 h-5 ${active ? 'text-emerald-600' : 'text-gray-400 group-hover:text-emerald-500'}`} />
                      <span className="font-black text-sm uppercase tracking-wider">{item.label}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform ${active ? 'text-emerald-500 translate-x-1' : 'text-gray-300 group-hover:translate-x-1'}`} />
                  </Link>
                );
              })}

              <button 
                onClick={logout}
                className="w-full flex items-center justify-between p-4 rounded-2xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all group mt-4 border border-transparent hover:border-rose-100 dark:hover:border-rose-900/30"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5 text-rose-400 group-hover:text-rose-500" />
                  <span className="font-black text-sm uppercase tracking-wider">{t('profile.sidebar.logout')}</span>
                </div>
              </button>
            </nav>
          </div>

          <div className="mt-6 rounded-[28px] p-5 text-white shadow-xl" style={{ background: 'linear-gradient(135deg, #059669 0%, #0D9488 100%)', boxShadow: '0 20px 25px -5px rgba(5,150,105,0.15)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Star className="w-5 h-5" style={{ color: '#A7F3D0' }} />
              </div>
              <div>
                <h3 className="font-black text-base leading-tight">{isPremium ? t('profile.sidebar.premiumMember') : t('profile.sidebar.standardMember')}</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#A7F3D0' }}>{isPremium ? t('profile.sidebar.activePlan') : t('profile.sidebar.standardPlan')}</p>
              </div>
            </div>
            <p className="text-xs font-medium mb-4" style={{ color: '#D1FAE5' }}>{t('profile.sidebar.savedThisMonth', { amount: totalSavings.toLocaleString('en-IN') })}</p>
            <div className="rounded-2xl p-3" style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: '#A7F3D0' }}>{t('profile.sidebar.yourRewards')}</p>
              <p className="text-2xl font-black tracking-tighter leading-none">🪙 {coins || 0} <span className="text-xs font-bold" style={{ color: '#A7F3D0' }}>{t('profile.sidebar.coins')}</span></p>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
