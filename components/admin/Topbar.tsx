"use client";

import { Bell, LogOut, Sparkles, UserCircle, Menu } from 'lucide-react';
import { useAdminAuth } from '@/lib/admin/useAdminAuth';

interface TopbarProps {
  onMenuClick?: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { user, logout, auditLogs } = useAdminAuth();

  return (
    <div className="border-b border-slate-200 bg-white px-6 py-5 shadow-sm shadow-slate-200/20">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        
        {/* Title with Mobile Menu Button */}
        <div className="flex items-center gap-4">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 lg:hidden"
              aria-label="Open sidebar menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-600">Operations dashboard</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Hi, {user?.name || 'Admin'}. Welcome back.</h1>
          </div>
        </div>

        {/* Action Items */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm">
            <Bell className="h-4 w-4 text-emerald-500" />
            {auditLogs.length} audit events
          </div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-3xl bg-slate-900 px-4 py-3 text-sm font-black uppercase tracking-[0.25em] text-white transition hover:bg-slate-800"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
      
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-2 font-black text-emerald-800"><Sparkles className="h-4 w-4" /> AI demand forecasting active</span>
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-slate-700"><UserCircle className="h-4 w-4" /> Role-based access control enabled</span>
      </div>
    </div>
  );
}
