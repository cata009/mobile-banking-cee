/**
 * DigitalActivitiesCard Component
 * Card for Digital Activities Register section in More menu
 */

import { MoreCardShell } from "./MoreCardShell";

import { MORE_CARD_IMAGE_BY_TYPE } from "@/app/config/moreCardAssets";

interface DigitalActivitiesCardProps {
  onClick: () => void;
  title?: string;
}

export function DigitalActivitiesCard({ onClick, title = "Digital activity record" }: DigitalActivitiesCardProps) {
  return <MoreCardShell variant="digital-activities" title={title} onClick={onClick} artwork={<>
{/* Image - specific positioning from Figma */}
      <div className="absolute inset-[56.42%_-46.69%_-46.75%_49.96%]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img 
            alt="" 
            className="absolute left-0 max-w-none size-full top-0" 
            decoding="async"
            loading="eager"
            src={MORE_CARD_IMAGE_BY_TYPE["digital-activities"]}
            style={{
              filter: "var(--pi-menu-card-image-filter, none)",
              opacity: "var(--pi-menu-card-image-opacity, 1)",
            }}
          />
        </div>
      </div>
</>}/>;
}
