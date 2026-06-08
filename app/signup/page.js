"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  ArrowRight, 
  Leaf, 
  Loader2,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const result = await signup(formData.email, formData.password, formData.name, formData.phone);
    if (result.success) {
      router.push("/profile");
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50 dark:bg-black flex items-center justify-center p-4 py-12">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-gray-900 rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
        
        {/* Left: Branding */}
        <div className="hidden lg:flex bg-emerald-600 p-12 flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12">
            <Leaf className="w-40 h-40 text-white/10 -rotate-12" />
          </div>
          
          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-3 mb-16">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <Leaf className="w-6 h-6 text-emerald-600" />
              </div>
              <span className="text-2xl font-black tracking-tighter">Near Mart</span>
            </Link>
            
            <h1 className="text-5xl font-black leading-tight tracking-tighter mb-8">
              Join the <br />
              <span className="text-emerald-200">Fresh Revolution</span>
            </h1>
            
            <div className="space-y-6">
              {[
                "AI-powered grocery matching",
                "10-minute lightning delivery",
                "Direct from farm freshness",
                "Exclusive loyalty rewards"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <CheckCircle2 size={14} className="text-emerald-100" />
                  </div>
                  <span className="font-bold text-emerald-50">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-4 bg-black/20 p-4 rounded-3xl border border-white/10 backdrop-blur-md">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-emerald-100">Secure Registration</p>
              <p className="text-[10px] font-medium text-emerald-200/70 uppercase">256-bit encrypted data</p>
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="p-8 lg:p-16 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter mb-2">Create Account</h2>
            <p className="text-gray-500 font-bold uppercase text-xs tracking-widest mb-10">Sign up in seconds to start shopping</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative group">
                <User className="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                <input 
                  required
                  className="checkout-input pl-12" 
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="relative group">
                <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                <input 
                  required
                  type="email"
                  className="checkout-input pl-12" 
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="relative group">
                <Phone className="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                <input 
                  required
                  type="tel"
                  className="checkout-input pl-12" 
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g,'').slice(0,10)})}
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                <input 
                  required
                  type="password"
                  className="checkout-input pl-12" 
                  placeholder="Password"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                <input 
                  required
                  type="password"
                  className="checkout-input pl-12" 
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                />
              </div>

              {error && (
                <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase p-4 rounded-2xl border border-rose-100 dark:border-rose-900/30 text-center">
                  {error}
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-5 rounded-[24px] font-black text-lg shadow-lg shadow-emerald-600/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3 mt-4"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Create Account <ArrowRight size={20} /></>}
              </button>
            </form>

            <p className="mt-8 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Already have an account? <Link href="/" className="text-emerald-600 hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
