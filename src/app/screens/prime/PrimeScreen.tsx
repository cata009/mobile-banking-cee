/**
 * PrimeScreen Component
 * Main Prime screen with 2 tabs: YOUR ADVISOR & YOUR BENEFITS
 * Uses centralized translation system
 */

import { useState } from 'react';
import type { UIEvent } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { YourAdvisorTab } from './YourAdvisorTab';
import { YourBenefitsTab } from './YourBenefitsTab';
import PageHeader from '@/app/components/PageHeader';
import imgPrimeHome from "figma:asset/6f8736f05a24b87b9ef5508cfd9021e9a466bf48.png";

interface PrimeScreenProps {
  onBack: () => void;
}

export default function PrimeScreen({ onBack }: PrimeScreenProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'advisor' | 'benefits'>('advisor');
  const [headerProgress, setHeaderProgress] = useState(0);

  const handlePageScroll = (event: UIEvent<HTMLDivElement>) => {
    const progress = Math.min(1, Math.max(0, event.currentTarget.scrollTop / 48));
    setHeaderProgress(progress);
  };

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
        {/* SCROLLABLE Content - PageHeader + tabs + content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide pb-[24px]" onScroll={handlePageScroll}>
          <PageHeader
            title={t('prime.pageTitle')}
            onBack={onBack}
            variant="dark"
            collapsedTitleProgress={headerProgress}
            includeSafeArea
            showHelp={false}
          />

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
                <p className={`uc-type-n5-strong uppercase ${
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
                <p className={`uc-type-n5-strong uppercase ${
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
