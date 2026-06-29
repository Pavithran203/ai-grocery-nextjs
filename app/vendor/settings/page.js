"use client";

import { useVendorAuth } from '@/lib/vendor/useVendorAuth';
import { Settings, Bell, Shield, LogOut } from 'lucide-react';

export default function VendorSettingsPage() {
  const { user, store, logout } = useVendorAuth();

  return (
    <div className="max-w-2xl space-y-6" suppressHydrationWarning>
      <div>
        <h1 className="text-xl font-black text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Manage your vendor account and preferences.</p>
      </div>

      {/* Account Info */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Shield className="h-4 w-4 text-violet-500" />
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Account Information</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Name</p>
              <p className="text-sm font-bold text-slate-900 mt-1">{user?.name || 'Vendor'}</p>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Email</p>
              <p className="text-sm font-bold text-slate-900 mt-1">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Role</p>
              <p className="text-sm font-bold text-slate-900 mt-1 capitalize">{user?.role}</p>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Store Status</p>
              <p className={`text-sm font-bold mt-1 capitalize ${
                store?.status === 'approved' ? 'text-emerald-600' :
                store?.status === 'rejected' ? 'text-red-600' :
                'text-amber-600'
              }`}>
                {store?.status || 'Not Registered'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications (placeholder) */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Bell className="h-4 w-4 text-violet-500" />
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Notifications</h3>
        </div>
        <div className="space-y-3">
          {[
            { label: 'New order alerts', checked: true },
            { label: 'Low stock reminders', checked: true },
            { label: 'Weekly performance report', checked: false },
          ].map((item, i) => (
            <label key={i} className="flex items-center justify-between rounded-xl bg-slate-50 p-4 cursor-pointer">
              <span className="text-sm font-medium text-slate-700">{item.label}</span>
              <input
                type="checkbox"
                defaultChecked={item.checked}
                className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl bg-white border border-red-200 p-6">
        <h3 className="text-sm font-black text-red-600 uppercase tracking-wider mb-4">Danger Zone</h3>
        <button
          onClick={logout}
          className="flex items-center gap-2 rounded-xl border border-red-200 px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </div>
  );
}
