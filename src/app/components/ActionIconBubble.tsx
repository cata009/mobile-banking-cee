import { AppIcon, type IconName } from "@/app/components/icons";

/**
 * The 48px neutral roundel with a 24px glyph inside it — the mark the Payments OTHER
 * shortcuts use, and the one the account and card quick-action bars now share so a
 * shortcut looks the same wherever it appears.
 *
 * Themes that recolour the roundel (HU Kids) reach it through the `--pi-shortcut-icon-*`
 * custom properties rather than by overriding the component.
 */
export default function ActionIconBubble({
  iconName,
  iconColor = "var(--pi-shortcut-icon-fg, var(--uc-text))",
  dataDsLabel = "ActionIconBubble",
}: {
  iconName: IconName;
  iconColor?: string;
  dataDsLabel?: string;
}) {
  return (
    <span
      className="grid size-[48px] shrink-0 place-items-center rounded-full"
      data-ds-label={dataDsLabel}
      style={{ background: "var(--pi-shortcut-icon-bg, var(--uc-surface))" }}
    >
      <span className="grid size-[24px] place-items-center">
        <AppIcon name={iconName} color={iconColor} />
      </span>
    </span>
  );
}
