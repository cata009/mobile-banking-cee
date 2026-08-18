import { forwardRef, type CSSProperties, type ReactNode } from "react";
import DynamicIsland from "@/app/components/DynamicIsland";
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
  /**
   * Wraps the screen in the same device bezel the Demo area uses — black shell,
   * 48px corner, Dynamic Island — so a prototype reads as a phone rather than a
   * floating card. Filmstrip and export previews keep the plain surface.
   */
  device?: boolean;
  className?: string;
}

/** Bezel thickness, matching the Demo frame's `p-3`. */
const BEZEL = 12;

const MiniPhone = forwardRef<HTMLDivElement, MiniPhoneProps>(function MiniPhone(
  { children, scale = 0.62, statusBarVariant = "light", topReserve = 44, scrollable = false, device = false, className },
  ref,
) {
  const frameStyle = {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    transform: device ? undefined : `scale(${scale})`,
    transformOrigin: "top left",
    "--uc-phone-top-reserve": `${topReserve}px`,
  } as CSSProperties;

  const screen = (
    <div
      ref={ref}
      data-flow-screen-capture="true"
      className={
        device
          ? "relative overflow-hidden bg-[var(--uc-surface)]"
          : "relative overflow-hidden rounded-[12px] bg-[var(--uc-surface)] shadow-[0_16px_32px_rgb(var(--uc-shadow-rgb)_/_0.10),0_3px_10px_rgb(var(--uc-shadow-rgb)_/_0.06)]"
      }
      style={device ? { ...frameStyle, borderRadius: 36 } : frameStyle}
    >
      <StatusBar variant={statusBarVariant} />
      {device ? <DynamicIsland variant="light" /> : null}
      <div className="h-full w-full overflow-hidden">{children}</div>
    </div>
  );

  const outerWidth = (device ? SCREEN_WIDTH + BEZEL * 2 : SCREEN_WIDTH) * scale;
  const outerHeight = (device ? SCREEN_HEIGHT + BEZEL * 2 : SCREEN_HEIGHT) * scale;

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
      // The wrapper clips, so it has to carry the bezel's radius too — otherwise a
      // rectangular clip cuts the phone's rounded corners square.
      // A device frame never scrolls as a whole — the screen inside it does, the
      // way a real phone behaves. Only the plain preview surface scrolls, because
      // there the frame is scaled down and the content can outgrow it.
      className={`relative shrink-0 ${device ? "overflow-hidden rounded-[48px]" : scrollable ? "overflow-x-hidden overflow-y-auto overscroll-contain scrollbar-hide" : "overflow-hidden"} ${className ?? ""}`}
      style={{ width: outerWidth, height: outerHeight, touchAction: scrollable ? "pan-y" : undefined }}
    >
      {device ? (
        <div
          className="relative"
          style={{
            width: SCREEN_WIDTH + BEZEL * 2,
            height: SCREEN_HEIGHT + BEZEL * 2,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 translate-y-8 bg-[rgb(var(--uc-static-black-rgb)_/_0.2)] blur-3xl"
            data-flow-device-shadow="true"
          />
          <div className="relative rounded-[48px] bg-[var(--uc-static-black)] p-3 shadow-2xl">{screen}</div>
        </div>
      ) : (
        screen
      )}
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
