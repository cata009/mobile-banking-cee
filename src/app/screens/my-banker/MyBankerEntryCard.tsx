import { useMemo } from "react";

import { AppIcon } from "@/app/components/icons";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { useProducts } from "@/hooks/useProducts";
import { useDemo } from "@/app/state/demoStore";
import { MY_BANKER_CLIENTS, MY_BANKER_PEERS, MY_BANKER_RM } from "@/data/myBankerCore";
import MyBankerPeerStrip from "@/app/screens/my-banker/MyBankerPeerStrip";
import { analyzeMyBanker } from "@/app/screens/my-banker/myBankerState";

interface MyBankerEntryCardProps {
  onClick: () => void;
}

/**
 * Entry into My Banker, carrying the one finding that makes the screen worth
 * opening: the product most clients in the same age and income range use, with
 * the peer group drawn underneath. The analysis is the same pure function the
 * screen runs, so the entry can never promise something the screen contradicts.
 */
export default function MyBankerEntryCard({ onClick }: MyBankerEntryCardProps) {
  const { t } = useLanguage();
  const { bankingScenario } = useDemo();
  const { categories } = useProducts();

  const heldProducts = useMemo(() => categories.flatMap((category) => category.products), [categories]);
  const analysis = useMemo(
    () =>
      analyzeMyBanker({
        client:
          bankingScenario === "retail-prospect" ? MY_BANKER_CLIENTS.prospect : MY_BANKER_CLIENTS.established,
        peers: MY_BANKER_PEERS,
        heldProducts,
        today: new Date(),
      }),
    [bankingScenario, heldProducts],
  );

  const ready = analysis.state === "ready" ? analysis : null;
  const recommended = ready?.recommendations.filter((row) => row.status === "recommended") ?? [];
  const lead = recommended.find((row) => (row.adoptionPercent ?? 0) > 0) ?? null;
  const peerGroupSize = ready?.peerGroup.size ?? 0;

  const headline =
    lead && lead.peersUsing !== null && ready?.peerGroup.isPublishable
      ? t("runtime.myBanker.entry.insight", "{used} of {total} clients like you use {product}")
          .replace("{used}", String(lead.peersUsing))
          .replace("{total}", String(peerGroupSize))
          .replace("{product}", t(`runtime.myBanker.products.${lead.product.key}.name`, lead.product.key))
      : t("runtime.myBanker.entry.body", "See which products clients like you actually use.");

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={t("runtime.myBanker.entry.action", "Open My Banker")}
      className="w-full rounded-[8px] bg-[var(--uc-surface)] p-[16px] text-left shadow-[0_1px_2px_rgb(var(--uc-shadow-rgb)_/_0.08)]"
      data-ds-label="My Banker entry card"
    >
      <span className="flex items-center gap-[10px]">
        <span className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--uc-action)_12%,var(--uc-surface))]">
          <AppIcon name="user-round" size={18} color="var(--uc-action)" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block uc-type-n4-strong text-[var(--uc-text)]">
            {t("runtime.myBanker.entry.title", "My Banker")}
          </span>
          <span className="block truncate uc-type-n5 text-[var(--uc-text-muted)]">
            {MY_BANKER_RM.name} · {t("runtime.myBanker.banner.advisorRole", "Your relationship manager")}
          </span>
        </span>
        <span className="shrink-0" aria-hidden="true">
          <AppIcon name="chevron-right" size={16} color="var(--uc-text)" />
        </span>
      </span>

      <span className="mt-[14px] block h-px bg-[var(--uc-border-muted)]" />

      <span className="mt-[14px] block uc-type-n4-strong text-[var(--uc-text)]">{headline}</span>

      {lead && lead.peersUsing !== null && peerGroupSize > 0 && (
        <span className="mt-[10px] block">
          <MyBankerPeerStrip
            used={lead.peersUsing}
            total={peerGroupSize}
            size="md"
            label={t("runtime.myBanker.card.peersUsing", "{used} of {total}")
              .replace("{used}", String(lead.peersUsing))
              .replace("{total}", String(peerGroupSize))}
          />
        </span>
      )}

      {recommended.length > 0 && (
        <span className="mt-[12px] block uc-type-n5-strong text-[var(--uc-action)]">
          {t("runtime.myBanker.entry.seeAll", "See all recommendations")}
        </span>
      )}
    </button>
  );
}
