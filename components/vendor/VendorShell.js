"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useVendorAuth } from '@/lib/vendor/useVendorAuth';
import {
  LayoutDashboard, Package, PlusCircle, Warehouse, ShoppingBag,
  StoreIcon, FileQuestion, Settings, LogOut, Menu, X, ArrowLeft, ChevronRight
} from 'lucide-react';

const vendorNavItems = [
  { href: '/vendor', label: 'Overview', icon: LayoutDashboard },
  { href: '/vendor/products', label: 'My Products', icon: Package },
  { href: '/vendor/add-product', label: 'Add Product', icon: PlusCircle },
  { href: '/vendor/inventory', label: 'Inventory', icon: Warehouse },
  { href: '/vendor/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/vendor/store-profile', label: 'Store Profile', icon: StoreIcon },
  { href: '/vendor/product-requests', label: 'Product Requests', icon: FileQuestion },
  { href: '/vendor/settings', label: 'Settings', icon: Settings },
];

export default function VendorShell({ children }) {
  const pathname = usePathname();
  const { isAuthenticated, user, store, logout } = useVendorAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!isAuthenticated) {
    return <VendorLogin />;
  }

  const sidebarContent = (
    <>
      <div className="mb-8 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 font-black text-white text-sm shadow-lg shadow-violet-200/50">
            {store?.emoji || '🏪'}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-violet-600">Vendor Portal</p>
            <p className="mt-0.5 text-sm font-black text-slate-900 truncate">{store?.name || user?.name || 'My Store'}</p>
          </div>
        </div>
        <button onClick={() => setMobileOpen(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 lg:hidden">
          <X className="h-5 w-5" />
        </button>
      </div>

      {store?.status === 'pending_review' && (
        <div className="mb-6 rounded-2xl bg-amber-50 border border-amber-200 p-4">
          <p className="text-xs font-black text-amber-700">⏳ Store Pending Approval</p>
          <p className="mt-1 text-[11px] text-amber-600">Your store is under review. Some features may be limited.</p>
        </div>
      )}

      <div className="space-y-1">
        {vendorNavItems.map(item => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-200 ${
                active
                  ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/20'
                  : 'text-slate-600 hover:bg-violet-50 hover:text-violet-700'
              }`}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              <span className="truncate">{item.label}</span>
              {active && <ChevronRight className="ml-auto h-4 w-4 opacity-60" />}
            </Link>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100">
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-2xl px-4 py-2.5 text-xs font-bold text-violet-600 hover:bg-violet-50 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to Store
        </Link>
      </div>

      <div className="mt-auto rounded-2xl bg-gradient-to-br from-slate-50 to-violet-50 border border-slate-200 p-4">
        <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Logged in as</div>
        <div className="mt-2 font-black text-slate-900 text-sm truncate">{user?.email}</div>
        <button
          onClick={logout}
          className="mt-3 flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-600 transition"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-slate-50">
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden w-[280px] shrink-0 flex-col border-r border-slate-200/80 bg-white/80 backdrop-blur-sm px-5 py-6 lg:flex">
          {sidebarContent}
        </aside>

        {/* Mobile Backdrop */}
        {mobileOpen && (
          <div onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden" />
        )}

        {/* Mobile Drawer */}
        <aside className={`fixed bottom-0 top-0 left-0 z-50 flex w-[285px] flex-col border-r border-slate-200 bg-white px-5 py-6 transition-transform duration-300 lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          {sidebarContent}
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          {/* Topbar */}
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/80 backdrop-blur-sm px-4 py-3 md:px-6">
            <button onClick={() => setMobileOpen(true)} className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden lg:block">
              <h2 className="text-lg font-black text-slate-900">
                {vendorNavItems.find(n => n.href === pathname)?.label || 'Vendor Dashboard'}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                store?.status === 'approved'
                  ? 'bg-emerald-100 text-emerald-700'
                  : store?.status === 'rejected'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {store?.status || 'Not Registered'}
              </div>
            </div>
          </header>

          <main className="p-4 md:p-6 xl:p-8 flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

// ── Vendor Login Component ────────────────────────────────────
function VendorLogin() {
  const { login, isLoading } = useVendorAuth();
  const [email, setEmail] = useState('vendor@nearmart.com');
  const [password, setPassword] = useState('Vendor123!');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (!result.success) {
      setError(result.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 text-2xl shadow-xl shadow-violet-500/20 mb-4">
            🏪
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Vendor Portal</h1>
          <p className="mt-2 text-sm text-slate-500 font-medium">Sign in to manage your store on NearMart</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-200/50 p-8 space-y-5">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-bold text-red-600">{error}</div>
          )}

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 py-3.5 text-sm font-black text-white uppercase tracking-wider shadow-lg shadow-violet-500/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="rounded-xl bg-violet-50 border border-violet-100 p-4 mt-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-violet-600 mb-2">Demo Credentials</p>
            <p className="text-xs text-violet-700"><strong>Email:</strong> vendor@nearmart.com</p>
            <p className="text-xs text-violet-700"><strong>Password:</strong> Vendor123!</p>
          </div>
        </form>

        <div className="text-center mt-6">
          <Link href="/" className="text-xs font-bold text-slate-400 hover:text-slate-600 transition">
            ← Back to NearMart Store
          </Link>
        </div>
      </div>
    </div>
  );
}
