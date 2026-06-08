"use client";

import { 
  ShieldCheck, 
  Lock, 
  Smartphone, 
  Fingerprint, 
  Eye, 
  EyeOff,
  History,
  Trash2,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { useState } from "react";

export default function SecurityPage() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const activeSessions = [
    { id: 1, device: 'Chrome on Windows', location: 'Chennai, India', time: 'Active now', isCurrent: true },
    { id: 2, device: 'FreshKart App (iOS)', location: 'Chennai, India', time: '2 days ago', isCurrent: false },
    { id: 3, device: 'Safari on iPhone', location: 'Mumbai, India', time: '5 days ago', isCurrent: false },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter mb-1">Security Settings</h1>
        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Keep your account protected</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Password & 2FA */}
        <div className="lg:col-span-2 space-y-8">
          {/* Change Password */}
          <div className="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm p-8">
            <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tighter mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                <Lock className="w-5 h-5" />
              </div>
              Change Password
            </h2>

            <div className="space-y-4 max-w-md">
              <div className="relative">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-1 block">Current Password</label>
                <input 
                  type={showCurrent ? "text" : "password"} 
                  className="checkout-input pr-12" 
                  placeholder="••••••••"
                />
                <button onClick={() => setShowCurrent(!showCurrent)} className="absolute right-4 bottom-3 text-gray-400 hover:text-gray-600">
                  {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="relative">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-1 block">New Password</label>
                <input 
                  type={showNew ? "text" : "password"} 
                  className="checkout-input pr-12" 
                  placeholder="••••••••"
                />
                <button onClick={() => setShowNew(!showNew)} className="absolute right-4 bottom-3 text-gray-400 hover:text-gray-600">
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="relative">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-1 block">Confirm New Password</label>
                <input 
                  type={showConfirm ? "text" : "password"} 
                  className="checkout-input pr-12" 
                  placeholder="••••••••"
                />
                <button onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 bottom-3 text-gray-400 hover:text-gray-600">
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <button className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-98 transition-all mt-4">
                Update Password
              </button>
            </div>
          </div>

          {/* 2-Step Verification */}
          <div className="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm p-8">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tighter">Two-Factor Authentication</h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Extra layer of security</p>
                </div>
              </div>
              <div className="w-12 h-6 bg-gray-100 dark:bg-gray-800 rounded-full relative cursor-pointer">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border-2 border-emerald-50 bg-emerald-50/30 dark:border-emerald-900/20 dark:bg-emerald-950/10 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-900 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                  <Smartphone size={20} />
                </div>
                <div>
                  <h3 className="font-black text-xs uppercase tracking-widest text-gray-800 dark:text-gray-100">SMS Verification</h3>
                  <p className="text-[10px] font-bold text-gray-400 mt-1">Codes sent via text message</p>
                  <button className="text-[10px] font-black text-emerald-600 mt-2 hover:underline uppercase tracking-widest">Configure</button>
                </div>
              </div>
              <div className="p-4 rounded-2xl border-2 border-gray-50 dark:border-gray-800 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-900 flex items-center justify-center text-gray-400 shadow-sm border border-gray-100">
                  <Fingerprint size={20} />
                </div>
                <div>
                  <h3 className="font-black text-xs uppercase tracking-widest text-gray-800 dark:text-gray-100">Biometric Login</h3>
                  <p className="text-[10px] font-bold text-gray-400 mt-1">Use FaceID or TouchID</p>
                  <span className="text-[10px] font-black text-gray-300 mt-2 uppercase tracking-widest">App Only</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Active Sessions & Danger Zone */}
        <div className="space-y-8">
          {/* Active Sessions */}
          <div className="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm p-8">
            <h2 className="text-sm font-black text-gray-900 dark:text-white tracking-widest uppercase mb-6 flex items-center gap-2">
              <History className="w-4 h-4 text-gray-400" />
              Active Sessions
            </h2>
            <div className="space-y-4">
              {activeSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${session.isCurrent ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gray-300'}`} />
                    <div>
                      <p className="text-xs font-black text-gray-800 dark:text-gray-100">{session.device}</p>
                      <p className="text-[10px] font-bold text-gray-400">{session.location} • {session.time}</p>
                    </div>
                  </div>
                  {!session.isCurrent && (
                    <button className="text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
              <button className="w-full text-center py-3 text-[10px] font-black text-gray-400 hover:text-rose-500 uppercase tracking-widest border-t border-gray-50 dark:border-gray-800 mt-4 transition-colors">
                Log out all other devices
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-rose-50/50 dark:bg-rose-950/10 rounded-[32px] border border-rose-100 dark:border-rose-900/30 p-8">
            <h2 className="text-sm font-black text-rose-600 tracking-widest uppercase mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Danger Zone
            </h2>
            <p className="text-[10px] font-bold text-rose-800/60 dark:text-rose-400/60 uppercase tracking-tighter leading-normal mb-6">
              Deleting your account will permanently remove all your order history, saved addresses, and loyalty points. This action cannot be undone.
            </p>
            <button className="w-full py-4 border-2 border-rose-200 dark:border-rose-900/50 text-rose-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-sm">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
