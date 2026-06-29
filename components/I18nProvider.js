"use client";
import i18n from '@/i18n/config';
import { I18nextProvider } from 'react-i18next';
import { useEffect, useState } from 'react';

export default function I18nProvider({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <div suppressHydrationWarning>
        {mounted ? children : null}
      </div>
    </I18nextProvider>
  );
}
