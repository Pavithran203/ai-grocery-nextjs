"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { adminNavItems } from '@/lib/admin/menu';
import { useAdminAuth } from '@/lib/admin/useAdminAuth';
import { canAccess } from '@/lib/admin/permissions';
import { X, ArrowLeft } from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAdminAuth();

  const allowedItems = adminNavItems.filter(
    (item) => canAccess(user?.role, item.href),
  );

  const sidebarContent = (
    <>
      <div className="mb-10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-500 font-black text-white shadow-lg shadow-emerald-200/50">NM</div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-600">NearMart</p>
            <p className="mt-1 text-sm font-black text-slate-900">Operations Portal</p>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose} 
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="space-y-1">
        {allowedItems.length === 0 && (
          <p className="px-4 text-sm text-slate-500">No pages available.</p>
        )}
        {allowedItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onClose?.()}
              className={`group flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-black transition ${
                active ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/10' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Back to Web App Link */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-3xl px-4 py-3 text-xs font-black uppercase tracking-wider text-emerald-600 hover:bg-emerald-50 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to Store
        </Link>
      </div>

      <div className="mt-auto rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-650">
        <div className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Logged in as</div>
        <div className="mt-3 font-black text-slate-900 truncate">{user?.name || 'Admin'}</div>
        <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{user?.role?.replace('_', ' ')}</div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden w-[280px] shrink-0 flex-col border-r border-slate-200 bg-white px-5 py-7 lg:flex">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Mobile Drawer Content */}
      <aside className={`fixed bottom-0 top-0 left-0 z-50 flex w-[285px] flex-col border-r border-slate-200 bg-white px-5 py-7 transition-transform duration-300 ease-in-out lg:hidden ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {sidebarContent}
      </aside>
    </>
  );
}
