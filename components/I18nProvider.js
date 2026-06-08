"use client";
import '@/i18n/config';
import { useEffect, useState } from 'react';

export default function I18nProvider({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render a hidden container with the same children to preserve SSR structure
    // while hiding the hydration mismatch flash, OR simply return children and accept mismatch on text only.
    // To strictly avoid hydration error for i18n, we shouldn't render localized text on server,
    // but if we do, setting visibility to hidden doesn't prevent React from complaining.
    // The only true fix in Next.js for localStorage based i18n is to suppress the warnings
    // globally or delay rendering. Returning null causes a full page layout shift.
    // Returning children with suppressHydrationWarning on root is best.
  }

  // A common approach is to just render it and use suppressHydrationWarning on the <body> tag in layout.js,
  // but if we want to fix it strictly via provider:
  return (
    <div suppressHydrationWarning>
      {mounted ? children : null}
    </div>
  );
}
