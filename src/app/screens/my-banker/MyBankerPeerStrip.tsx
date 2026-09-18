/**
 * The comparison group drawn one dot per client.
 *
 * It turns "63% of similar clients" from a claim into something countable:
 * fifteen filled dots out of twenty-four is a fact the client can check at a
 * glance. The same strip is used on the product cards and on the entry module,
 * so the peer group reads as one idea across the feature.
 */
interface MyBankerPeerStripProps {
  used: number;
  total: number;
  /** Screen-reader text, e.g. "15 of 24". */
  label: string;
  size?: "sm" | "md";
}

export default function MyBankerPeerStrip({ used, total, label, size = "sm" }: MyBankerPeerStripProps) {
  const dot = size === "md" ? "h-[8px] w-[8px]" : "h-[6px] w-[6px]";

  return (
    <span className="flex flex-wrap items-center gap-[3px]" role="img" aria-label={label}>
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={`block rounded-full ${dot} ${
            index < used ? "bg-[var(--uc-action)]" : "bg-[var(--uc-border-muted)]"
          }`}
        />
      ))}
    </span>
  );
}
