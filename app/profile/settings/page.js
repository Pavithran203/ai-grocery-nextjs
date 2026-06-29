"use client";

import { 
  Settings, 
  Bell, 
  Moon, 
  Sun, 
  Globe, 
  Volume2, 
  HelpCircle, 
  FileText,
  ChevronRight,
  ShieldAlert
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useTranslation } from "react-i18next";

export default function SettingsPage() {
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();
  const [notifications, setNotifications] = useState({
    orders: true,
    promos: false,
    delivery: true,
    security: true
  });

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark");
      setDarkMode(isDark);
    }
  }, []);

  const handleThemeToggle = () => {
    const nextTheme = !darkMode;
    setDarkMode(nextTheme);
    if (nextTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const toggleNotif = (key) => setNotifications(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter mb-1">{t('profile.settings.title')}</h1>
        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">{t('profile.settings.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* App Settings */}
        <div className="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tighter flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center text-violet-600">
                <Settings className="w-5 h-5" />
              </div>
              {t('profile.settings.general')}
            </h2>
          </div>
          
          <div className="p-8 space-y-6">
            {/* Language */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                  <Globe size={20} />
                </div>
                <div>
                  <h3 className="font-black text-xs uppercase tracking-widest text-gray-800 dark:text-gray-100">{t('profile.settings.language')}</h3>
                  <p className="text-[10px] font-bold text-gray-400">{t('profile.settings.langDesc')}</p>
                </div>
              </div>
              <select 
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-emerald-500 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest outline-none transition-all"
              >
                <option value="EN">English</option>
                <option value="தமிழ்">Tamil</option>
                <option value="తెలుగు">Telugu</option>
                <option value="ಕನ್ನಡ">Kannada</option>
                <option value="മലയാളം">Malayalam</option>
                <option value="हिंदी">Hindi</option>
              </select>
            </div>

            {/* Appearance */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                  {darkMode ? <Moon size={20} /> : <Sun size={20} />}
                </div>
                <div>
                  <h3 className="font-black text-xs uppercase tracking-widest text-gray-800 dark:text-gray-100">{t('profile.settings.appearance')}</h3>
                  <p className="text-[10px] font-bold text-gray-400">{t('profile.settings.themeDesc')}</p>
                </div>
              </div>
              <button 
                onClick={handleThemeToggle}
                className="bg-gray-50 dark:bg-gray-800 border-2 border-transparent rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest transition-all hover:border-emerald-500 cursor-pointer"
              >
                {darkMode ? 'Dark' : 'Light'}
              </button>
            </div>

            {/* Sounds */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                  <Volume2 size={20} />
                </div>
                <div>
                  <h3 className="font-black text-xs uppercase tracking-widest text-gray-800 dark:text-gray-100">{t('profile.settings.sounds')}</h3>
                  <p className="text-[10px] font-bold text-gray-400">{t('profile.settings.soundsDesc')}</p>
                </div>
              </div>
              <div className="w-12 h-6 bg-emerald-500 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tighter flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                <Bell className="w-5 h-5" />
              </div>
              {t('profile.settings.notifCenter')}
            </h2>
          </div>
          
          <div className="p-8 space-y-6">
            {Object.entries(notifications).map(([key, enabled]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-xs uppercase tracking-widest text-gray-800 dark:text-gray-100">{t(`profile.settings.${key}Notif`)}</h3>
                  <p className="text-[10px] font-bold text-gray-400">{t(`profile.settings.${key}NotifDesc`)}</p>
                </div>
                <div 
                  onClick={() => toggleNotif(key)}
                  className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-300 ${enabled ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-800'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${enabled ? 'right-1' : 'left-1'}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Support & Links */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-white dark:bg-gray-900 p-6 rounded-[28px] border border-gray-100 dark:border-gray-800 text-left hover:border-emerald-200 transition-all group">
            <HelpCircle className="w-8 h-8 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-black text-xs uppercase tracking-widest mb-1">{t('profile.settings.helpCenter')}</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{t('profile.settings.helpDesc')}</p>
          </button>
          <button className="bg-white dark:bg-gray-900 p-6 rounded-[28px] border border-gray-100 dark:border-gray-800 text-left hover:border-emerald-200 transition-all group">
            <FileText className="w-8 h-8 text-gray-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-black text-xs uppercase tracking-widest mb-1">{t('profile.settings.legalPolicies')}</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{t('profile.settings.legalDesc')}</p>
          </button>
          <button className="bg-white dark:bg-gray-900 p-6 rounded-[28px] border border-gray-100 dark:border-gray-800 text-left hover:border-emerald-200 transition-all group">
            <ShieldAlert className="w-8 h-8 text-rose-500 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-black text-xs uppercase tracking-widest mb-1">{t('profile.settings.reportIssue')}</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{t('profile.settings.reportDesc')}</p>
          </button>
        </div>
      </div>

      <div className="text-center pt-8">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">{t('profile.settings.version')}</p>
      </div>
    </div>
  );
}
