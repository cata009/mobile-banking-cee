import { useRef, useState } from "react";
import type { ChangeEvent, FocusEvent } from "react";
import { AppIcon } from "@/app/components/icons";
import { useLanguage } from "@/app/contexts/LanguageContext";

interface AccountSearchBarProps {
  placeholder?: string;
  onClick?: () => void;
  onFilterClick?: () => void;
  onClearClick?: () => void;
  onFocus?: () => void;
  onValueChange?: (value: string) => void;
  value?: string;
}

export default function AccountSearchBar({
  placeholder,
  onClick,
  onFilterClick,
  onClearClick,
  onFocus,
  onValueChange,
  value,
}: AccountSearchBarProps) {
  const { t } = useLanguage();
  const resolvedPlaceholder = placeholder ?? t("runtime.actions.search", "Search");
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalValue, setInternalValue] = useState("");
  const searchValue = value ?? internalValue;
  const hasSearchValue = searchValue.trim().length > 0;

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

  return (
    <div
      className="flex min-h-[32px] flex-col items-start self-stretch rounded-[10px] bg-[var(--uc-app-bg)] p-0"
      data-ds-label="AccountSearchBar 32px"
    >
      <div className="flex h-[32px] w-full items-center justify-between">
        <label className="flex h-[32px] min-w-0 flex-1 items-center gap-[8px] text-left">
          <span className="flex h-[32px] w-[32px] shrink-0 items-center justify-center" data-ds-label="Search icon 32x32">
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
            className="uc-type-n5-strong h-[32px] min-w-0 flex-1 appearance-none bg-transparent text-[var(--uc-text)] outline-none placeholder:text-[var(--uc-text-muted)] [&::-webkit-search-cancel-button]:hidden"
          />
        </label>
        <button
          type="button"
          onClick={hasSearchValue ? handleClearClick : onFilterClick}
          className="grid h-[32px] w-[32px] shrink-0 place-items-center"
          aria-label={hasSearchValue ? "Clear search results" : t("runtime.actions.filters", "Filters")}
          data-ds-label={hasSearchValue ? "Clear results icon 32x32" : "Filter icon 32x32"}
        >
          {hasSearchValue ? (
            <AppIcon name="clear-results" color="var(--uc-text)" />
          ) : (
            <AppIcon name="filters" color="var(--uc-text)" />
          )}
        </button>
      </div>
    </div>
  );
}
