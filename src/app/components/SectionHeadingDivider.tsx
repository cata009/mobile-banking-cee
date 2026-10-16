import type { SectionHeadingDividerVariant } from "@/app/components/contracts/sectionDivider";
import { sectionDividerWeb } from "@/app/components/contracts/sectionDividerWeb";
export type { SectionHeadingDividerVariant } from "@/app/components/contracts/sectionDivider";

export const SECTION_HEADING_DIVIDER_SOURCE = {
  schema: "codex-figma-component-spec/v1",
  sourceNodeIds: {
    menigaDivider: "1058:22303",
    smallTitleData: "1058:22304",
    smallTwoLineTitleData: "8747:15008",
    mediumTitle: "8747:15016",
    withCounter: "8747:15028",
    mediumTwoLineTitle: "8747:15036",
    largeTitle: "1058:22317",
    largeTwoLineTitle: "1058:22319",
    actionDate: "8747:15049",
    nameAction: "8747:15057",
    actionDateCheckbox: "8747:15065",
    lightTitle: "1517:3674",
    lightDate: "1517:3679",
    lightSmallTitleData: "1517:3683",
  },
  dimensions: {
    defaultWidth: 375,
    lightRestyleWidth: 343,
    lineHeight: 1,
  },
} as const;

interface SectionHeadingDividerProps {
  title: string;
  secondaryText?: string;
  count?: number;
  countAlign?: "inline" | "end";
  variant?: SectionHeadingDividerVariant;
  className?: string;
}

export default function SectionHeadingDivider({
  title,
  secondaryText,
  count,
  countAlign = "inline",
  variant = "section",
  className,
}: SectionHeadingDividerProps) {
  if (variant !== "section") {
    return (
      <MenigaDivider
        title={title}
        secondaryText={secondaryText}
        count={count}
        variant={variant}
        className={className}
      />
    );
  }

  const { alignCountToEnd } = sectionDividerWeb({ countAlign });

  return (
    <div className={className} data-ds-label="SectionHeadingDivider">
      {alignCountToEnd && typeof count === "number" ? (
        <>
          <div className="flex items-center justify-between gap-[8px]">
            <h2 className="uc-type-n5-strong line-clamp-2 uppercase text-[var(--uc-text-muted)]">
              {title}
            </h2>
            <span className="uc-type-n5-strong text-[var(--uc-text-muted)]" aria-label={`${title} count ${count}`}>
              {count}
            </span>
          </div>
          <div className="mt-[8px] h-px w-full bg-[var(--uc-border)]" />
        </>
      ) : (
        <>
          <div className="flex items-center gap-[8px]">
            <h2 className="uc-type-n5-strong line-clamp-2 uppercase text-[var(--uc-text-muted)]">
              {title}
            </h2>
            {typeof count === "number" ? (
              <span className="uc-type-n5-strong text-[var(--uc-text-muted)]" aria-label={`${title} count ${count}`}>
                {count}
              </span>
            ) : null}
          </div>
          <div className="mt-[8px] h-px w-full bg-[var(--uc-border)]" />
        </>
      )}
    </div>
  );
}

function MenigaDivider({
  title,
  secondaryText,
  count,
  variant,
  className,
}: {
  title: string;
  secondaryText?: string;
  count?: number;
  variant: Exclude<SectionHeadingDividerVariant, "section">;
  className?: string;
}) {
  const state = sectionDividerWeb({ variant, count, secondaryText });
  const { light: isLight, large: isLarge, hasLine } = state;
  const line = <div className="h-px w-full bg-[var(--uc-border)]" aria-hidden="true" />;

  if (isLarge) {
    return (
      <div
        className={className}
        data-ds-label="SectionHeadingDivider"
        data-divider-variant={variant}
      >
        <div className="flex w-[375px] items-center bg-[var(--uc-surface)] px-[24px]">
          <h2 className="uc-type-n2-strong whitespace-pre-line text-[20px] leading-none text-[var(--uc-text)]">
            {title}
            {variant === "large-two-line-title" && secondaryText ? (
              <>
                <br />
                {secondaryText}
              </>
            ) : null}
          </h2>
        </div>
      </div>
    );
  }

  if (isLight) {
    const { titleTone, rowHeight } = state;

    return (
      <div
        className={className}
        data-ds-label="SectionHeadingDivider"
        data-divider-variant={variant}
      >
        <div className={`flex w-[343px] flex-col justify-end ${rowHeight}`}>
          <div className="flex items-center justify-between gap-[8px] px-[8px]">
            <h2 className={`uc-type-n5-strong min-w-0 truncate text-[14px] leading-none ${titleTone}`}>
              {title}
            </h2>
            {secondaryText ? (
              <span className="uc-type-n5-strong shrink-0 text-right text-[14px] leading-none text-[var(--uc-text)]">
                {secondaryText}
              </span>
            ) : null}
            {typeof count === "number" ? (
              <span className="uc-type-n5-strong shrink-0 text-right text-[14px] leading-none text-[var(--uc-text)]">
                {count}
              </span>
            ) : null}
          </div>
          {line}
        </div>
      </div>
    );
  }

  const { titleTone: textTone, rightText, horizontalPadding, containerHeight } = state;

  return (
    <div
      className={className}
      data-ds-label="SectionHeadingDivider"
      data-divider-variant={variant}
    >
      <div className={`flex w-[375px] flex-col gap-[4px] bg-[var(--uc-surface)] py-[8px] ${horizontalPadding} ${containerHeight}`}>
        <div className="flex min-h-[14px] items-center justify-between gap-[8px]">
          <div className="flex min-w-0 items-center gap-[4px]">
            {state.checkbox ? (
              <span className="grid size-[32px] shrink-0 place-items-center" aria-hidden="true">
                <span className="size-[22px] rounded-[4px] border border-[var(--uc-text)] bg-[var(--uc-surface)]" />
              </span>
            ) : null}
            <h2 className={`uc-type-n5-strong min-w-0 whitespace-pre-line text-[14px] leading-none ${textTone}`}>
              {title}
            </h2>
          </div>
          {rightText ? (
            <span className="uc-type-n5-strong shrink-0 text-right text-[14px] leading-none text-[var(--uc-text)]">
              {rightText}
            </span>
          ) : null}
        </div>
        {hasLine ? line : null}
      </div>
    </div>
  );
}
