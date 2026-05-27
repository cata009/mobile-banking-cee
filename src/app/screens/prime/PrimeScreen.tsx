/**
 * PrimeScreen Component
 * Main Prime screen with 2 tabs: YOUR ADVISOR & YOUR BENEFITS
 * Uses centralized translation system
 */

import { useState } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { YourAdvisorTab } from './YourAdvisorTab';
import { YourBenefitsTab } from './YourBenefitsTab';
import { AppIcon } from "@/app/components/icons";
import imgPrimeHome from "figma:asset/6f8736f05a24b87b9ef5508cfd9021e9a466bf48.png";

interface PrimeScreenProps {
  onBack: () => void;
}

export default function PrimeScreen({ onBack }: PrimeScreenProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'advisor' | 'benefits'>('advisor');

  return (
    <div className="w-full h-full relative flex flex-col">
      {/* Background Layers - ABSOLUTE positioned */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(209.194deg, var(--uc-product-blue) 32.305%, var(--uc-static-black) 60.005%)" }} />
        <div className="absolute inset-0 mix-blend-soft-light" style={{ backgroundImage: "radial-gradient(61.85% 49.94% at 50.13% 50.06%, color-mix(in srgb, var(--uc-product-blue-deep) 20%, transparent) 0%, color-mix(in srgb, var(--uc-static-black) 20%, transparent) 100%)" }} />
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(37.18% 73.78% at 70% 28.98%, color-mix(in srgb, var(--uc-primary-k1) 0%, transparent) 0%, color-mix(in srgb, var(--uc-primary-k1) 20%, transparent) 100%)" }} />
        <img alt="" className="absolute max-w-none mix-blend-soft-light object-cover opacity-10 size-full" src={imgPrimeHome} />
        <div className="absolute bg-[rgb(var(--uc-shadow-rgb)_/_0.2)] inset-0" />
      </div>

      {/* Content - RELATIVE positioned above background */}
      <div className="relative z-10 flex flex-col h-full">
        {/* STICKY Header - doar back button + question mark */}
        <div className="sticky top-0 z-20 pt-[54px]">
          <div className="w-full bg-transparent">
            {/* Container cu back button - 8px de la status bar + 40px button height */}
            <div className="flex items-center justify-between h-[48px] pt-[8px]">
              {/* Back button - 8px de la stânga */}
              <button
                onClick={onBack}
                className="ml-[8px] flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity"
                style={{
                  width: '40px',
                  height: '40px',
                  padding: '8px 7.998px 7.997px 7.998px'
                }}
                aria-label="Back"
              >
                <AppIcon
                  name="back-heavy"
                  color="var(--uc-static-white)"
                  style={{
                    width: '24.003px',
                    height: '24.003px',
                    flexShrink: 0,
                    aspectRatio: '1/1'
                  }}
                />
              </button>

              {/* Empty space in right - no help button */}
              <div className="w-[40px] h-[40px]" />
            </div>
          </div>
        </div>

        {/* SCROLLABLE Content - titlu + tabs + content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide pb-[24px]">
          {/* Page Title - 8px de la sticky header */}
          <div 
            className="flex items-center"
            style={{
              width: '375px',
              padding: '8px 16px'
            }}
          >
            <h1 
              className="font-['UniCredit',sans-serif] text-[var(--uc-static-white)]"
              style={{
                fontSize: '28px',
                fontStyle: 'normal',
                fontWeight: 700,
                lineHeight: 'normal',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {t('prime.pageTitle')}
            </h1>
          </div>

          {/* 24px spacing între titlu și tabs */}
          <div className="h-[24px]" />

          {/* Tabs */}
          <div className="px-[24px]">
            <div className="flex gap-[16px] items-start w-full">
              {/* Tab: YOUR ADVISOR */}
              <button
                onClick={() => setActiveTab('advisor')}
                className={`flex items-center justify-center px-[16px] py-[8px] rounded-[4px] shrink-0 transition-colors cursor-pointer ${
                  activeTab === 'advisor'
                    ? 'bg-[var(--uc-surface)]'
                    : 'bg-transparent border border-solid border-[var(--uc-static-white)]'
                }`}
              >
                <p className={`font-['UniCredit:Bold',sans-serif] leading-[normal] not-italic text-[14px] uppercase ${
                  activeTab === 'advisor' ? 'text-[var(--uc-text)]' : 'text-[var(--uc-static-white)]'
                }`}>
                  {t('prime.tabYourAdvisor')}
                </p>
              </button>

              {/* Tab: YOUR BENEFITS */}
              <button
                onClick={() => setActiveTab('benefits')}
                className={`flex items-center justify-center px-[16px] py-[8px] rounded-[4px] shrink-0 transition-colors cursor-pointer ${
                  activeTab === 'benefits'
                    ? 'bg-[var(--uc-surface)]'
                    : 'bg-transparent border border-solid border-[var(--uc-static-white)]'
                }`}
              >
                <p className={`font-['UniCredit:Bold',sans-serif] leading-[normal] not-italic text-[14px] uppercase ${
                  activeTab === 'benefits' ? 'text-[var(--uc-text)]' : 'text-[var(--uc-static-white)]'
                }`}>
                  {t('prime.tabYourBenefits')}
                </p>
              </button>
            </div>
          </div>

          {/* 24px spacing între tabs și content */}
          <div className="h-[24px]" />

          {/* Tab Content */}
          <div className="px-[24px]">
            {activeTab === 'advisor' ? (
              <YourAdvisorTab />
            ) : (
              <YourBenefitsTab />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
