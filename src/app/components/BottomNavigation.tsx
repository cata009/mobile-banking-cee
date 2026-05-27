import { useState } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';

type NavItem = 'home' | 'analytics' | 'payments' | 'products' | 'more';

interface BottomNavigationProps {
  activeTab?: NavItem;
  onTabChange?: (tab: NavItem) => void;
}

export default function BottomNavigation({ 
  activeTab: controlledActiveTab, 
  onTabChange 
}: BottomNavigationProps) {
  const { t } = useLanguage();
  const [internalActiveTab, setInternalActiveTab] = useState<NavItem>('home');
  
  // Use controlled state if provided, otherwise use internal state
  const activeTab = controlledActiveTab ?? internalActiveTab;
  
  const handleTabClick = (tab: NavItem) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalActiveTab(tab);
    }
  };

  const isActive = (tab: NavItem) => activeTab === tab;
  const getColor = (tab: NavItem) => isActive(tab) ? '#007A91' : '#666666';

  return (
    <div className="w-[375px] flex items-end gap-[8px] px-[24px] pb-[4px]">
      {/* Home */}
      <button 
        onClick={() => handleTabClick('home')}
        className="flex flex-col items-center gap-0 flex-1 cursor-pointer"
      >
        {/* Active indicator bar */}
        {isActive('home') && (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="2" viewBox="0 0 24 2" fill="none">
            <path d="M0 0H24C24 1.10457 23.1046 2 22 2H2C0.89543 2 0 1.10457 0 0Z" fill="#007A91"/>
          </svg>
        )}
        
        {/* Icon container */}
        <div className="flex flex-col items-center justify-center gap-[4px] pt-[8px]">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="M16.0787 5L7 12.2188V21.441C7 23.959 9.00688 26 11.4829 26H14.0641V20.0938C14.0641 19.3692 14.6417 18.7812 15.3547 18.7812H16.6453C17.3577 18.7812 17.9359 19.3692 17.9359 20.0938V26H20.5171C22.9932 26 25 23.959 25 21.441V12.2188L16.0787 5Z" fill={getColor('home')}/>
          </svg>
          <span 
            className="font-['UniCredit',sans-serif] text-center font-normal"
            style={{ 
              color: getColor('home'),
              fontSize: '14px',
              lineHeight: 'normal'
            }}
          >
            {t('navigation.home')}
          </span>
        </div>
      </button>

      {/* Analytics */}
      <button 
        onClick={() => handleTabClick('analytics')}
        className="flex flex-col items-center gap-0 flex-1 cursor-pointer"
      >
        {/* Active indicator bar */}
        {isActive('analytics') && (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="2" viewBox="0 0 24 2" fill="none">
            <path d="M0 0H24C24 1.10457 23.1046 2 22 2H2C0.89543 2 0 1.10457 0 0Z" fill="#007A91"/>
          </svg>
        )}
        
        {/* Icon container */}
        <div className="flex flex-col items-center justify-center gap-[4px] pt-[8px]">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="M14.8399 17.112V8.27267C9.95559 8.28642 6 12.2489 6 17.1357C6 22.0313 9.96871 26 14.8643 26C19.7605 26 23.7286 22.0313 23.7286 17.1357C23.7286 17.127 23.728 17.1207 23.728 17.112H14.8399ZM17.136 6C17.1285 6 17.1198 6.00125 17.1116 6.00125V14.8399H25.9997C25.9866 9.95621 22.0235 6 17.136 6" fill={getColor('analytics')}/>
          </svg>
          <span 
            className="font-['UniCredit',sans-serif] text-center font-normal"
            style={{ 
              color: getColor('analytics'),
              fontSize: '14px',
              lineHeight: 'normal'
            }}
          >
            {t('navigation.analytics')}
          </span>
        </div>
      </button>

      {/* Payments */}
      <button 
        onClick={() => handleTabClick('payments')}
        className="flex flex-col items-center gap-0 flex-1 cursor-pointer"
      >
        {/* Active indicator bar */}
        {isActive('payments') && (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="2" viewBox="0 0 24 2" fill="none">
            <path d="M0 0H24C24 1.10457 23.1046 2 22 2H2C0.89543 2 0 1.10457 0 0Z" fill="#007A91"/>
          </svg>
        )}
        
        {/* Icon container */}
        <div className="flex flex-col items-center justify-center gap-[4px] pt-[8px]">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="M5.5 10.9999V21.5H22.5623L21.4374 23H4V10.9999H5.5ZM23.5 8L28 14.0001L23.5 20.0001H7.00013V8H23.5ZM17.176 10C16.6343 10.5531 16.6343 11.448 17.176 12L18.4459 13.2933H11L11.0006 14.7072H18.4459L17.176 16C16.6343 16.552 16.6343 17.448 17.176 18L21.1053 14L17.176 10Z" fill={getColor('payments')}/>
          </svg>
          <span 
            className="font-['UniCredit',sans-serif] text-center font-normal"
            style={{ 
              color: getColor('payments'),
              fontSize: '14px',
              lineHeight: 'normal'
            }}
          >
            {t('navigation.payments')}
          </span>
        </div>
      </button>

      {/* Products */}
      <button 
        onClick={() => handleTabClick('products')}
        className="flex flex-col items-center gap-0 flex-1 cursor-pointer"
      >
        {/* Active indicator bar */}
        {isActive('products') && (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="2" viewBox="0 0 24 2" fill="none">
            <path d="M0 0H24C24 1.10457 23.1046 2 22 2H2C0.89543 2 0 1.10457 0 0Z" fill="#007A91"/>
          </svg>
        )}
        
        {/* Icon container */}
        <div className="flex flex-col items-center justify-center gap-[4px] pt-[8px]">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="M17 17H26V22.4C26 24.3882 24.3882 26 22.4 26H17V17ZM21.1415 6L26 15H19.1442C17.4959 15 16.4659 13.2232 17.2901 11.8007L21.1415 6ZM6 21.4996C6.00022 19.0145 8.01495 17 10.5001 17C12.9853 17 14.9999 19.0147 15 21.4998C15.0001 23.985 12.9856 25.9998 10.5005 26C8.01498 26 6.00009 23.9851 6 21.4996ZM9.6 6H15V15H6V9.6C6 7.61178 7.61178 6 9.6 6Z" fill={getColor('products')}/>
          </svg>
          <span 
            className="font-['UniCredit',sans-serif] text-center font-normal"
            style={{ 
              color: getColor('products'),
              fontSize: '14px',
              lineHeight: 'normal'
            }}
          >
            {t('navigation.products')}
          </span>
        </div>
      </button>

      {/* More */}
      <button 
        onClick={() => handleTabClick('more')}
        className="flex flex-col items-center gap-0 flex-1 cursor-pointer"
      >
        {/* Active indicator bar */}
        {isActive('more') && (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="2" viewBox="0 0 24 2" fill="none">
            <path d="M0 0H24C24 1.10457 23.1046 2 22 2H2C0.89543 2 0 1.10457 0 0Z" fill="#007A91"/>
          </svg>
        )}
        
        {/* Icon container */}
        <div className="flex flex-col items-center justify-center gap-[4px] pt-[8px]">
          {/* Container 32x32 pentru aliniament cu celelalte iconițe */}
          <div className="w-[32px] h-[32px] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M10 6.875C9.31 6.875 8.75 6.315 8.75 5.625C8.75 4.935 9.31 4.375 10 4.375C10.69 4.375 11.25 4.935 11.25 5.625C11.25 6.315 10.69 6.875 10 6.875ZM10 11.25C9.31 11.25 8.75 10.69 8.75 10C8.75 9.31 9.31 8.75 10 8.75C10.69 8.75 11.25 9.31 11.25 10C11.25 10.69 10.69 11.25 10 11.25ZM10 15.625C9.31 15.625 8.75 15.065 8.75 14.375C8.75 13.685 9.31 13.125 10 13.125C10.69 13.125 11.25 13.685 11.25 14.375C11.25 15.065 10.69 15.625 10 15.625ZM10 0C4.4775 0 0 4.4775 0 10C0 15.5225 4.4775 20 10 20C15.5225 20 20 15.5225 20 10C20 4.4775 15.5225 0 10 0Z" fill={getColor('more')}/>
            </svg>
          </div>
          <span 
            className="font-['UniCredit',sans-serif] text-center font-normal"
            style={{ 
              color: getColor('more'),
              fontSize: '14px',
              lineHeight: 'normal'
            }}
          >
            {t('navigation.more')}
          </span>
        </div>
      </button>
    </div>
  );
}