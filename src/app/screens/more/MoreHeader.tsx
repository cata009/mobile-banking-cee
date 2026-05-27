/**
 * MoreHeader Component
 * Header for More section with title and action icons
 */

interface MoreHeaderProps {
  onProfile: () => void;
  onMessages: () => void;
  onLogout: () => void;
  messageCount?: number;
}

export function MoreHeader({ onProfile, onMessages, onLogout, messageCount = 0 }: MoreHeaderProps) {
  return (
    <div className="w-full bg-white">
      {/* Single row with title and icons - no extra spacing */}
      <div className="px-[24px] pb-[24px]">
        <div className="flex items-start gap-[8px]">
          {/* Title */}
          <h1 
            className="flex-1 font-['UniCredit:Bold',sans-serif] text-[#262626] min-w-0"
            style={{
              fontSize: '28px',
              fontStyle: 'normal',
              fontWeight: 700,
              lineHeight: 'normal'
            }}
          >
            More
          </h1>

          {/* Action Icons */}
          <div className="flex gap-[8px] items-end shrink-0">
            {/* Profile Icon - same as HomeHeader */}
            <button
              onClick={onProfile}
              className="relative size-[32px] cursor-pointer"
              aria-label="Profile"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 m-auto">
                <path fillRule="evenodd" clipRule="evenodd" d="M10 20C15.5229 20 20 15.5229 20 10C20 4.47715 15.5229 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5229 4.47715 20 10 20ZM9.95831 5C11.2528 5 12.3021 6.04938 12.3021 7.34375C12.3021 8.63812 11.2528 9.6875 9.95831 9.6875C8.664 9.6875 7.61456 8.63812 7.61456 7.34375C7.61456 6.04938 8.664 5 9.95831 5ZM15 15H5.625C5.66906 12.7459 7.50719 10.9409 9.76188 10.9375H15V15Z" fill="#262626"/>
              </svg>
            </button>

            {/* Messages Icon - same as HomeHeader */}
            <button
              onClick={onMessages}
              className="relative size-[32px] cursor-pointer"
              aria-label="Messages"
            >
              {/* Message Icon */}
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="block size-full">
                <path fillRule="evenodd" clipRule="evenodd" d="M6 10.67V9.5H26V10.67L16 17.5413L6 10.67ZM6 12.3381L16 19.2094L26 12.3387V18.6669C26 20.5075 24.5075 22 22.6669 22H6V12.3381Z" fill="#262626"/>
              </svg>

              {/* Red Badge with Count */}
              {messageCount > 0 && (
                <div className="absolute right-0 top-0 size-[20px]">
                  <svg 
                    className="block size-full" 
                    viewBox="0 0 20 20" 
                    fill="none"
                  >
                    <circle cx="10" cy="10" r="10" fill="#E2001A" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="font-['UniCredit:Bold',sans-serif] text-[14px] text-white leading-[0] tracking-[0.35px]">
                      {messageCount > 99 ? '99+' : messageCount}
                    </p>
                  </div>
                </div>
              )}
            </button>

            {/* Logout Icon - Native SVG from user */}
            <button
              onClick={onLogout}
              className="relative size-[32px] cursor-pointer"
              aria-label="Logout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="19" viewBox="0 0 20 19" fill="none" className="absolute inset-0 m-auto">
                <path fillRule="evenodd" clipRule="evenodd" d="M5.62504 9.0625C5.62504 9.92562 6.32444 10.625 7.18756 10.625C8.05069 10.625 8.75006 9.92562 8.75006 9.0625C8.75006 8.19938 8.05069 7.5 7.18756 7.5C6.32444 7.5 5.62504 8.19938 5.62504 9.0625ZM0 0H8.12506C9.16069 0 10.0001 0.839375 10.0001 1.875V18.125H1.87501C0.839381 18.125 0 17.2856 0 16.25V0ZM15.1887 6.65675C14.5243 5.99237 14.5243 4.91488 15.1887 4.25112L20 9.06238L15.1887 13.8736C14.5243 13.2099 14.5243 12.1324 15.1887 11.4686L16.7437 9.91362H10.6249V8.21175H16.7437L15.1887 6.65675Z" fill="#262626"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}