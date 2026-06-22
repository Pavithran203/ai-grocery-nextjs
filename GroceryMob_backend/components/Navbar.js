"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ShoppingCart, User, Home, Grid, Search, LogOut, Package, ChevronDown, MapPin } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import SmartSearchBar from "@/components/SmartSearchBar";

export default function Navbar() {
  const { getCartCount } = useCart();
  const { user, isLoggedIn, logout, loading } = useAuth();
  const count = getCartCount();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    router.push("/login");
  };

  // User avatar initials
  const initials = user?.name
    ? user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <>
      {/* ── Top Nav ── */}
      <nav className="sticky top-0 z-50 w-full bg-[#1F4A8E] dark:bg-[#1a3a5c] shadow-md transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <div className="shrink-0 flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-9 h-9 rounded bg-white flex items-center justify-center text-[#1F4A8E] font-black text-lg">
                  F
                </div>
                <span className="font-black text-xl hidden sm:block text-white tracking-tight">
                  FreshKart
                </span>
              </Link>
            </div>

            {/* Smart Search Bar */}
            <SmartSearchBar className="flex-1 max-w-2xl px-8 hidden sm:block" placeholder="Search groceries, brands… (Ctrl+K)" />

            {/* Desktop Nav — right side */}
            <div className="hidden sm:flex items-center gap-3">

              {/* Cart */}
              <Link href="/cart" className="relative text-white hover:bg-white/10 transition-colors rounded-lg p-2 group">
                <ShoppingCart className="h-6 w-6" />
                {count > 0 && (
                  <span className="absolute top-0 right-0 bg-[#F1A800] text-[#1F4A8E] text-xs font-black rounded-full h-5 w-5 flex items-center justify-center border-2 border-white shadow-sm">
                    {count}
                  </span>
                )}
              </Link>

              {/* Auth area */}
              {loading ? (
                // Skeleton while checking token
                <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
              ) : isLoggedIn ? (
                // ── User dropdown ──
                <div ref={menuRef} className="relative">
                  <button
                    onClick={() => setMenuOpen(o => !o)}
                    className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    {/* Avatar circle */}
                    <div className="w-9 h-9 rounded-full bg-white/90 text-[#1F4A8E] flex items-center justify-center font-black text-sm shrink-0">
                      {initials}
                    </div>
                    <span className="max-w-xs truncate text-sm font-semibold text-white hidden md:block">
                      {user?.name?.split(" ")[0]}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-white/70 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Dropdown */}
                  {menuOpen && (
                    <div className="absolute right-0 top-[calc(100%+8px)] w-56 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                      {/* User info header */}
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>

                      <div className="py-1.5">
                        <Link
                          href="/profile"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <User className="w-4 h-4 text-gray-400" /> My Profile
                        </Link>
                        <Link
                          href="/orders"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <Package className="w-4 h-4 text-gray-400" /> My Orders
                        </Link>
                        <Link
                          href="/deliveries"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <MapPin className="w-4 h-4 text-gray-400" /> My Deliveries
                        </Link>

                      </div>

                      <div className="border-t border-gray-50 dark:border-gray-800 py-1.5">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // ── Sign In button ──
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5C61F2] text-white text-sm font-bold shadow-md shadow-indigo-300/30 hover:bg-[#4b50d9] active:scale-95 transition-all"
                >
                  <User className="w-4 h-4" /> Sign In
                </Link>
              )}
            </div>

            {/* Mobile Header Actions */}
            <div className="flex sm:hidden items-center gap-3">
              <button onClick={() => router.push("/products")} className="text-gray-900 dark:text-white p-2 bg-gray-50 dark:bg-gray-800 rounded-full">
                <Search className="h-5 w-5" />
              </button>
              <Link href="/cart" className="relative text-gray-900 dark:text-white p-2 bg-gray-50 dark:bg-gray-800 rounded-full">
                <ShoppingCart className="h-5 w-5" />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#FFAB76] text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {count}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile Bottom Nav ── */}
      <div className="sm:hidden fixed bottom-6 left-6 right-6 z-50 rounded-3xl shadow-2xl shadow-indigo-900/10 border border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl px-2 py-2 flex justify-between items-center">
        <Link href="/" className="flex flex-col items-center text-white bg-[#5C61F2] px-5 py-2.5 rounded-2xl shadow-md">
          <Home className="h-6 w-6" />
          <span className="text-[11px] mt-0.5 font-bold">Home</span>
        </Link>
        <Link href="/products" className="flex flex-col items-center text-gray-400 hover:text-[#5C61F2] transition-colors px-4 py-2">
          <Grid className="h-6 w-6" />
          <span className="text-[11px] mt-0.5 font-medium">Shop</span>
        </Link>
        <Link href="/cart" className="relative flex flex-col items-center text-gray-400 hover:text-[#5C61F2] transition-colors px-4 py-2">
          <ShoppingCart className="h-6 w-6" />
          <span className="text-[11px] mt-0.5 font-medium">Cart</span>
          {count > 0 && (
            <span className="absolute top-1 right-2 bg-[#FFAB76] text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
              {count}
            </span>
          )}
        </Link>
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="flex flex-col items-center text-rose-400 hover:text-rose-600 transition-colors px-4 py-2"
          >
            <LogOut className="h-6 w-6" />
            <span className="text-[11px] mt-0.5 font-medium">Logout</span>
          </button>
        ) : (
          <Link href="/login" className="flex flex-col items-center text-gray-400 hover:text-[#5C61F2] transition-colors px-4 py-2">
            <User className="h-6 w-6" />
            <span className="text-[11px] mt-0.5 font-medium">Sign In</span>
          </Link>
        )}
      </div>
    </>
  );
}
