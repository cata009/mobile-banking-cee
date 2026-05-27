import { useState } from "react";
import { useLanguage } from "@/app/contexts/LanguageContext";
import PageHeader from "@/app/components/PageHeader";
import TextField from "@/app/components/TextField";
import PrimaryButton from "@/app/components/PrimaryButton";
import imgCoAppingBanker from "figma:asset/315dec1a1353b81d727b0abffc6cfc5a36f4578f.png";

interface CoAppingSessionScreenProps {
  onContinue: () => void;
  onBack: () => void;
}

export default function CoAppingSessionScreen({ 
  onContinue, 
  onBack 
}: CoAppingSessionScreenProps) {
  const { t } = useLanguage();
  const [code, setCode] = useState("");

  const handleContinue = () => {
    if (code.trim()) {
      onContinue();
    }
  };

  return (
    <div className="w-full h-full relative bg-white flex flex-col">
      {/* Page Header - cu spacing corect de la status bar */}
      <div className="pt-[54px]"> {/* 54px = status bar height (46px) + 8px gap */}
        <PageHeader 
          title={t('coApping.coAppingSession')}
          onBack={onBack}
        />
      </div>
      
      {/* Content cu 24px gap față de header */}
      <div className="flex-1 px-[24px] pt-[24px] pb-[24px] overflow-y-auto flex flex-col">
        {/* Image Container - 327x160px */}
        <div className="w-full max-w-[327px] h-[160px] rounded-lg overflow-hidden">
          <img
            src={imgCoAppingBanker}
            alt="Banker assistance"
            className="w-full h-full object-cover"
          />
        </div>

        {/* 24px gap între poză și texte */}
        <div className="pt-[24px] flex flex-col gap-[16px]">
          <p className="font-['UniCredit',sans-serif] text-[16px] text-[#000] leading-relaxed">
            {t('coApping.coAppingDescription')}
          </p>
          
          <p className="font-['UniCredit',sans-serif] text-[16px] text-[#000] leading-relaxed">
            {t('coApping.coAppingInstruction')}
          </p>
        </div>

        {/* Input Field - 24px gap */}
        <div className="pt-[24px]">
          <TextField
            label={t('coApping.coAppingCodePlaceholder')}
            value={code}
            onChange={setCode}
            helperText={t('coApping.coAppingPrivacy')}
          />
        </div>

        {/* Continue Button - pushed to bottom */}
        <div className="mt-auto pt-[24px]">
          <PrimaryButton
            onClick={handleContinue}
            disabled={!code.trim()}
          >
            {t('coApping.continue')}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}