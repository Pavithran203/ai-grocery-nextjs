"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, getToken } from "@/services/api";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [authState, setAuthState] = useState("loading"); // "loading" | "authorized" | "forbidden"

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setAuthState("forbidden");
      return;
    }

    api
      .getMe()
      .then((data) => {
        const user = data.user || data;
        if (user && user.role === "admin") {
          setAuthState("authorized");
        } else {
          setAuthState("forbidden");
        }
      })
      .catch(() => {
        setAuthState("forbidden");
      });
  }, []);

  if (authState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            Verifying admin access…
          </p>
        </div>
      </div>
    );
  }

  if (authState === "forbidden") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-sm w-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-10 text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
            403 — Forbidden
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            You do not have permission to access the Admin Panel. Please log in
            with an admin account.
          </p>
          <a
            href="/login"
            className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 hidden md:block z-20 shadow-xl">
        <div className="h-full flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center shrink-0 px-6 mb-8 text-2xl font-black text-emerald-600">
            Admin Panel
          </div>
          <nav className="mt-5 flex-1 px-4 space-y-2 text-sm font-semibold">
            <a
              href="/admin"
              className="group flex items-center px-3 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
            >
              <span className="truncate">📊 Dashboard</span>
            </a>
            <a
              href="/admin/products"
              className="group flex items-center px-3 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="truncate">📦 Products</span>
            </a>
            <a
              href="/admin/orders"
              className="group flex items-center px-3 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="truncate">📋 Orders &amp; Delivery</span>
            </a>
            <a

              href="/admin/customers"
              className="group flex items-center px-3 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="truncate">👥 Customers</span>
            </a>
            <a
              href="/admin/deliveries"
              className="group flex items-center px-3 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="truncate">🚚 Deliveries</span>
            </a>
            <a
              href="/admin/offers"
              className="group flex items-center px-3 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="truncate">🎯 Offers</span>
            </a>
            <a
              href="/admin/reports"
              className="group flex items-center px-3 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="truncate">📉 Reports</span>
            </a>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-0 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 shadow-sm z-10">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            FreshKart Control Center
          </h2>
          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-gray-500">
              <span className="text-xl">🔔</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                A
              </div>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 hidden md:block">
                Admin
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 relative overflow-y-auto focus:outline-none p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
