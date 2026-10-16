/**
 * TutorialCard Component
 * Card for Tutorial section in More menu
 */

import { MoreCardShell } from "./MoreCardShell";

import { MORE_CARD_IMAGE_BY_TYPE } from "@/app/config/moreCardAssets";

interface TutorialCardProps {
  onClick: () => void;
  title?: string;
}

export function TutorialCard({ onClick, title = "Tutorials" }: TutorialCardProps) {
  return <MoreCardShell variant="tutorial" title={title} onClick={onClick} artwork={<>
{/* Image - specific positioning from Figma */}
      <div className="absolute inset-[38.33%_0_0_51.83%]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img 
            alt="" 
            className="absolute left-0 max-w-none size-full top-0" 
            decoding="async"
            loading="eager"
            src={MORE_CARD_IMAGE_BY_TYPE.tutorial}
            style={{
              filter: "var(--pi-menu-card-image-filter, none)",
              opacity: "var(--pi-menu-card-image-opacity, 1)",
            }}
          />
        </div>
      </div>
</>}/>;
}
