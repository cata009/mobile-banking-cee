import { useState, useEffect } from 'react';
import svgPaths from '@/imports/svg-2hn0mpby87';

export type PhoneChromeVariant = 'light' | 'dark' | 'theme';

interface StatusBarProps {
  variant?: PhoneChromeVariant; // light = text negru, dark = text alb, theme = controlled by phone theme CSS vars
  isCoAppingActive?: boolean;
}

function getStatusBarForeground(variant: PhoneChromeVariant) {
  if (variant === 'theme') {
    return 'var(--uc-phone-status-fg, var(--uc-text))';
  }

  return variant === 'light' ? 'var(--uc-text)' : 'var(--uc-static-white)';
}

function Time({ variant }: { variant: PhoneChromeVariant }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const textColor = getStatusBarForeground(variant);

  return (
    <div className="content-stretch flex flex-[1_0_0] h-[22px] items-center justify-center min-h-px min-w-px pt-[1.5px] relative" data-name="Time">
      <p 
        className="font-['SF_Pro:Semibold',sans-serif] font-[590] leading-[22px] relative shrink-0 text-[17px] text-center"
        style={{ color: textColor, fontVariationSettings: "'wdth' 100" }}
      >
        {formatTime(currentTime)}
      </p>
    </div>
  );
}

function Frame({ variant }: { variant: PhoneChromeVariant }) {
  const fillColor = getStatusBarForeground(variant);
  const strokeColor = getStatusBarForeground(variant);

  return (
    <div className="h-[13px] relative shrink-0 w-[27.328px]" data-name="Frame">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27.328 13">
        <g id="Frame">
          <rect height="12" id="Border" opacity="0.35" rx="3.8" stroke={strokeColor} width="24" x="0.5" y="0.5" />
          <path d={svgPaths.p7a14d80} fill={fillColor} id="Cap" opacity="0.4" />
          <rect fill={fillColor} height="9" id="Capacity" rx="2.5" width="21" x="2" y="2" />
        </g>
      </svg>
    </div>
  );
}

function Levels({ variant }: { variant: PhoneChromeVariant }) {
  const fillColor = getStatusBarForeground(variant);

  return (
    <div className="flex-[1_0_0] h-[22px] min-h-px min-w-px relative" data-name="Levels">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex gap-[7px] items-center justify-center pr-px pt-px relative size-full">
          <div className="h-[12.226px] relative shrink-0 w-[19.2px]" data-name="Cellular Connection">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.2 12.2264">
              <path clipRule="evenodd" d={svgPaths.p1e09e400} fill={fillColor} fillRule="evenodd" id="Cellular Connection" />
            </svg>
          </div>
          <div className="h-[12.328px] relative shrink-0 w-[17.142px]" data-name="Wifi">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.1417 12.3283">
              <path clipRule="evenodd" d={svgPaths.p18b35300} fill={fillColor} fillRule="evenodd" id="Wifi" />
            </svg>
          </div>
          <Frame variant={variant} />
        </div>
      </div>
    </div>
  );
}

export default function StatusBar({ variant = 'dark' }: StatusBarProps) {
  return (
    <div className="absolute top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="content-stretch flex gap-[154px] items-center justify-center pb-[19px] pt-[21px] px-[24px] relative w-full" data-name="Status bar - iPhone">
        <Time variant={variant} />
        <Levels variant={variant} />
      </div>
    </div>
  );
}
