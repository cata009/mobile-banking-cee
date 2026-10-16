/**
 * DocumentsCard Component
 * Card for Documents section in More menu
 * Supports badge count for new documents
 */

import { MoreCardShell } from "./MoreCardShell";

import { MORE_CARD_IMAGE_BY_TYPE } from "@/app/config/moreCardAssets";

interface DocumentsCardProps {
  onClick: () => void;
  badgeCount?: number;
  title?: string;
}

export function DocumentsCard({ onClick, badgeCount, title = "Documents" }: DocumentsCardProps) {
  return <MoreCardShell variant="documents" title={title} onClick={onClick} badgeCount={badgeCount} artwork={<>
{/* Image - specific positioning from Figma */}
      <div className="absolute inset-[46.67%_-9.15%_-13.33%_35.98%]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img 
            alt="" 
            className="absolute left-0 max-w-none size-full top-0" 
            decoding="async"
            loading="eager"
            src={MORE_CARD_IMAGE_BY_TYPE.documents}
            style={{
              filter: "var(--pi-menu-card-image-filter, none)",
              opacity: "var(--pi-menu-card-image-opacity, 1)",
            }}
          />
        </div>
      </div>
</>}/>;
}
