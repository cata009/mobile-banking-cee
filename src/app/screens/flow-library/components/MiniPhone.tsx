import { forwardRef, type CSSProperties, type ReactNode } from "react";
import StatusBar from "@/app/components/StatusBar";

/**
 * Shared phone frame for Flow Library previews.
 *
 * Renders children at a true 375×812 surface with the REAL StatusBar, then scales
 * the whole frame once (no compounded transforms, no fake "9:41 AM / 100%" row).
 * The 375-wide surface carries `data-flow-screen-capture` and is exposed via ref so
 * the exporter can screenshot it. The frame is inert + aria-hidden: it is a picture
 * of a screen, so its dead controls must not pollute tab order or the a11y tree.
 */

const SCREEN_WIDTH = 375;
const SCREEN_HEIGHT = 812;

export interface MiniPhoneProps {
  children: ReactNode;
  /** Scale applied once to the whole 375×812 frame. */
  scale?: number;
  /** StatusBar foreground: "light" = dark text, "dark" = white text. */
  statusBarVariant?: "light" | "dark";
  /** Top inset reserved for the status bar, exposed to PageHeader via --uc-phone-top-reserve. */
  topReserve?: number;
  /** Lets the active Journey preview receive native vertical scrolling. */
  scrollable?: boolean;
  className?: string;
}

const MiniPhone = forwardRef<HTMLDivElement, MiniPhoneProps>(function MiniPhone(
  { children, scale = 0.62, statusBarVariant = "light", topReserve = 44, scrollable = false, className },
  ref,
) {
  const frameStyle = {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    transform: `scale(${scale})`,
    transformOrigin: "top left",
    "--uc-phone-top-reserve": `${topReserve}px`,
  } as CSSProperties;

  return (
    <div
      // Filmstrip/export previews stay inert; the focused Journey preview keeps the
      // real screen's native vertical scrolling available for review.
      ref={(node) => {
        if (!node) return;
        if (scrollable) node.removeAttribute("inert");
        else node.inert = true;
      }}
      aria-hidden={scrollable ? undefined : true}
      data-flow-preview-scrollable={scrollable ? "true" : undefined}
      className={`relative shrink-0 overflow-hidden ${className ?? ""}`}
      style={{ width: SCREEN_WIDTH * scale, height: SCREEN_HEIGHT * scale, touchAction: scrollable ? "pan-y" : undefined }}
    >
      <div
        ref={ref}
        data-flow-screen-capture="true"
        className="relative overflow-hidden rounded-[12px] bg-[var(--uc-surface)] shadow-[0_16px_32px_rgb(var(--uc-shadow-rgb)_/_0.10),0_3px_10px_rgb(var(--uc-shadow-rgb)_/_0.06)]"
        style={frameStyle}
      >
        <StatusBar variant={statusBarVariant} />
        <div className="h-full w-full overflow-hidden">{children}</div>
      </div>
    </div>
  );
});

export default MiniPhone;

/** Top spacer matching the reserved status-bar inset, for previews that don't use PageHeader. */
export function PreviewSafeTop({ background }: { background?: string }) {
  return (
    <div
      aria-hidden="true"
      style={{ height: "var(--uc-phone-top-reserve, 44px)", background }}
    />
  );
}
