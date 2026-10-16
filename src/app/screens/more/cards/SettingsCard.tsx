/**
 * SettingsCard Component
 * Card for Settings section in More menu
 */

import { MoreCardShell } from "./MoreCardShell";

import { MORE_CARD_IMAGE_BY_TYPE } from "@/app/config/moreCardAssets";

interface SettingsCardProps {
  onClick: () => void;
  title?: string;
}

export function SettingsCard({ onClick, title = "Settings" }: SettingsCardProps) {
  return <MoreCardShell variant="settings" title={title} onClick={onClick} artwork={<>
{/* Image - specific positioning from Figma */}
      <div className="absolute inset-[47.86%_-30.03%_-29.17%_42.2%]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img 
            alt="" 
            className="absolute left-0 max-w-none size-full top-0" 
            decoding="async"
            loading="eager"
            src={MORE_CARD_IMAGE_BY_TYPE.settings}
            style={{
              filter: "var(--pi-menu-card-image-filter, none)",
              opacity: "var(--pi-menu-card-image-opacity, 1)",
            }}
          />
        </div>
      </div>
</>}/>;
}
