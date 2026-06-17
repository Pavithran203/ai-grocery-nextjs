"use client";

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import Topbar from '@/components/admin/Topbar';
import AdminLogin from '@/components/admin/AdminLogin';
import { useAdminAuth } from '@/lib/admin/useAdminAuth';
import { canAccess } from '@/lib/admin/permissions';
import { ShieldOff } from 'lucide-react';

function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="rounded-full bg-red-100 p-6">
        <ShieldOff className="h-12 w-12 text-red-500" />
      </div>
      <h1 className="mt-8 text-5xl font-black tracking-tight text-slate-300">403</h1>
      <p className="mt-4 text-xl font-black text-slate-900">Access Denied</p>
      <p className="mt-2 max-w-md text-sm text-slate-650">
        You do not have the required role to access this page.
      </p>
      <Link
        href="/admin"
        className="mt-8 inline-flex items-center gap-2 rounded-3xl bg-slate-900 px-6 py-4 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:bg-slate-800"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAdminAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  const authorized = canAccess(user?.role, pathname);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar 
          mobileOpen={mobileSidebarOpen} 
          onClose={() => setMobileSidebarOpen(false)} 
        />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar onMenuClick={() => setMobileSidebarOpen(true)} />
          <main className="p-4 md:p-6 xl:p-8 flex-1">
            {authorized ? children : <AccessDenied />}
          </main>
        </div>
      </div>
    </div>
  );
}
