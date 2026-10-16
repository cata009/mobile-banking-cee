/**
 * MoreCardBase Component
 * Base component for More section cards
 * Provides consistent styling and badge support
 */

import { MoreCardShell } from "./MoreCardShell";

interface MoreCardBaseProps {
  title: string;
  image: string;
  onClick: () => void;
  badgeCount?: number;
}

export function MoreCardBase({ title, image, onClick, badgeCount }: MoreCardBaseProps) {
  return <MoreCardShell variant="base" title={title} onClick={onClick} badgeCount={badgeCount} artwork={<>
{/* Image - positioned at bottom right, scaled down */}
      <div className="absolute bottom-0 right-0 w-[50%] h-[50%] flex items-end justify-end overflow-hidden pointer-events-none">
        <img 
          src={image} 
          alt="" 
          className="object-contain object-bottom-right max-w-full max-h-full"
          style={{
            filter: "var(--pi-menu-card-image-filter, none)",
            opacity: "var(--pi-menu-card-image-opacity, 1)",
            transform: 'scale(0.9)',
            transformOrigin: 'bottom right'
          }}
        />
      </div>
</>}/>;
}
