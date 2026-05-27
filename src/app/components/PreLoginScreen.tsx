import { useLanguage } from "@/app/contexts/LanguageContext";
import { useDemo } from "@/app/state/demoStore";
import { hasProductAccordion, getProductsForCountry } from "@/app/config/productConfig";
import backgroundImage from "figma:asset/8bd60aae39a3561f94f07a9337dc105869df04aa.png";
import UniCreditLogo from "@/app/components/UniCreditLogo";
import LanguageSelectorButton from "@/app/components/ui/LanguageSelectorButton";
import PreLoginHeading from "@/app/components/ui/PreLoginHeading";
import NavigationLink from "@/app/components/ui/NavigationLink";
import PrimaryButton from "@/app/components/ui/PrimaryButton";
import ProductAccordionAnimated from "@/app/components/ProductAccordionAnimated";

interface PreLoginScreenProps {
  onOtherClick: () => void;
  onLanguageClick: () => void;
}

export default function PreLoginScreen({
  onOtherClick,
  onLanguageClick,
}: PreLoginScreenProps) {
  const { t, language, translations } = useLanguage();
  const { country } = useDemo();
  
  // Check if current country has product accordion
  const showProductAccordion = hasProductAccordion(country);
  const products = getProductsForCountry(country);

  // Map products with translations
  const translatedProducts = products.map(product => {
    const productTranslation = translations?.products?.[product.id as keyof typeof translations.products];
    
    if (productTranslation && typeof productTranslation === 'object' && 'title' in productTranslation) {
      return {
        ...product,
        title: productTranslation.title,
        description: productTranslation.description,
      };
    }
    
    return product;
  });

  console.log("🟡 PreLoginScreen rendered");
  console.log("🟡 onOtherClick prop:", onOtherClick);

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
      
      {/* Content Layer */}
      <div className="absolute inset-0 z-20 flex flex-col">
        {/* Header - Logo + Language Selector */}
        <div className="pt-[70px] px-[24px] pb-[10px] flex items-center justify-between">
          <UniCreditLogo className="h-[24px] w-auto" />
          <LanguageSelectorButton onClick={onLanguageClick} language={language} />
        </div>
        
        {/* Main Content - Bottom section with gradient background */}
        <div 
          className={`mt-auto w-full flex flex-col items-start px-[24px] py-[32px] ${showProductAccordion ? 'gap-[24px]' : 'gap-[32px]'}`}
          style={{
            background: 'linear-gradient(180deg, color-mix(in srgb, var(--uc-primary-k1) 0%, transparent) 0%, var(--uc-text) 5.95%)'
          }}
        >
          {/* ======== COUNTRIES WITH PRODUCT ACCORDION ======== */}
          {showProductAccordion ? (
            <ProductAccordionAnimated 
              welcomeText={t('preLogin.welcome')} 
              products={translatedProducts}
              findOutMoreText={t('products.findOutMore')}
            />
          ) : (
            /* ======== OTHER COUNTRIES: Original Layout ======== */
            <div className="flex flex-col gap-[24px] w-full">
              {/* Heading Section - H1, H2, H3 */}
              <PreLoginHeading
                h1={t('preLogin.welcome')}
                h2={t('preLogin.accounts')}
                h3={t('preLogin.openAccountDescription')}
              />
              
              {/* Select Account Link */}
              <NavigationLink 
                text={t('preLogin.selectYourAccount')} 
              />
            </div>
          )}
          
          {/* Activate Application Button */}
          <PrimaryButton text={t('preLogin.activateApplication')} />
          
          {/* Bottom Navigation - 3 links */}
          <div 
            className="flex items-center justify-between w-full"
            onClick={() => console.log("🔴 CONTAINER CLICKED!")}
          >
            <NavigationLink text={t('preLogin.contacts')} onClick={() => console.log("🔵 CONTACTS link clicked")} />
            <NavigationLink text={t('preLogin.mtoken')} onClick={() => console.log("🔵 MTOKEN link clicked")} />
            <NavigationLink text={t('preLogin.other')} onClick={() => {
              console.log("🔵 OTHER link clicked - calling onOtherClick");
              onOtherClick();
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}
