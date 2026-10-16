/**
 * GdprConsentCard Component
 * Card for GDPR Consent section in More menu
 */

import { MoreCardShell } from "./MoreCardShell";

import { MORE_CARD_IMAGE_BY_TYPE } from "@/app/config/moreCardAssets";

interface GdprConsentCardProps {
  onClick: () => void;
  title?: string;
}

export function GdprConsentCard({ onClick, title = "GDPR Consent" }: GdprConsentCardProps) {
  return <MoreCardShell variant="gdpr-consent" title={title} onClick={onClick} artwork={<>
{/* Image - specific positioning from Figma - two overlapping user icons */}
      <div 
        className="absolute bottom-[-35.83%] left-[38.66%] right-[-0.24%] top-1/2"
        style={{ 
          backgroundImage: `url('${MORE_CARD_IMAGE_BY_TYPE["gdpr-consent"]}')`,
          backgroundSize: '61.60000091791153px 62.90000093728304px',
          backgroundPosition: 'top left',
          filter: "var(--pi-menu-card-image-filter, none)",
          opacity: "var(--pi-menu-card-image-opacity, 1)",
        }}
      />
</>}/>;
}
