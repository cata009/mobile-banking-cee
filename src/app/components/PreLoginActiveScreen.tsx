import { useState } from 'react';
import { useLanguage } from "@/app/contexts/LanguageContext";
import backgroundImage from "figma:asset/8bd60aae39a3561f94f07a9337dc105869df04aa.png";
import UniCreditLogo from "@/app/components/UniCreditLogo";
import LanguageSelectorButton from "@/app/components/ui/LanguageSelectorButton";
import NavigationLink from "@/app/components/ui/NavigationLink";
import PrimaryButton from "@/app/components/ui/PrimaryButton";
import FaceIdAnimation from "@/app/components/FaceIdAnimation";
import { AnimatePresence } from 'motion/react';

interface PreLoginActiveScreenProps {
  onOtherClick: () => void;
  onLanguageClick: () => void;
  onLoginClick?: () => void;
}

/**
 * PreLogin Screen for ACTIVATED App
 * 
 * Key differences from PreLoginScreen (Inactive):
 * - No Product Accordion (carousel)
 * - Different heading structure: H1 (title) + H2 (subtitle) at top
 * - "Log in" button instead of "Activate Application"
 * - Same bottom navigation (Contacts, MToken, Other)
 * - Different "Other" menu items
 * 
 * Distances:
 * - 24px: Header to Title container
 * - 8px: Between H1 and H2
 */
export default function PreLoginActiveScreen({
  onOtherClick,
  onLanguageClick,
  onLoginClick,
}: PreLoginActiveScreenProps) {
  const { t, language } = useLanguage();
  const [showFaceId, setShowFaceId] = useState(false);

  console.log("🟢 PreLoginActiveScreen rendered");

  // Handler pentru click pe Login
  const handleLoginClick = () => {
    console.log("🔐 Login button clicked - starting Face ID animation");
    setShowFaceId(true);
  };

  // Handler pentru finalizare Face ID
  const handleFaceIdComplete = () => {
    console.log("✅ Face ID complete - triggering navigation to Homepage");
    setShowFaceId(false);
    // Trigger navigation to Homepage
    if (onLoginClick) {
      onLoginClick();
    }
  };

  return (
    <div className="w-full h-full relative bg-[var(--uc-static-black)]">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={backgroundImage} 
          alt="Background" 
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Contrast Gradient Overlay - for text visibility */}
      <div 
        className="absolute top-0 left-0 w-full z-10"
        style={{
          height: '75vh', // Adaptive height that reaches bottom section
          background: 'linear-gradient(180deg, color-mix(in srgb, var(--uc-static-black) 70%, transparent) 0%, color-mix(in srgb, var(--uc-static-black) 0%, transparent) 100%)'
        }}
      />
      
      {/* Content Layer */}
      <div className="absolute inset-0 z-20 flex flex-col">
        {/* Header - Logo + Language Selector */}
        <div className="pt-[70px] px-[24px] pb-[10px] flex items-center justify-between">
          <UniCreditLogo className="h-[24px] w-auto" />
          <LanguageSelectorButton onClick={onLanguageClick} language={language} />
        </div>
        
        {/* Title Container - 24px below header */}
        <div className="mt-[24px] px-[24px] flex flex-col gap-[8px]">
          {/* H1 Title - 38px, bold, 40px line-height */}
          <h1 
            className="text-[var(--uc-static-white)] font-['UniCredit'] text-[38px] font-bold leading-[40px] tracking-[0.335px]"
            style={{ whiteSpace: 'pre-wrap' }}
          >
            {t('preLoginActive.title')}
          </h1>
          
          {/* H2 Subtitle - 18px, regular - 8px gap from H1 */}
          <h2 className="uc-type-p1 text-[var(--uc-static-white)]">
            {t('preLoginActive.subtitle')}
          </h2>
        </div>
        
        {/* Bottom Section - Login Button + Navigation with gradient background */}
        <div 
          className="mt-auto w-full flex flex-col items-start px-[24px] py-[32px] gap-[24px]"
          style={{
            background: 'linear-gradient(180deg, color-mix(in srgb, var(--uc-primary-k1) 0%, transparent) 0%, var(--uc-text) 5.95%)'
          }}
        >
          {/* Login Button */}
          <PrimaryButton 
            text={t('preLoginActive.loginButton')} 
            onClick={handleLoginClick}
          />
          
          {/* Bottom Navigation - 3 links */}
          <div className="flex items-center justify-between w-full">
            <NavigationLink 
              text={t('preLoginActive.contacts')} 
              onClick={() => console.log("🔵 CONTACTS link clicked")} 
            />
            <NavigationLink 
              text={t('preLoginActive.mtoken')} 
              onClick={() => console.log("🔵 MTOKEN link clicked")} 
            />
            <NavigationLink 
              text={t('preLoginActive.other')} 
              onClick={() => {
                console.log("🔵 OTHER link clicked - calling onOtherClick");
                onOtherClick();
              }} 
            />
          </div>
        </div>
      </div>

      {/* Face ID Animation */}
      <AnimatePresence>
        {showFaceId && (
          <FaceIdAnimation 
            onComplete={handleFaceIdComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
