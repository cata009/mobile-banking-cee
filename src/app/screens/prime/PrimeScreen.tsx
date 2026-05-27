/**
 * PrimeScreen Component
 * Main Prime screen with 2 tabs: YOUR ADVISOR & YOUR BENEFITS
 * Uses centralized translation system
 */

import { useState } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { YourAdvisorTab } from './YourAdvisorTab';
import { YourBenefitsTab } from './YourBenefitsTab';
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
        <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(209.194deg, rgb(116, 151, 192) 32.305%, rgb(38, 38, 38) 60.005%)" }} />
        <div className="absolute inset-0 mix-blend-soft-light" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 375 895.37\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'0.20000000298023224\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(-0.05 44.718 -23.194 -0.026545 188 448.19)\\'><stop stop-color=\\'rgba(19,64,151,1)\\' offset=\\'0\\'/><stop stop-color=\\'rgba(15,48,113,1)\\' offset=\\'0.25\\'/><stop stop-color=\\'rgba(10,32,75,1)\\' offset=\\'0.5\\'/><stop stop-color=\\'rgba(5,16,38,1)\\' offset=\\'0.75\\'/><stop stop-color=\\'rgba(2,8,19,1)\\' offset=\\'0.875\\'/><stop stop-color=\\'rgba(1,4,9,1)\\' offset=\\'0.9375\\'/><stop stop-color=\\'rgba(0,0,0,1)\\' offset=\\'1\\'/></radialGradient></defs></svg>')" }} />
        <div className="absolute inset-0" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 375 895.37\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'0.20000000298023224\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(-7.5 63.586 -13.925 -1.6812 262.5 259.5)\\'><stop stop-color=\\'rgba(23,20,32,0)\\' offset=\\'0\\'/><stop stop-color=\\'rgba(38,38,38,1)\\' offset=\\'1\\'/></radialGradient></defs></svg>')" }} />
        <img alt="" className="absolute max-w-none mix-blend-soft-light object-cover opacity-10 size-full" src={imgPrimeHome} />
        <div className="absolute bg-[rgba(0,0,0,0.2)] inset-0" />
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
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none"
                  style={{
                    width: '24.003px',
                    height: '24.003px',
                    flexShrink: 0,
                    aspectRatio: '1/1'
                  }}
                >
                  <path 
                    fillRule="evenodd" 
                    clipRule="evenodd" 
                    d="M16.8452 1.01411C18.3901 2.48329 18.3901 4.86754 16.8452 6.33811L11.2511 12.0141L16.8452 17.6901C18.3901 19.1607 18.3901 21.5435 16.8452 23.0141L6.00391 12.0141L16.8452 1.01411Z" 
                    fill="white"
                  />
                </svg>
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
              className="font-['UniCredit',sans-serif] text-white"
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
                    ? 'bg-white' 
                    : 'bg-transparent border border-solid border-white'
                }`}
              >
                <p className={`font-['UniCredit:Bold',sans-serif] leading-[normal] not-italic text-[14px] uppercase ${
                  activeTab === 'advisor' ? 'text-[#262626]' : 'text-white'
                }`}>
                  {t('prime.tabYourAdvisor')}
                </p>
              </button>

              {/* Tab: YOUR BENEFITS */}
              <button
                onClick={() => setActiveTab('benefits')}
                className={`flex items-center justify-center px-[16px] py-[8px] rounded-[4px] shrink-0 transition-colors cursor-pointer ${
                  activeTab === 'benefits' 
                    ? 'bg-white' 
                    : 'bg-transparent border border-solid border-white'
                }`}
              >
                <p className={`font-['UniCredit:Bold',sans-serif] leading-[normal] not-italic text-[14px] uppercase ${
                  activeTab === 'benefits' ? 'text-[#262626]' : 'text-white'
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