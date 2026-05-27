import { useLanguage } from "@/app/contexts/LanguageContext";
import type { Language } from "@/app/contexts/LanguageContext";

interface LanguageSelectorButtonProps {
  onClick: () => void;
  language?: Language;
}

export default function LanguageSelectorButton({ onClick, language: providedLanguage }: LanguageSelectorButtonProps) {
  // If language is provided as prop, use it; otherwise use context
  const context = useLanguage();
  const language = providedLanguage ?? context.language;
  
  return (
    <button
      onClick={onClick}
      className="flex flex-col justify-center items-end gap-[1px] cursor-pointer hover:opacity-80 transition-opacity"
    >
      {/* Language code */}
      <p 
        className="text-[var(--uc-static-white)] text-right font-['UniCredit'] text-[14px] font-bold leading-[normal]"
      >
        {language.toUpperCase()}
      </p>
      
      {/* Underline */}
      <div className="h-[1px] w-full bg-[var(--uc-surface)]" />
    </button>
  );
}