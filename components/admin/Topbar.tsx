"use client";

import { Bell, LogOut, Sparkles, UserCircle, Menu, ExternalLink, Search, Shield } from 'lucide-react';
import { useAdminAuth } from '@/lib/admin/useAdminAuth';
import Link from 'next/link';
import { useState } from 'react';

interface TopbarProps {
  onMenuClick?: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { user, logout, auditLogs } = useAdminAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const roleLabel = user?.role?.replace(/_/g, ' ') || 'Admin';

  return (
    <div className="border-b border-slate-200 bg-white px-4 md:px-6 py-4 shadow-sm shadow-slate-200/20">
      <div className="flex items-center justify-between gap-3">
        
        {/* Left: Mobile Menu + Welcome */}
        <div className="flex items-center gap-3 min-w-0">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 lg:hidden shrink-0"
              aria-label="Open sidebar menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-black tracking-tight text-slate-950 truncate">
              Hi, {user?.name || 'Admin'}. Welcome back.
            </h1>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">

          {/* Search – desktop only */}
          <div className="hidden md:flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 w-56 lg:w-72">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search products, orders…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm text-slate-800 outline-none w-full placeholder:text-slate-400"
            />
          </div>

          {/* Audit Bell */}
          <div className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            <Bell className="h-4 w-4 text-emerald-500" />
            <span className="hidden sm:inline font-bold">{auditLogs.length}</span>
          </div>

          {/* View Store */}
          <Link
            href="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black uppercase tracking-widest text-emerald-700 hover:bg-emerald-100 transition"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View Store
          </Link>

          {/* Admin Avatar + Role */}
          <div className="hidden lg:flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-black shrink-0">
              {(user?.name || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-slate-900 truncate">{user?.name || 'Admin'}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">{roleLabel}</p>
            </div>
          </div>

          {/* Sign Out */}
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-slate-900 px-3 py-2 text-xs font-black uppercase tracking-widest text-white transition hover:bg-slate-800"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
      
      {/* Status Badges */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-black text-emerald-800">
          <Sparkles className="h-3.5 w-3.5" /> AI forecasting active
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
          <Shield className="h-3.5 w-3.5" /> RBAC enabled
        </span>
      </div>
    </div>
  );
}
