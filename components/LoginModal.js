"use client";
import { useState, useEffect } from "react";
import { X, Apple, Play, ChevronDown, ArrowRight, Loader2, Leaf, ShieldCheck, Zap, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";

export default function LoginModal() {
  const { isLoginModalOpen, setLoginModalOpen, loginWithOtp } = useAuth();
  const { t } = useTranslation();
  
  const [phone, setPhone] = useState('');
  const [otpMode, setOtpMode] = useState(false);
  const [profileMode, setProfileMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoginModalOpen) {
      setPhone('');
      setOtpMode(false);
      setProfileMode(false);
      setOtp('');
      setError('');
      setLoading(false);
    }
  }, [isLoginModalOpen]);

  if (!isLoginModalOpen) return null;

  const handleContinue = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!otpMode && !profileMode) {
      if (phone.length === 10) {
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          setOtpMode(true);
        }, 600);
      } else {
        setError(t('auth.invalidPhone', 'Please enter a valid 10-digit phone number'));
      }
      return;
    }

    if (otpMode && !profileMode) {
      if (otp === '1234' || otp === '0000') {
        setOtpMode(false);
        setProfileMode(true);
      } else {
        setError(t('auth.invalidOtp', 'Invalid OTP. Please try again.'));
      }
      return;
    }

    if (profileMode) {
      if (!name.trim()) {
        setError(t('auth.nameRequired', 'Please enter your name'));
        return;
      }
      setLoading(true);
      const result = await loginWithOtp(phone, otp, name, email);
      setLoading(false);
      if (result.success) {
        setLoginModalOpen(false);
        setProfileMode(false);
      } else {
        setError(result.message);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn" 
        onClick={() => setLoginModalOpen(false)}
      />
      
      {/* Compact High-Contrast Modal */}
      <div className="bg-white rounded-[40px] shadow-[0_32px_120px_-20px_rgba(0,0,0,0.5)] w-full max-w-[820px] max-h-[min(95vh,700px)] overflow-hidden flex flex-col md:flex-row relative z-10 animate-slideUp border-2 border-gray-100">
        
        {/* Close Button */}
        <button 
          onClick={() => setLoginModalOpen(false)}
          className="absolute top-6 right-6 z-30 p-2 hover:bg-gray-100 rounded-full transition-all active:scale-90"
        >
          <X className="w-6 h-6 text-black" />
        </button>
 
        {/* Left Pane - Full NearMart Branding */}
        <div className="hidden md:flex md:w-[42%] bg-gray-50 p-8 lg:p-10 flex-col justify-between relative overflow-hidden border-r border-gray-100">
          <div className="relative z-10">
            {/* NearMart Logo Synchronization */}
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg rotate-3 border-2 border-emerald-500/20">
                <Leaf className="w-8 h-8" style={{ color: '#10B981' }} />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xl font-black text-black tracking-tighter uppercase">{t('navbar.appName1', 'Near')}{t('navbar.appName2', 'Mart')}</span>
                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.2em]" style={{ color: '#10B981' }}>{t('home.premiumGrocery', 'Premium Grocery')}</span>
              </div>
            </div>
            
            <h1 className="text-3xl font-black text-black leading-[1.1] tracking-tighter mb-8">
              {t('auth.experienceSmartest')}
            </h1>

            <div className="space-y-5">
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md border border-emerald-500/10">
                  <Zap className="w-5 h-5" style={{ color: '#10B981' }} />
                </div>
                <span className="text-sm font-black text-black tracking-tight">{t('auth.tenMinDelivery')}</span>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md border border-emerald-500/10">
                  <ShieldCheck className="w-5 h-5" style={{ color: '#10B981' }} />
                </div>
                <span className="text-sm font-black text-black tracking-tight">{t('auth.curatedEssentials')}</span>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md border border-emerald-500/10">
                  <Sparkles className="w-5 h-5" style={{ color: '#10B981' }} />
                </div>
                <span className="text-sm font-black text-black tracking-tight">{t('auth.aiPoweredPicks')}</span>
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">{t('auth.getTheApp')}</p>
            <div className="flex gap-3">
              <div className="w-11 h-11 bg-black rounded-xl flex items-center justify-center shadow-lg hover:scale-105 transition-all cursor-pointer">
                <Play className="w-5 h-5 text-white fill-white" />
              </div>
              <div className="w-11 h-11 bg-black rounded-xl flex items-center justify-center shadow-lg hover:scale-105 transition-all cursor-pointer">
                <Apple className="w-5 h-5 text-white fill-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Pane */}
        <div className="w-full md:w-[58%] p-8 md:p-12 lg:p-14 flex flex-col justify-center bg-white overflow-y-auto no-scrollbar">
          <div className="max-w-sm mx-auto w-full">
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: '#10B981' }} />
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#065F46' }}>{t('auth.secureAccess')}</span>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-4xl font-black text-black tracking-tighter leading-none mb-3">
                    {profileMode ? t('auth.helloThere') : t('auth.letsGetStarted')}
                  </h2>
                  <p className="text-sm font-black text-gray-600">
                    {profileMode ? t('auth.namePrompt') : t('auth.mobilePrompt')}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleContinue} className="space-y-6">
                {!profileMode ? (
                  <div className="space-y-4">
                    <div className="bg-white border-2 border-gray-200 rounded-3xl p-1 flex items-center transition-all focus-within:border-emerald-600 focus-within:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.1)] group">
                      <div className="px-5 py-3.5 flex items-center gap-2 border-r border-gray-100 shrink-0">
                        <span className="text-[10px] font-black text-gray-500">IN</span>
                        <span className="text-base font-black text-black">+91</span>
                        <ChevronDown className="w-4 h-4 text-black" />
                      </div>
                      <input 
                        type="tel"
                        disabled={otpMode || loading}
                        value={phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setPhone(val);
                          if (error) setError('');
                        }}
                        placeholder="00000 00000"
                        className="flex-grow px-5 py-3 text-lg font-black text-black outline-none placeholder-gray-400 bg-transparent tracking-widest"
                      />
                    </div>

                    {otpMode && (
                      <div className="animate-slideDown">
                        <input 
                          type="text"
                          autoFocus
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          placeholder={t('auth.otpCodePlaceholder', 'OTP CODE')}
                          className="w-full bg-emerald-50 border-2 border-emerald-100 rounded-3xl px-6 py-5 text-center text-2xl font-black tracking-[0.6em] text-emerald-900 outline-none focus:border-emerald-600 focus:bg-white"
                        />
                        <p className="text-center mt-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                          {t('auth.didntGetIt')} <span className="text-emerald-700 cursor-pointer hover:underline font-black" style={{ color: '#10B981' }}>{t('auth.otpResend')}</span>
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4 animate-fadeIn">
                    <input 
                      type="text"
                      autoFocus
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t('auth.fullName')}
                      className="w-full bg-white border-2 border-gray-200 rounded-3xl px-8 py-4 text-lg font-black text-black outline-none focus:border-emerald-600"
                    />
                    <input 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('auth.emailAddress')}
                      className="w-full bg-white border-2 border-gray-200 rounded-3xl px-8 py-4 text-lg font-black text-black outline-none focus:border-emerald-600"
                    />
                  </div>
                )}

                {error && <div className="bg-red-50 text-red-600 text-[11px] font-black uppercase p-3 rounded-2xl border border-red-100 text-center">{error}</div>}

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-6 bg-gradient-to-br from-[#16A34A] to-[#22C55E] text-white font-black text-xl rounded-[24px] transition-all shadow-[0_15px_35px_rgba(22,163,74,0.3)] hover:brightness-110 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 group"
                >
                  {loading ? (
                    <Loader2 className="w-8 h-8 animate-spin" strokeWidth={3} />
                  ) : (
                    <>
                      <span className="font-black text-white">{profileMode ? t('cart.startShopping') : (otpMode ? t('auth.verifyOtp') : t('auth.continue'))}</span>
                      <ArrowRight className="w-7 h-7 text-white group-hover:translate-x-1.5 transition-transform" strokeWidth={3} />
                    </>
                  )}
                </button>
              </form>

            <div className="mt-10 flex flex-col items-center gap-6">
              <p className="text-[11px] font-black text-gray-500 text-center max-w-xs leading-relaxed uppercase tracking-widest">
                {t('auth.termsPrivacy')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
