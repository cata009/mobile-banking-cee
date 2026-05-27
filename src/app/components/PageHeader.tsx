interface PageHeaderProps {
  title: string;
  onBack: () => void;
  onHelpClick?: () => void; // Optional callback pentru help button
  variant?: 'light' | 'dark' | 'transparent'; // Dark or transparent variants pentru special screens
  showHelp?: boolean;
  compact?: boolean;
}

export default function PageHeader({
  title,
  onBack,
  onHelpClick,
  variant = 'light',
  showHelp = true,
  compact = false,
}: PageHeaderProps) {
  const iconColor = variant === 'dark' ? 'white' : '#262626';
  const textColor = variant === 'dark' ? 'text-white' : 'text-[#262626]';
  const bgColor = variant === 'dark' || variant === 'transparent' ? 'bg-transparent' : 'bg-white';
  
  return (
    <div className={`w-full ${bgColor}`}>
      {/* Sticky Container cu back button și help button - FIXED LA TOP */}
      <div className={`sticky top-0 z-10 ${bgColor} flex items-center justify-between h-[48px] pt-[8px]`}>
        {/* Back button - 8px de la stânga */}
        <button
          onClick={onBack}
          className="ml-[8px] flex items-center justify-center cursor-pointer"
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
              fill={iconColor}
            />
          </svg>
        </button>

        {/* Help button - 8px de la dreapta */}
        {showHelp ? (
          <button
            onClick={onHelpClick}
            className="mr-[8px] flex items-center justify-center cursor-pointer"
            style={{
              width: '40px',
              height: '40px',
              padding: '8px 7.998px 7.997px 7.998px'
            }}
            aria-label="Help"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 20 20" 
              fill="none"
              style={{
                width: '20px',
                height: '20px',
                flexShrink: 0,
                aspectRatio: '1/1'
              }}
            >
              <path 
                fillRule="evenodd" 
                clipRule="evenodd" 
                d="M13.125 7.03187C13.125 6.99563 13.1175 6.96438 13.1163 6.92875C13.0731 8.0425 12.58 8.92437 11.5631 9.6875L11.195 9.9675C10.7419 10.3181 10.5556 10.5344 10.4544 10.8381V11.0844C10.4544 11.9294 9.84188 12.6175 9.08875 12.6175H8.43625L8.45062 10.9981C8.46875 9.965 8.69063 9.68 9.71313 8.82375L10.1594 8.5C10.8806 7.97937 11.0825 7.50937 11.115 6.98562C11.0813 6.305 10.6894 6.00812 9.8125 6.00812C9.4625 6.00812 9.06312 6.08687 8.65 6.175C8.34062 6.24312 8.04625 6.20312 7.77313 6.05813C7.35687 5.88875 7.05062 5.5425 6.93375 5.09312L6.875 4.8675L8.62438 4.45125C9.04438 4.36188 9.53687 4.31187 9.99875 4.31187C11.9725 4.31187 13.0712 5.24375 13.1163 6.92875C13.1187 6.87562 13.125 6.82438 13.125 6.77V7.03187ZM9.4145 16.25C8.80138 16.25 8.302 15.7475 8.302 15.1306C8.302 14.5131 8.80138 14.0112 9.4145 14.0112C10.0289 14.0112 10.5289 14.5131 10.5289 15.1306C10.5289 15.7475 10.0289 16.25 9.4145 16.25ZM10 0C4.4775 0 0 4.4775 0 10C0 15.5225 4.4775 20 10 20C15.5225 20 20 15.5225 20 10C20 4.4775 15.5225 0 10 0Z" 
                fill={iconColor}
              />
            </svg>
          </button>
        ) : (
          <div className="mr-[8px] h-[40px] w-[40px]" />
        )}
      </div>

      {/* Container cu titlu - SCROLLABLE (not sticky) */}
      <div 
        className="flex items-center"
        style={{
          width: '375px',
          padding: compact ? '0 24px' : '8px 16px'
        }}
      >
        <h1 
          className={`font-['UniCredit',sans-serif] ${textColor}`}
          style={{
            fontSize: compact ? '24px' : '28px',
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
          {title}
        </h1>
      </div>
    </div>
  );
}
