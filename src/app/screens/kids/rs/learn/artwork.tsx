/**
 * RS Teens "Uči" artwork registry — maps the five Serbian modules to the
 * existing transparent Learn PNG illustrations so the Learn surface carries
 * real artwork (like HU) instead of bare icon tiles.
 *
 * Reuses the shared HU illustration set (imported by path) — no new assets.
 * Slots use the same rounded-corner treatment as HU's learnArtwork.
 */
import moneyBasicsSrc from "@/assets/kids/learn/money-basics.png";
import savingGoalsSrc from "@/assets/kids/learn/saving-goals.png";
import onlineSafetySrc from "@/assets/kids/learn/online-safety.png";
import cardConfidenceSrc from "@/assets/kids/learn/card-confidence.png";
import requestMoneySrc from "@/assets/kids/learn/request-money.png";

/** Map a Serbian module id to its hero illustration. */
export const RS_LEARN_MODULE_ART: Record<string, string> = {
  "mod-budget": moneyBasicsSrc,
  "mod-save": savingGoalsSrc,
  "mod-safety": onlineSafetySrc,
  "mod-goals": cardConfidenceSrc,
  "mod-value": requestMoneySrc,
};

/** Inline rounded illustration tile used in the Learn index. */
export function LearnArtTile({ moduleId, alt }: { moduleId: string; alt: string }) {
  const src = RS_LEARN_MODULE_ART[moduleId];
  if (!src) return null;
  return (
    <img
      src={src}
      alt={alt}
      className="pointer-events-none absolute right-[8px] top-1/2 h-[56px] w-[60px] -translate-y-1/2 object-contain"
      style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.12))" }}
    />
  );
}
