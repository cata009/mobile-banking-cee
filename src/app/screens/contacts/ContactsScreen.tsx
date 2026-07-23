import { useCollapsingHeader } from "@/hooks/useCollapsingHeader";
import PageHeader from '@/app/components/PageHeader';
import SectionHeadingDivider from '@/app/components/SectionHeadingDivider';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { ContactsNavigationCard } from './ContactsNavigationCard';
import imgUniCreditBuilding from "figma:asset/98dd23c242155a923a78eda01f9320afee4330eb.png";

interface ContactsScreenProps {
  onBack: () => void;
  onPrimeClick?: () => void;
}

export default function ContactsScreen({ onBack, onPrimeClick }: ContactsScreenProps) {
  const { t } = useLanguage();
  const { progress: headerProgress, onScroll: handlePageScroll } = useCollapsingHeader(64);

  const handleCardClick = (_cardName: string) => {
    // Future: navigate to respective screen
  };

  const handleHelpClick = () => {
    // Future: open help/FAQ
  };

  return (
    <div
      className="h-full w-full overflow-y-auto bg-[var(--uc-surface)] scrollbar-hide"
      onScroll={handlePageScroll}
    >
      <PageHeader
        title={t("runtime.contacts.title", "Contact us")}
        onBack={onBack}
        onHelpClick={handleHelpClick}
        collapsedTitleProgress={headerProgress}
        includeSafeArea
      />
      <div className="flex flex-col gap-[24px] pt-[8px] pb-[24px]">
          {/* UniCredit Building Image */}
          <div className="mx-[24px] h-[160px] rounded-[8px] overflow-hidden">
            <img 
              src={imgUniCreditBuilding} 
              alt="UniCredit Building" 
              className="w-full h-full object-cover"
            />
          </div>

          {/* BANK CONTACTS Section */}
          <div className="flex flex-col">
            <div className="px-[24px]">
              <SectionHeadingDivider title={t("runtime.contacts.sections.bankContacts", "BANK CONTACTS")} />
            </div>
            
            <div className="flex flex-col mt-[16px]">
              <ContactsNavigationCard
                icon="prime"
                title={t("runtime.contacts.cards.primeAdvisor", "MY PRIME ADVISOR")}
                hasChevron
                onClick={() => onPrimeClick ? onPrimeClick() : handleCardClick('My Prime Advisor')}
              />
              
              <ContactsNavigationCard
                icon="location"
                title={t("runtime.contacts.cards.branchAtmFinder", "BRANCH & ATM FINDER")}
                hasChevron
                onClick={() => handleCardClick('Branch & ATM Finder')}
              />
              
              <ContactsNavigationCard
                icon="time"
                title={t("runtime.contacts.cards.infolineAvailability", "INFOLINE AVAILABILITY")}
                subtitle="Mon - Sun | 07:00 - 22:00"
                onClick={() => handleCardClick('Infoline Availability')}
              />
              
              <ContactsNavigationCard
                icon="phone"
                title={t("runtime.contacts.cards.callUs", "CALL US")}
                value="+420 221 210 031"
                onClick={() => handleCardClick('Call Us')}
              />
              
              <ContactsNavigationCard
                icon="block"
                title={t("runtime.contacts.cards.emergencyLine", "EMERGENCY LINE FOR CARD BLOCKING")}
                value="+420 221 210 012"
                onClick={() => handleCardClick('Emergency Line')}
              />
              
              <ContactsNavigationCard
                icon="email"
                title={t("runtime.contacts.cards.email", "EMAIL")}
                value="INFO@UNICREDITGROUP.RO"
                onClick={() => handleCardClick('Email')}
              />
              
              <ContactsNavigationCard
                icon="website"
                title={t("runtime.contacts.cards.website", "WEBSITE")}
                value="WWW.UNICREDIT.CZ"
                onClick={() => handleCardClick('Website')}
              />
            </div>
          </div>

          {/* SOCIAL MEDIA Section */}
          <div className="flex flex-col">
            <div className="px-[24px]">
              <SectionHeadingDivider title={t("runtime.contacts.sections.socialMedia", "SOCIAL MEDIA")} />
            </div>
            
            <div className="flex flex-col mt-[16px]">
              <ContactsNavigationCard
                icon="youtube"
                title={t("runtime.contacts.cards.youtube", "YOUTUBE")}
                onClick={() => handleCardClick('YouTube')}
              />
              
              <ContactsNavigationCard
                icon="x"
                title="X"
                onClick={() => handleCardClick('X')}
              />
            </div>
          </div>
      </div>
    </div>
  );
}
