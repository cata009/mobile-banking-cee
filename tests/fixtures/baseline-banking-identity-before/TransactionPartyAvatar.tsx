import { getPartyInitials, partyTint } from "@/features/accounts-payments/partyIdentity";
export { getPartyInitials, partyTint } from "@/features/accounts-payments/partyIdentity";

/** Bare arrow or plus for the corner badge — the badge itself supplies the disc. */
function DirectionGlyph({ direction, size }: { direction: "in" | "out"; size: number }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 12 12" width={size} height={size} fill="none">
      {direction === "in" ? (
        <path d="M6 1.5v9M1.5 6h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      ) : (
        <>
          <path d="M2 6h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M6.6 2.6 10 6l-3.4 3.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </svg>
  );
}

interface TransactionPartyAvatarProps {
  /** Counterparty name as it appears on the row. */
  name: string;
  /** `out` marks money leaving, `in` marks money arriving. */
  direction: "in" | "out";
  size?: number;
}

/**
 * The counterparty mark for a payment with no brand behind it: a person, an
 * employer, a landlord, an institution. Initials carry the identity and the
 * corner badge carries the direction — an arrow for money sent, a plus for
 * money received.
 */
export default function TransactionPartyAvatar({ name, direction, size = 32 }: TransactionPartyAvatarProps) {
  const initials = getPartyInitials(name);
  const badgeSize = Math.round(size * 0.44);
  const glyphSize = Math.round(badgeSize * 0.66);

  return (
    <span
      aria-label={`${name}, ${direction === "in" ? "incoming payment" : "outgoing payment"}`}
      className="relative inline-flex shrink-0 items-center justify-center"
      data-transaction-party={direction}
      role="img"
      style={{ width: size, height: size }}
    >
      <span
        aria-hidden="true"
        className="grid size-full place-items-center rounded-full font-bold leading-none tracking-[0.01em] text-[var(--uc-static-white)]"
        style={{ backgroundColor: partyTint(name), fontSize: Math.round(size * 0.36) }}
      >
        {initials}
      </span>
      {/* The badge inverts against the page: a dark disc with a light glyph in
          light mode, a light disc with a dark glyph in dark mode. The ring is
          the surface colour, so the badge stays legible over the tinted
          roundel underneath it as well as over the page behind it. */}
      <span
        aria-hidden="true"
        className="absolute grid place-items-center rounded-full bg-[var(--uc-text)] text-[var(--uc-surface)] shadow-[0_0_0_2px_var(--uc-surface)]"
        style={{ width: badgeSize, height: badgeSize, right: -1, bottom: -1 }}
      >
        <DirectionGlyph direction={direction} size={glyphSize} />
      </span>
    </span>
  );
}
