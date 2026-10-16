/**
 * MyRequestsCard Component
 * Card for My Requests section in More menu
 */

import { MoreCardShell } from "./MoreCardShell";

import { MORE_CARD_IMAGE_BY_TYPE } from "@/app/config/moreCardAssets";

interface MyRequestsCardProps {
  onClick: () => void;
  title?: string;
}

export function MyRequestsCard({ onClick, title = "My applications" }: MyRequestsCardProps) {
  return <MoreCardShell variant="my-requests" title={title} onClick={onClick} artwork={<>
{/* Image - specific positioning from Figma */}
      <div className="absolute inset-[37.22%_0_-6.36%_29.88%]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img 
            alt="" 
            className="absolute left-0 max-w-none size-full top-0" 
            decoding="async"
            loading="eager"
            src={MORE_CARD_IMAGE_BY_TYPE["my-requests"]}
            style={{
              filter: "var(--pi-menu-card-image-filter, none)",
              opacity: "var(--pi-menu-card-image-opacity, 1)",
            }}
          />
        </div>
      </div>
</>}/>;
}
