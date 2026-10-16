/**
 * ContactsCard Component
 * Card for Contacts section in More menu
 */

import { MoreCardShell } from "./MoreCardShell";

import { MORE_CARD_IMAGE_BY_TYPE } from "@/app/config/moreCardAssets";

interface ContactsCardProps {
  onClick: () => void;
  title?: string;
}

export function ContactsCard({ onClick, title = "Contacts" }: ContactsCardProps) {
  return <MoreCardShell variant="contacts" title={title} onClick={onClick} artwork={<>
{/* Image - specific positioning from Figma */}
      <div className="absolute inset-[36.67%_-2.62%_0_52.69%]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img 
            alt="" 
            className="absolute left-0 max-w-none size-full top-0" 
            decoding="async"
            loading="eager"
            src={MORE_CARD_IMAGE_BY_TYPE.contacts}
            style={{
              filter: "var(--pi-menu-card-image-filter, none)",
              opacity: "var(--pi-menu-card-image-opacity, 1)",
            }}
          />
        </div>
      </div>
</>}/>;
}
