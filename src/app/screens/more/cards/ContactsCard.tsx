/**
 * ContactsCard Component
 * Card for Contacts section in More menu
 */

import imgContacts from "figma:asset/4d22afc493e4ab72aca4b5793ce68cd204c58b7f.png";

interface ContactsCardProps {
  onClick: () => void;
}

export function ContactsCard({ onClick }: ContactsCardProps) {
  return (
    <button
      onClick={onClick}
      className="relative h-[120px] w-full rounded-[8px] overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#f5f5f5] to-[#ccc]" />

      {/* Image - specific positioning from Figma */}
      <div className="absolute inset-[36.67%_-2.62%_0_52.69%]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img 
            alt="" 
            className="absolute left-0 max-w-none size-full top-0" 
            src={imgContacts}
          />
        </div>
      </div>

      {/* Title - top left padding */}
      <div className="absolute inset-0 p-[16px] flex items-start">
        <p className="font-['UniCredit:Bold',sans-serif] text-[18px] text-black leading-[normal] text-left whitespace-pre-wrap z-10 relative">
          Contacts
        </p>
      </div>
    </button>
  );
}