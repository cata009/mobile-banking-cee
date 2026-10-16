/**
 * ThirdPartyConsentCard Component
 * Card for 3rd Party Consent section in More menu
 */

import { MoreCardShell } from "./MoreCardShell";

import { MORE_CARD_IMAGE_BY_TYPE } from "@/app/config/moreCardAssets";

interface ThirdPartyConsentCardProps {
  onClick: () => void;
  title?: string;
}

export function ThirdPartyConsentCard({ onClick, title = "Consent to third parties" }: ThirdPartyConsentCardProps) {
  return <MoreCardShell variant="third-party-consent" title={title} onClick={onClick} artwork={<>
{/* Image - specific positioning from Figma with rotation */}
      <div className="absolute flex inset-[15.28%_-37.87%_-87.03%_14.48%] items-center justify-center">
        <div className="flex-none h-[158.373px] w-[151px]" style={{ transform: 'rotate(-156deg) scaleY(-1)' }}>
          <div className="relative size-full">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img 
                alt="" 
                className="absolute left-0 max-w-none size-full top-0" 
                decoding="async"
                loading="eager"
                src={MORE_CARD_IMAGE_BY_TYPE["third-party-consent"]}
                style={{
                  filter: "var(--pi-menu-card-image-filter, none)",
                  opacity: "var(--pi-menu-card-image-opacity, 1)",
                }}
              />
            </div>
          </div>
        </div>
      </div>
</>}/>;
}
