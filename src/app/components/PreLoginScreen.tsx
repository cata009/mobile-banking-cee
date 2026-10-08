import { useLanguage } from "@/app/contexts/LanguageContext";
import { useCountry } from "@/app/state/demoStore";
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
  backgroundImageUrl?: string;
  backgroundPosition?: string;
  backgroundZoom?: number;
  textOverrides?: Readonly<Record<string, string>>;
  previewExpandedProductId?: string;
}

export default function PreLoginScreen({
  onOtherClick,
  onLanguageClick,
  backgroundImageUrl,
  backgroundPosition,
  backgroundZoom = 1,
  textOverrides,
  previewExpandedProductId,
}: PreLoginScreenProps) {
  const { t: translate, language, translations } = useLanguage();
  const t = (key: string) => textOverrides?.[key] ?? translate(key);
  const country = useCountry();
  
  // Check if current country has product accordion
  const showProductAccordion = hasProductAccordion(country);
  const products = getProductsForCountry(country);

  // Map products with translations
  const translatedProducts = products.map(product => {
    const productTranslation = translations?.products?.[product.id as keyof typeof translations.products];
    
    if (productTranslation && typeof productTranslation === 'object' && 'title' in productTranslation) {
      return {
        ...product,
        title: textOverrides?.[`products.${product.id}.title`] ?? productTranslation.title,
        description: textOverrides?.[`products.${product.id}.description`] ?? productTranslation.description,
      };
    }
    
    return { ...product, title: textOverrides?.[`products.${product.id}.title`] ?? product.title, description: textOverrides?.[`products.${product.id}.description`] ?? product.description };
  });


  return (
    <div className="w-full h-full relative bg-[var(--uc-static-black)]" data-prelogin-screen="inactive">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img 
          src={backgroundImageUrl ?? backgroundImage}
          alt="Background" 
          className="w-full h-full object-cover"
          style={{ objectPosition: backgroundPosition, transform: backgroundZoom === 1 ? undefined : `scale(${backgroundZoom})`, transformOrigin: backgroundPosition }}
        />
      </div>
      
      {/* Content Layer */}
      <div className="absolute inset-0 z-20 flex flex-col">
        {/* Header - Logo + Language Selector */}
        <div className="pt-[70px] px-[24px] pb-[10px] flex items-center justify-between">
          <div data-prelogin-brand="true"><UniCreditLogo className="h-[24px] w-auto" /></div>
          <LanguageSelectorButton onClick={onLanguageClick} language={language} />
        </div>
        
        {/* Main Content - Bottom section with gradient background */}
        <div 
          data-prelogin-overlay="bottom"
          className={`mt-auto w-full flex flex-col items-start px-[24px] py-[32px] ${showProductAccordion ? 'gap-[24px]' : 'gap-[32px]'}`}
          style={{
            background: 'linear-gradient(180deg, color-mix(in srgb, var(--uc-static-black) 0%, transparent) 0%, var(--uc-static-black) 5.95%)'
          }}
        >
          {/* ======== COUNTRIES WITH PRODUCT ACCORDION ======== */}
          {showProductAccordion ? (
            <ProductAccordionAnimated 
              expandedProductId={previewExpandedProductId}
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
          >
            <NavigationLink text={t('preLogin.contacts')} onClick={() => {}} />
            <NavigationLink text={t('preLogin.mtoken')} onClick={() => {}} />
            <NavigationLink text={t('preLogin.other')} onClick={() => {
              onOtherClick();
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}
