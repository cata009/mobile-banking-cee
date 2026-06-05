import NavigationRow from "@/app/components/NavigationRow";
import type { IconName } from "@/app/components/icons";

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
    <NavigationRow
      title={title}
      description={subtitle}
      linkLabel={value}
      leadingIconName={CONTACT_ICON_NAME[icon]}
      trailingAccessory={hasChevron ? "chevron" : "none"}
      chevronIconName="chevron-link"
      onClick={onClick}
    />
  );
}
