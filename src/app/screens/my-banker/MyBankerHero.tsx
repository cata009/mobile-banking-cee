import { AppIcon } from "@/app/components/icons";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { formatAmount } from "@/data/products";
import type { MyBankerBand, MyBankerCoverage, MyBankerPeerGroup } from "@/app/screens/my-banker/myBankerState";

interface MyBankerHeroProps {
  peerGroup: MyBankerPeerGroup;
  coverage: MyBankerCoverage;
  advisorName: string;
}

/**
 * Bands read as real numbers, not band codes — and the two open-ended bands
 * ("under 25", "3,500+") read as phrases rather than a 0 or a blank edge.
 */
function useBandLabel() {
  const { t } = useLanguage();

  return (
    band: MyBankerBand<string>,
    keys: { range: string; from: string; to: string },
    fallback: string,
    /** "under X" reads off the next boundary, not the band's own maximum. */
    underOffset: number,
  ) => {
    const group = (value: number) => formatAmount(value, "RSD").integer;
    if (band.max === null) return t(keys.from, fallback).replace("{from}", group(band.min));
    if (band.min === 0) return t(keys.to, fallback).replace("{to}", group(band.max + underOffset));
    return t(keys.range, fallback).replace("{from}", group(band.min)).replace("{to}", group(band.max));
  };
}

/**
 * The first thing the screen says: where the client stands against the
 * catalogue their peers draw on, who prepared the comparison, and what defines
 * the group. A position is easier to act on than six separate percentages —
 * and the transparency the comparison needs (group size, real ranges) rides
 * along with it instead of sitting in a separate box nobody reads.
 */
export default function MyBankerHero({ peerGroup, coverage, advisorName }: MyBankerHeroProps) {
  const { t } = useLanguage();
  const bandLabel = useBandLabel();

  const ageLabel = bandLabel(
    peerGroup.ageBand,
    {
      range: "runtime.myBanker.banner.ageRange",
      from: "runtime.myBanker.banner.ageFrom",
      to: "runtime.myBanker.banner.ageUnder",
    },
    "{from}–{to} years",
    1,
  );
  const incomeLabel = bandLabel(
    peerGroup.incomeBand,
    {
      range: "runtime.myBanker.banner.incomeRange",
      from: "runtime.myBanker.banner.incomeFrom",
      to: "runtime.myBanker.banner.incomeTo",
    },
    "{from}–{to} EUR / month",
    0,
  );

  const headline = peerGroup.isPublishable
    ? t("runtime.myBanker.hero.title", "You have {held} of {total} products people like you use")
        .replace("{held}", String(coverage.held))
        .replace("{total}", String(coverage.total))
    : t(
        "runtime.myBanker.hero.titleNoInfo",
        "There are not enough clients like you to compare with yet.",
      );

  const chips = peerGroup.isPublishable
    ? [
        t("runtime.myBanker.banner.similarClients", "{count} clients like you").replace(
          "{count}",
          String(peerGroup.size),
        ),
        ageLabel,
        incomeLabel,
      ]
    : [ageLabel, incomeLabel];

  return (
    <section
      className="rounded-[8px] bg-[var(--uc-surface)] p-[16px] shadow-[0_1px_2px_rgb(var(--uc-shadow-rgb)_/_0.08)]"
      data-ds-label="My Banker hero"
    >
      <div className="flex items-center gap-[10px]">
        <span className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--uc-action)_12%,var(--uc-surface))]">
          <AppIcon name="user-round" size={16} color="var(--uc-action)" />
        </span>
        <span className="min-w-0 uc-type-n5 text-[var(--uc-text-muted)]">
          {advisorName} · {t("runtime.myBanker.banner.advisorRole", "Your relationship manager")}
        </span>
      </div>

      <p className="mt-[12px] uc-type-h2 text-[var(--uc-text)]">{headline}</p>

      {/* One segment per catalogue product: filled for what the client holds,
          empty for what similar clients have and they do not. */}
      {peerGroup.isPublishable && (
        <div
          className="mt-[12px] flex gap-[5px]"
          role="img"
          aria-label={headline}
        >
          {coverage.segments.map((segment) => (
            <span
              key={segment.key}
              className={`h-[6px] flex-1 rounded-full ${
                segment.held ? "bg-[var(--uc-action)]" : "bg-[var(--uc-border-muted)]"
              }`}
            />
          ))}
        </div>
      )}

      <div className="mt-[14px] flex flex-wrap gap-[6px]">
        {chips.map((chip) => (
          <span
            key={chip}
            className="rounded-[3.5px] bg-[var(--uc-surface-muted)] px-[8px] py-[3px] uc-type-n5 text-[var(--uc-text)]"
          >
            {chip}
          </span>
        ))}
      </div>

      <p className="mt-[10px] uc-type-n5 text-[var(--uc-text-muted)]">
        {t(
          "runtime.myBanker.banner.body",
          "We compare you only with clients in the same age and income range, and show how many of them use each product.",
        )}
      </p>
    </section>
  );
}
