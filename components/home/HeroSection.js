"use client";

import React from 'react';
import Link from 'next/link';
import SafeImage from '../SafeImage';
import { useTranslation } from 'react-i18next';

export default function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="hero-section">
      {/* Subtle background blobs */}
      <div className="hero-blob hero-blob-1" />
      <div className="hero-blob hero-blob-2" />

      <div className="hero-inner">
        {/* ── LEFT COLUMN ── */}
        <div className="hero-left">
          {/* Delivery badge */}
          <div className="hero-badge">
            <span className="hero-badge-icon">⚡</span>
            <span>{t('home.heroBadge', 'Delivered in 10 minutes ⚡')}</span>
            <span className="hero-badge-icon">⚡</span>
          </div>
          {/* Headline */}
          <h1 className="hero-headline">
            {t('home.heroTitle')}
          </h1>

          {/* Subtext */}
          <p className="hero-sub">
            {t('home.heroSub', '35+ staple products — rice, dal, spices & oils — all in one tap.')}
          </p>

          {/* CTA */}
          <Link href="/stores" className="hero-cta">
            {t('home.shopNow', 'Shop Now')}
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>

          {/* Trust pills */}
          <div className="hero-trust-row">
            <div className="hero-trust-pill">
              <span className="hero-trust-dot" />
              {t('home.heroTrustFreeDelivery', 'Free delivery above ₹199')}
            </div>
            <div className="hero-trust-pill">
              <span className="hero-trust-dot" />
              {t('home.heroTrustProducts', '1000+ products')}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="hero-right">
          {/* Sparkle card */}
          <div className="hero-sparkle-card">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="hero-sparkle-icon">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>

          {/* Circular grocery image */}
          <div className="hero-img-ring">
            <div className="hero-img-inner">
              <SafeImage
                src="https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_800,h_800,q_auto,f_auto/samples/food/fish-vegetables.jpg"
                alt={t('home.heroImageAlt', 'Fresh vegetables and groceries')}
                type="banner"
                componentName="HeroSection"
                fill
                className="hero-img"
                sizes="(max-width: 768px) 280px, 380px"
                priority
                objectFit="cover"
              />
            </div>
          </div>

          {/* 50k users badge */}
          <div className="hero-users-badge">
            <div className="hero-users-label">{t('home.heroUsers', 'USERS')}</div>
            <div className="hero-users-count">50k+</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* ── Section ── */
       .hero-section {
          position: relative;
          overflow: hidden;
          background: linear-gradient(
            135deg,
            #e8faf1 0%,
            #f0fdf8 45%,
            #f7fffe 100%
          );
          padding: 56px 24px 64px;
          min-height: 480px;
          display: flex;
          align-items: center;
        }
        /* Background decorative blobs */
        .hero-blob {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(80px);
          opacity: 0.35;
        }
        .hero-blob-1 {
          width: 480px;
          height: 480px;
          background: radial-gradient(circle, #6ee7b7 0%, #34d399 100%);
          top: -160px;
          right: -120px;
        }
        .hero-blob-2 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, #a7f3d0 0%, #6ee7b7 100%);
          bottom: -100px;
          left: 80px;
        }

        /* ── Inner layout ── */
        .hero-inner {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 40px;
        }

        /* ── Left column ── */
        .hero-left {
          flex: 1;
          max-width: 560px;
          opacity: 0;
          animation: heroFadeUp 0.7s ease 0.1s forwards;
        }

        /* Delivery badge */
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #ffffff;
          border: 1.5px solid rgba(16, 185, 129, 0.2);
          border-radius: 999px;
          padding: 8px 18px;
          font-size: 11px;
          font-weight: 900;
          color: #059669;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 24px;
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.12);
        }
        .hero-badge-icon { font-size: 13px; }

        /* Headline */
        .hero-headline {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 900;
          line-height: 1.15;
          color: #111827;
          margin: 0 0 20px;
          letter-spacing: -0.03em;
        }
        .hero-headline-accent {
          background: linear-gradient(135deg, #059669, #22c55e);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Subtitle */
        .hero-sub {
          font-size: 1rem;
          color: #6b7280;
          line-height: 1.65;
          margin: 0 0 32px;
          max-width: 440px;
          font-weight: 500;
        }

        /* CTA button */
        .hero-cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: linear-gradient(135deg, #059669 0%, #22c55e 100%);
          color: #ffffff;
          font-size: 1rem;
          font-weight: 800;
          padding: 16px 32px;
          border-radius: 999px;
          text-decoration: none;
          box-shadow: 0 8px 28px rgba(34, 197, 94, 0.4);
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
                      box-shadow 0.25s ease,
                      filter 0.2s ease;
          letter-spacing: 0.01em;
          margin-bottom: 24px;
        }
        .hero-cta:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 16px 40px rgba(34, 197, 94, 0.5);
          filter: brightness(1.05);
        }
        .hero-cta:active { transform: scale(0.97); }

        /* Trust pills */
        .hero-trust-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .hero-trust-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 12px;
          font-weight: 700;
          color: #374151;
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(16, 185, 129, 0.15);
          border-radius: 999px;
          padding: 6px 14px;
          backdrop-filter: blur(8px);
        }
        .hero-trust-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: linear-gradient(135deg, #059669, #22c55e);
          flex-shrink: 0;
        }

        /* ── Right column ── */
        .hero-right {
          position: relative;
          flex-shrink: 0;
          width: 340px;
          height: 340px;
          opacity: 0;
          animation: heroFadeUp 0.7s ease 0.25s forwards;
        }

        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Sparkle card (top-right floating) */
        .hero-sparkle-card {
          position: absolute;
          top: -12px;
          right: -8px;
          z-index: 10;
          width: 52px;
          height: 52px;
          background: #ffffff;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
          animation: floatUpDown 3s ease-in-out infinite;
        }
        .hero-sparkle-icon { color: #10b981; }

        /* Circular image */
        .hero-img-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          padding: 6px;
          background: linear-gradient(135deg, #a7f3d0, #6ee7b7, #34d399);
          box-shadow: 0 20px 60px rgba(16, 185, 129, 0.3);
          animation: floatUpDown 4s ease-in-out infinite;
        }
        .hero-img-inner {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          overflow: hidden;
          background: #f0fdf8;
        }
        .hero-img {
          object-fit: cover;
          border-radius: 50%;
        }

        /* 50k badge */
        .hero-users-badge {
          position: absolute;
          bottom: 12px;
          right: -20px;
          z-index: 10;
          background: #ffffff;
          border-radius: 20px;
          padding: 12px 20px;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
          text-align: center;
          animation: floatUpDown 3.5s ease-in-out infinite 0.5s;
        }
        .hero-users-label {
          font-size: 9px;
          font-weight: 900;
          color: #9ca3af;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-bottom: 2px;
        }
        .hero-users-count {
          font-size: 22px;
          font-weight: 900;
          color: #111827;
          letter-spacing: -0.04em;
          line-height: 1;
        }

        @keyframes floatUpDown {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .hero-section { padding: 40px 20px 48px; min-height: auto; }
          .hero-inner {
            flex-direction: column;
            align-items: flex-start;
            gap: 40px;
          }
          .hero-right {
            width: 260px;
            height: 260px;
            align-self: center;
          }
          .hero-users-badge { right: -10px; bottom: 0; }
          .hero-headline { font-size: 2rem; }
        }

        @media (prefers-color-scheme: dark) {
          .hero-section {
             background: linear-gradient(
              135deg,
                #0a1f1b 0%,
                #059669 45%,
                #1a3a31 100%
             );
          }
          .hero-headline { color: #ecfdf5; }
          .hero-sub { color: #a1aca9; }
          .hero-badge { background: rgba(5, 46, 38, 0.9); border-color: rgba(16, 185, 129, 0.4); }
          .hero-sparkle-card { background: rgba(5, 46, 38, 0.8); }
          .hero-users-badge { background: rgba(5, 46, 38, 0.8); }
          .hero-users-count { color: #ecfdf5; }
          .hero-trust-pill { background: rgba(5, 46, 38, 0.85); color: #d1fae5; border-color: rgba(16, 185, 129, 0.3); }
        }
      `}</style>
    </section>
  );
}
