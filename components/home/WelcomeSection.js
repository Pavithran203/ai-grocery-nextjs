"use client";
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { Search, TrendingUp, Sparkles } from 'lucide-react';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function getGreetingEmoji() {
  const hour = new Date().getHours();
  if (hour < 12) return '☕';
  if (hour < 17) return '🍳';
  return '🥗';
}

export default function WelcomeSection() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const greetingKey = getGreeting();
  const greeting = t(`home.${greetingKey}`);
  const emoji = getGreetingEmoji();
  const userName = user?.name?.split(' ')[0] || 'User';

  return (
    <section className="px-6 pt-16 pb-4 max-w-7xl mx-auto">
      <div className="flex items-center gap-8">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white dark:bg-gray-900 rounded-[30px] sm:rounded-[40px] flex items-center justify-center text-3xl sm:text-5xl shadow-2xl shadow-gray-200/50 dark:shadow-none border-2 border-gray-50 dark:border-gray-800 relative group transition-all hover:-translate-y-2">
          <span className="group-hover:scale-125 transition-transform duration-500">{emoji}</span>
          <div className="absolute -top-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Sparkles className="w-3 h-3 sm:w-4 h-4 text-white animate-pulse" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tighter leading-tight mb-2">
            {greeting}, <span className="text-emerald-500">{userName}!</span>
          </h1>
          <div className="flex items-center gap-3">
             <div className="h-[2px] w-8 bg-emerald-500/30 rounded-full" />
             <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em]">
               {t('home.welcomeSubtitle') || 'Fresh Staples Delivered in 10 Minutes'}
             </p>
          </div>
        </div>
      </div>
    </section>
  );
}
