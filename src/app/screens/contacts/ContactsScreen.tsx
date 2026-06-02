/**
 * ContactsScreen Component
 * Contact information screen with bank contacts and social media
 */

import PageHeader from '@/app/components/PageHeader';
import { HeaderActionIcon } from '@/app/components/HeaderActionIcons';
import { AppIcon } from "@/app/components/icons";
import { useLanguage } from '@/app/contexts/LanguageContext';
import { ContactsDivider } from './ContactsDivider';
import { ContactsNavigationCard } from './ContactsNavigationCard';
import imgUniCreditBuilding from "figma:asset/98dd23c242155a923a78eda01f9320afee4330eb.png";

interface ContactsScreenProps {
  onBack: () => void;
  onPrimeClick?: () => void;
}

export default function ContactsScreen({ onBack, onPrimeClick }: ContactsScreenProps) {
  const { t } = useLanguage();
  const handleCardClick = (cardName: string) => {
    console.log(`📞 ${cardName} clicked`);
    // Future: navigate to respective screen
  };

  const handleHelpClick = () => {
    console.log('❓ Help clicked from Contacts');
    // Future: open help/FAQ
  };

  return (
    <div className="w-full h-full relative flex flex-col bg-[var(--uc-surface)]">
      {/* Status Bar Space */}
      <div className="h-[54px] flex-shrink-0 bg-[var(--uc-surface)]" />

      {/* Sticky Back & Help Buttons - OUTSIDE scrollable area */}
      <div className="sticky top-0 z-10 bg-[var(--uc-surface)] flex items-center justify-between h-[48px] pt-[8px] flex-shrink-0">
        {/* Back button - 8px de la stânga */}
        <button
          onClick={onBack}
          className="ml-[8px] flex items-center justify-center cursor-pointer"
          style={{
            width: '40px',
            height: '40px',
            padding: '8px 7.998px 7.997px 7.998px'
          }}
          aria-label={t("runtime.actions.back", "Back")}
        >
          <AppIcon name="back-heavy" className="shrink-0" color="var(--uc-text)" />
        </button>

        {/* Help button - 8px de la dreapta */}
        <button
          onClick={handleHelpClick}
          className="mr-[8px] flex items-center justify-center cursor-pointer"
          style={{
            width: '40px',
            height: '40px',
            padding: '8px 7.998px 7.997px 7.998px'
          }}
          aria-label={t("runtime.actions.help", "Help")}
        >
          <HeaderActionIcon icon="help" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* Title - scrollable */}
        <div 
          className="flex items-center"
          style={{
            width: '375px',
            padding: '8px 16px'
          }}
        >
          <h1 
            className="font-['UniCredit',sans-serif] text-[var(--uc-text)]"
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
            {t("runtime.contacts.title", "Contact us")}
          </h1>
        </div>

        <div className="flex flex-col gap-[24px] px-[24px] pt-[8px] pb-[24px]">
          {/* UniCredit Building Image */}
          <div className="w-full h-[160px] rounded-[8px] overflow-hidden">
            <img 
              src={imgUniCreditBuilding} 
              alt="UniCredit Building" 
              className="w-full h-full object-cover"
            />
          </div>

          {/* BANK CONTACTS Section */}
          <div className="flex flex-col">
            <ContactsDivider text={t("runtime.contacts.sections.bankContacts", "BANK CONTACTS")} />
            
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
            <ContactsDivider text={t("runtime.contacts.sections.socialMedia", "SOCIAL MEDIA")} />
            
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
    </div>
  );
}
