import { useRef, useState } from "react";
import type { ChangeEvent, FocusEvent } from "react";
import { AppIcon, type IconName } from "@/app/components/icons";
import { useLanguage } from "@/app/contexts/LanguageContext";

export const ACCOUNT_SEARCH_BAR_SOURCE = {
  schema: "codex-figma-component-spec/v1",
  sourceNodeIds: {
    activeRemoveFilters: "1517:12655",
  },
  dimensions: {
    activeRemoveFilters: {
      width: 375,
      height: 63,
      searchHeight: 36,
      iconSlot: 32,
    },
  },
} as const;

interface AccountSearchBarProps {
  placeholder?: string;
  onClick?: () => void;
  onFilterClick?: () => void;
  onRemoveFilters?: () => void;
  onClearClick?: () => void;
  onFocus?: () => void;
  onValueChange?: (value: string) => void;
  value?: string;
  filtersActive?: boolean;
  showRemoveFiltersAction?: boolean;
  removeFiltersLabel?: string;
  showTrailingAction?: boolean;
  /** `raised` puts a white field on a page-coloured band, for Evo 2027 lists. */
  fieldSurface?: "muted" | "raised";
  /** Comfortable fields are easier to use in full-page search contexts. */
  fieldSize?: "compact" | "comfortable";
  /** Adds breathing room around the 32px icon slots on Evo 2027 list surfaces. */
  fieldPadding?: "none" | "8";
  /**
   * Replaces the filter glyph in the trailing slot — the Payments hub puts a QR
   * scanner there, where a list would put filters. Clearing a typed query still
   * takes the slot over, as it does everywhere else.
   */
  trailingIcon?: IconName;
  trailingLabel?: string;
}

export default function AccountSearchBar({
  placeholder,
  onClick,
  onFilterClick,
  onRemoveFilters,
  onClearClick,
  onFocus,
  onValueChange,
  value,
  filtersActive = false,
  showRemoveFiltersAction = true,
  removeFiltersLabel = "REMOVE FILTERS",
  showTrailingAction = true,
  fieldSurface = "muted",
  fieldSize = "compact",
  fieldPadding = "none",
  trailingIcon,
  trailingLabel,
}: AccountSearchBarProps) {
  const { t } = useLanguage();
  const resolvedPlaceholder = placeholder ?? t("runtime.actions.search", "Search");
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalValue, setInternalValue] = useState("");
  const searchValue = value ?? internalValue;
  const hasSearchValue = searchValue.trim().length > 0;
  const showRemoveFilters = showRemoveFiltersAction && filtersActive && !hasSearchValue;
  const paddedField = fieldPadding === "8" && !showRemoveFilters;

  const updateSearchValue = (nextValue: string) => {
    if (value === undefined) {
      setInternalValue(nextValue);
    }

    onValueChange?.(nextValue);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateSearchValue(event.target.value);
  };

  const handleInputFocus = (_event: FocusEvent<HTMLInputElement>) => {
    onFocus?.();
  };

  const handleClearClick = () => {
    updateSearchValue("");
    onClearClick?.();
    inputRef.current?.focus();
  };

  const fieldGround = fieldSurface === "raised"
    ? "bg-[var(--uc-surface)] shadow-[inset_0_0_0_1px_var(--uc-border-muted)]"
    : "bg-[var(--uc-app-bg)]";
  // The padded Evo field owns the single outer stroke. Reapplying the raised
  // surface to the inner row creates a second inset stroke inside the search.
  const innerFieldGround = paddedField ? "bg-transparent" : fieldGround;
  const comfortableField = fieldSize === "comfortable";
  const fieldHeight = comfortableField ? "h-[40px]" : "h-[32px]";

  return (
    <div
      className={`flex flex-col self-stretch ${showRemoveFilters ? "min-h-[63px] items-end gap-[8px] px-[16px] py-[2px]" : `${paddedField ? "min-h-[48px]" : comfortableField ? "min-h-[40px]" : "min-h-[32px]"} items-start rounded-[10px] ${paddedField ? "p-[8px]" : "p-0"} ${fieldGround}`}`}
      data-ds-label={`AccountSearchBar ${comfortableField ? "40px" : "32px"}`}
      data-search-padding={paddedField ? "8px" : undefined}
      data-search-filters-active={showRemoveFilters ? "true" : undefined}
    >
      <div
        className={`flex w-full items-center justify-between rounded-[10px] ${innerFieldGround} ${showRemoveFilters ? "h-[36px]" : fieldHeight}`}
        data-search-inner-surface={paddedField ? "transparent" : "raised"}
      >
        <label className={`flex ${showRemoveFilters ? "h-[32px]" : fieldHeight} min-w-0 flex-1 items-center gap-[8px] text-left`}>
          <span className={`flex ${showRemoveFilters ? "h-[32px] w-[32px]" : `${fieldHeight} ${comfortableField ? "w-[40px]" : "w-[32px]"}`} shrink-0 items-center justify-center`} data-ds-label={`Search icon ${comfortableField ? "40x40" : "32x32"}`}>
            <AppIcon name="search" color="var(--uc-text)" />
          </span>
          <input
            ref={inputRef}
            type="search"
            value={searchValue}
            onChange={handleInputChange}
            onClick={onClick}
            onFocus={handleInputFocus}
            placeholder={resolvedPlaceholder}
            aria-label={resolvedPlaceholder}
            className={`uc-type-n5-strong ${showRemoveFilters ? "h-[32px]" : fieldHeight} min-w-0 flex-1 appearance-none bg-transparent text-[var(--uc-text)] outline-none placeholder:text-[var(--uc-text-muted)] [&::-webkit-search-cancel-button]:hidden`}
          />
        </label>
        {showTrailingAction || hasSearchValue ? (
          <button
            type="button"
            onClick={hasSearchValue ? handleClearClick : onFilterClick}
            className={`grid ${showRemoveFilters ? "h-[32px] w-[32px]" : `${fieldHeight} ${comfortableField ? "w-[40px]" : "w-[32px]"}`} shrink-0 place-items-center`}
            aria-label={
              hasSearchValue
                ? "Clear search results"
                : trailingLabel ?? t("runtime.actions.filters", "Filters")
            }
            aria-pressed={!hasSearchValue && !trailingIcon && filtersActive ? true : undefined}
            data-ds-label={hasSearchValue ? "Clear results icon 32x32" : "Filter icon 32x32"}
          >
            {hasSearchValue ? (
              <AppIcon name="clear-results" color="var(--uc-text)" />
            ) : trailingIcon ? (
              <AppIcon name={trailingIcon} color="var(--uc-text)" />
            ) : (
              <AppIcon name="filters" color={filtersActive ? "var(--uc-action)" : "var(--uc-text)"} />
            )}
          </button>
        ) : null}
      </div>
      {showRemoveFilters ? (
        <button
          type="button"
          onClick={onRemoveFilters}
          className="uc-type-n5-strong min-h-[32px] w-full py-[6px] text-right text-[14px] leading-[15px] text-[var(--uc-action)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-surface)]"
        >
          {removeFiltersLabel}
        </button>
      ) : null}
    </div>
  );
}
