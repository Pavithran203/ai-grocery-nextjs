"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff, Loader2, ShoppingBag, Leaf, Zap } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, register } = useAuth();

  const [tab,     setTab]     = useState("login");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [showPwd, setShowPwd] = useState(false);

  // ── Login ──────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    const { email, password } = e.target.elements;
    try {
      await login(email.value, password.value);
      router.push("/");
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  // ── Register ───────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    const { name, email, password, phone } = e.target.elements;
    try {
      await register(name.value, email.value, password.value, phone.value);
      router.push("/");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5C61F2]/50 focus:border-[#5C61F2] transition sm:text-sm";

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-4xl flex rounded-3xl overflow-hidden shadow-2xl shadow-indigo-900/10 border border-gray-100 dark:border-gray-800">

        {/* ── Left Panel (decorative) — hidden on mobile ── */}
        <div className="hidden md:flex flex-col justify-between w-1/2 bg-[#5C61F2] p-10 text-white">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center font-black text-2xl mb-8">
              FK
            </div>
            <h1 className="text-4xl font-black leading-tight mb-4">
              Fresh groceries,<br />delivered fast.
            </h1>
            <p className="text-indigo-200 text-sm leading-relaxed">
              Join thousands of happy customers who get their daily essentials delivered in minutes.
            </p>
          </div>

          {/* Feature pills */}
          <div className="space-y-3">
            {[
              { icon: <Zap className="w-4 h-4" />,         text: "10-min express delivery" },
              { icon: <Leaf className="w-4 h-4" />,        text: "Fresh & organic products" },
              { icon: <ShoppingBag className="w-4 h-4" />, text: "500+ grocery items" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-xl px-4 py-3">
                <span className="text-indigo-200">{icon}</span>
                <span className="text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right Panel (form) ── */}
        <div className="flex-1 bg-white dark:bg-gray-900 p-8 md:p-12 flex flex-col justify-center">

          {/* Mobile logo */}
          <div className="flex md:hidden items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-[#5C61F2] flex items-center justify-center text-white font-black text-lg">FK</div>
            <span className="font-extrabold text-xl text-gray-900 dark:text-white">FreshKart</span>
          </div>

          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1">
            {tab === "login" ? "Welcome back 👋" : "Create your account"}
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            {tab === "login"
              ? "Sign in to continue shopping."
              : "Sign up to get started with FreshKart."}
          </p>

          {/* Tab switcher */}
          <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 mb-6 p-1 bg-gray-50 dark:bg-gray-800 gap-1">
            {["login", "register"].map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); }}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                  tab === t
                    ? "bg-[#5C61F2] text-white shadow-md shadow-indigo-200"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {t === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm font-medium border border-red-100 dark:border-red-900 flex items-start gap-2">
              <span className="mt-0.5">⚠️</span> {error}
            </div>
          )}

          {/* ── LOGIN FORM ── */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Email</label>
                <input name="email" type="email" required placeholder="you@example.com" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Password</label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPwd ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className={inputClass + " pr-11"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#5C61F2] hover:bg-[#4b50d9] disabled:opacity-60 text-white rounded-xl py-3.5 font-bold text-sm transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 active:scale-[0.98]"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Signing in…" : "Sign In"}
              </button>
              <p className="text-center text-sm text-gray-500">
                No account?{" "}
                <button type="button" onClick={() => setTab("register")} className="text-[#5C61F2] font-bold hover:underline">
                  Register here
                </button>
              </p>
            </form>
          )}

          {/* ── REGISTER FORM ── */}
          {tab === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Full Name</label>
                <input name="name" type="text" required placeholder="Gokul S" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Email</label>
                <input name="email" type="email" required placeholder="you@example.com" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Phone (optional)</label>
                <input name="phone" type="tel" placeholder="+91 98765 43210" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Password</label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPwd ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="Min 6 characters"
                    className={inputClass + " pr-11"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#5C61F2] hover:bg-[#4b50d9] disabled:opacity-60 text-white rounded-xl py-3.5 font-bold text-sm transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 active:scale-[0.98]"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Creating account…" : "Create Account"}
              </button>
              <p className="text-center text-sm text-gray-500">
                Already have an account?{" "}
                <button type="button" onClick={() => setTab("login")} className="text-[#5C61F2] font-bold hover:underline">
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
