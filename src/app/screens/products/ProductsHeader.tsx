import type { ReactNode } from "react";
import { HeaderActionButton, HeaderActionRail } from "@/app/components/HeaderActionIcons";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { useCountry } from "@/app/state/demoStore";

/**
 * The Products L1 header: page title on the left, servicing icons on the right.
 * It lives in its own module because the Evo 2027 shelf renders it too, and
 * importing it back from the screen that mounts the shelf would be a cycle.
 */
export function ProductsHeader({
  title,
  onContactsClick,
  onMessagesClick,
  actions,
  gutterClassName = "px-[24px]",
}: {
  title: string;
  onContactsClick?: () => void;
  onMessagesClick?: () => void;
  /** Replaces the servicing rail entirely — the shelf carries search alone. */
  actions?: ReactNode;
  /** Left edge of the title, matched to the gutter the page's own content uses. */
  gutterClassName?: string;
}) {
  const country = useCountry();
  const { t } = useLanguage();
  const usesBosniaHeaderActions = country === "BA" || country === "BA_BL";
  const handleAction = (_action: string) => {
  };

  return (
    <div className="w-full bg-[var(--uc-app-bg)]">
      <div className={`${gutterClassName} pb-[22px]`}>
        <div className="flex min-h-[32px] items-start gap-[8px]">
          <h1
            className="uc-type-n1 flex-1 min-w-0 text-[var(--uc-text)]"
            style={{ fontSize: "28px", lineHeight: "36px" }}
          >
            {title}
          </h1>
          <HeaderActionRail>
            {actions ?? (
              <>
                {usesBosniaHeaderActions ? (
                  <HeaderActionButton icon="contact-phone" label="Contact phone" onClick={onContactsClick} />
                ) : (
                  <HeaderActionButton icon="profile" label={t("runtime.actions.profile", "Profile")} onClick={() => handleAction("profile")} />
                )}
                <HeaderActionButton icon="messages" label={t("runtime.actions.messages", "Messages")} onClick={onMessagesClick} />
                {usesBosniaHeaderActions ? null : (
                  <HeaderActionButton icon="help" label={t("runtime.actions.help", "Help")} onClick={() => handleAction("help")} />
                )}
              </>
            )}
          </HeaderActionRail>
        </div>
      </div>
    </div>
  );
}

export default ProductsHeader;
