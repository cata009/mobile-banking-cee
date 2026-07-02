import { useState } from 'react';
import { useLanguage, Language } from '@/app/contexts/LanguageContext';
import { useDemo } from '@/app/state/demoStore';
import { getAvailableLanguages, getLanguageDisplayName } from '@/app/registry/languageByCountry';
import { getTranslations } from '@/translations';
import { RadioButton } from '@/app/components/common';
import PageHeader from '@/app/components/PageHeader';

interface LanguageSelectorProps {
  onBack: () => void;
}

export default function LanguageSelector({ onBack }: LanguageSelectorProps) {
  const { language, setLanguage, t } = useLanguage();
  const { country } = useDemo(); // Get current country from demo state
  const [tempLanguage, setTempLanguage] = useState<Language>(language);

  // Get available languages for current country
  const availableLanguages = getAvailableLanguages(country);

  const handleSave = () => {
    console.log('🌐 Saving language:', tempLanguage);
    setLanguage(tempLanguage);
    console.log('✅ Language set to:', tempLanguage);
    onBack();
  };

  const handleLanguageChange = (lang: Language) => {
    setTempLanguage(lang);
  };

  // Temporary translation for language selector
  // Uses tempLanguage to show preview of selected language
  const tempT = (key: string): string => {
    const translations = getTranslations(country, tempLanguage);
    if (!translations) return key;
    
    // Navigate through nested object: 'languageSelector.selectLanguage'
    const keys = key.split('.');
    let value: any = translations;
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }
    return typeof value === 'string' ? value : key;
  };

  return (
    <div className="w-full h-full relative bg-[var(--uc-surface)] flex flex-col">
      {/* Page Header - cu spacing corect de la status bar */}
      <div className="pt-[var(--uc-phone-top-reserve,54px)]"> {/* phone top reserve */}
        <PageHeader 
          title={tempT('languageSelector.selectLanguage')}
          onBack={onBack}
        />
      </div>
      
      {/* Content cu 24px gap față de header */}
      <div className="flex-1 pt-[24px] pb-[24px] flex flex-col">
        {/* Language options - dynamic based on country */}
        <div className="flex flex-col gap-0 mb-auto">
          {availableLanguages.map((lang) => (
            <RadioButton
              key={lang}
              selected={tempLanguage === lang}
              onClick={() => handleLanguageChange(lang)}
              label={getLanguageDisplayName(lang)}
            />
          ))}
        </div>
        
        {/* Save button */}
        <div className="mt-auto px-[24px]">
          <button
            onClick={handleSave}
            className="w-full h-[48px] bg-[var(--uc-action)] rounded-[4px] flex items-center justify-center cursor-pointer transition-opacity hover:opacity-90"
          >
            <span className="uc-type-h2 text-[var(--uc-static-white)]">
              {tempT('languageSelector.save')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
