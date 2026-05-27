import { AppIcon, type IconName } from "@/app/components/icons";

type ContactsNavigationIcon = "prime" | "location" | "time" | "phone" | "block" | "email" | "website" | "youtube" | "x";

interface ContactsNavigationCardProps {
  icon: ContactsNavigationIcon;
  title: string;
  value?: string;
  subtitle?: string;
  hasChevron?: boolean;
  onClick: () => void;
}

const CONTACT_ICON_NAME: Record<ContactsNavigationIcon, IconName> = {
  prime: "contact-prime",
  location: "contact-location",
  time: "contact-time",
  phone: "contact-phone",
  block: "contact-block",
  email: "contact-email",
  website: "contact-website",
  youtube: "contact-youtube",
  x: "contact-x",
};

export function ContactsNavigationCard({
  icon,
  title,
  value,
  subtitle,
  hasChevron = false,
  onClick,
}: ContactsNavigationCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex h-[80px] w-full cursor-pointer items-center gap-[16px] bg-[var(--uc-surface)] px-0 py-[24px]"
      type="button"
    >
      <AppIcon name={CONTACT_ICON_NAME[icon]} color="var(--uc-text)" />

      <div className="flex min-w-0 flex-1 flex-col items-start justify-center gap-[4px]">
        <p className="w-full text-left font-['UniCredit:Bold',sans-serif] text-[16px] leading-normal text-[var(--uc-text)]">
          {title}
        </p>

        {subtitle ? (
          <p className="w-full text-left font-['UniCredit:Regular',sans-serif] text-[16px] leading-normal text-[var(--uc-text)]">
            {subtitle}
          </p>
        ) : null}

        {value ? (
          <p className="text-left font-['UniCredit:Bold',sans-serif] text-[14px] leading-normal text-[var(--uc-action)]">
            {value}
          </p>
        ) : null}
      </div>

      {hasChevron ? (
        <div className="flex size-[32px] shrink-0 items-center justify-center">
          <AppIcon name="contact-chevron" color="var(--uc-text)" />
        </div>
      ) : null}
    </button>
  );
}
