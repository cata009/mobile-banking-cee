/**
 * Small 64×40 card art used as the leading visual of a NavigationRow
 * (Design System "Navigation row / Special / Card" variant).
 *
 * This is the canonical card thumbnail — reuse it anywhere a card-art
 * leading visual is needed instead of re-implementing the artwork.
 */
export default function NavigationCardArt() {
  return (
    <span
      className="relative block h-[40px] w-[64px] shrink-0 overflow-hidden rounded-[4px] bg-[var(--uc-neutral-100)] shadow-[0_1px_1px_rgba(0,0,0,0.25)]"
      aria-hidden="true"
    >
      <span className="absolute left-[-7px] top-[-2px] h-[48px] w-[28px] skew-x-[-14deg] bg-[var(--uc-red-main)]" />
      <span className="absolute left-[20px] top-[5px] text-[4px] font-bold leading-none text-[var(--uc-text)]">UniCredit</span>
      <span className="absolute bottom-[9px] right-[8px] size-[10px] rounded-full bg-[var(--uc-orange-main)]" />
      <span className="absolute bottom-[9px] right-[14px] size-[10px] rounded-full bg-[var(--uc-red-main)] opacity-90" />
    </span>
  );
}
