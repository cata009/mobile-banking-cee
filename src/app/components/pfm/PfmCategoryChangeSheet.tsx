import { useMemo, useState } from "react";
import AccountSearchBar from "@/app/components/accounts/AccountSearchBar";
import { BottomSheet } from "@/app/components/BottomSheet";
import { AppIcon } from "@/app/components/icons";
import PfmCategoryIcon from "@/app/components/pfm/PfmCategoryIcon";
import PrimaryButton from "@/app/components/PrimaryButton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/components/ui/accordion";
import { useLanguage } from "@/app/contexts/LanguageContext";
import {
  PFM_CATEGORY_GROUPS,
  type PfmCategoryGroupDefinition,
  type PfmCategorySelection,
} from "@/data/pfmCategories";

interface PfmCategoryChangeSheetProps {
  currentSelection: PfmCategorySelection;
  onClose: () => void;
  onConfirm: (selection: PfmCategorySelection) => void;
}

function sentenceCase(value: string) {
  const lowerCaseValue = value.toLocaleLowerCase();
  return `${lowerCaseValue.charAt(0).toLocaleUpperCase()}${lowerCaseValue.slice(1)}`;
}

function createSelection(group: PfmCategoryGroupDefinition, subcategory: string): PfmCategorySelection {
  return {
    groupId: group.id,
    groupLabel: group.label,
    category: group.category,
    subcategory,
  };
}

function isSameSelection(left: PfmCategorySelection, right: PfmCategorySelection) {
  return left.groupId === right.groupId && left.subcategory === right.subcategory;
}

export default function PfmCategoryChangeSheet({
  currentSelection,
  onClose,
  onConfirm,
}: PfmCategoryChangeSheetProps) {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [draftSelection, setDraftSelection] = useState(currentSelection);
  const normalizedQuery = query.trim().toLocaleLowerCase();

  const visibleGroups = useMemo(() => {
    if (!normalizedQuery) return PFM_CATEGORY_GROUPS;

    return PFM_CATEGORY_GROUPS.flatMap((group) => {
      const groupMatches = group.label.toLocaleLowerCase().includes(normalizedQuery);
      const matchingSubcategories = group.subcategories.filter((subcategory) =>
        subcategory.toLocaleLowerCase().includes(normalizedQuery),
      );

      if (!groupMatches && matchingSubcategories.length === 0) return [];
      return [{ ...group, subcategories: groupMatches ? group.subcategories : matchingSubcategories }];
    });
  }, [normalizedQuery]);

  const accordionValue = normalizedQuery
    ? visibleGroups.map((group) => group.id)
    : expandedGroups;
  const selectionChanged = !isSameSelection(draftSelection, currentSelection);
  const countLabel = (count: number) =>
    count === 1
      ? t("runtime.pfmCategoryChange.categoryCount", "category")
      : t("runtime.pfmCategoryChange.categoriesCount", "categories");

  return (
    <BottomSheet
      title={t("runtime.pfmCategoryChange.title", "Change category")}
      onClose={onClose}
      fillHeight
      maxHeightOffsetPx={54}
      showCloseButton={false}
      showDragHandle
      closeLabel={t("runtime.pfmCategoryChange.close", "Close category sheet")}
      className="p-0"
      headerClassName="mb-[20px] px-[20px]"
      bodyClassName="flex min-h-0 flex-1 flex-col"
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-[20px] scrollbar-hide">
        <section aria-labelledby="recommended-categories-heading">
          <h2
            id="recommended-categories-heading"
            className="uc-type-n4-strong border-b border-[var(--uc-border)] pb-[4px] text-[var(--uc-text)]"
          >
            {t("runtime.pfmCategoryChange.recommendedCategories", "Recommended categories")}
          </h2>
          <button
            type="button"
            className="flex min-h-[64px] w-full items-end justify-between border-b border-[var(--uc-border)] pb-[6px] text-left"
            onClick={() => setDraftSelection(currentSelection)}
          >
            <span className="min-w-0">
              <span className="uc-type-n5 block uppercase text-[var(--uc-text-muted)]">
                {t("runtime.pfmCategoryChange.tapToChoose", "Tap to choose")}
              </span>
              <span className="uc-type-n4 block truncate text-[var(--uc-text)]">
                {sentenceCase(currentSelection.subcategory)}
              </span>
            </span>
            <AppIcon name="chevron-down-wide" color="var(--uc-text)" />
          </button>
        </section>

        <section className="pt-[32px]" aria-labelledby="category-groups-heading">
          <h2
            id="category-groups-heading"
            className="uc-type-n4-strong border-b border-[var(--uc-border)] pb-[4px] text-[var(--uc-text)]"
          >
            {t("runtime.pfmCategoryChange.categoryGroups", "CATEGORY GROUPS")}
          </h2>
          <div className="py-[24px]">
            <AccountSearchBar
              value={query}
              onValueChange={setQuery}
              placeholder={t("runtime.pfmCategoryChange.search", "Search")}
              showRemoveFiltersAction={false}
              showTrailingAction={false}
            />
          </div>

          {visibleGroups.length > 0 ? (
            <Accordion
              type="multiple"
              value={accordionValue}
              onValueChange={setExpandedGroups}
              className="pb-[12px]"
            >
              {visibleGroups.map((group) => {
                const originalGroup = PFM_CATEGORY_GROUPS.find((candidate) => candidate.id === group.id) ?? group;
                const groupCount = originalGroup.subcategories.length;

                return (
                  <AccordionItem key={group.id} value={group.id} className="border-0">
                    <AccordionTrigger
                      className="min-h-[72px] items-center rounded-none py-[12px] hover:no-underline [&>svg]:hidden"
                      aria-label={`${group.label} ${groupCount} ${countLabel(groupCount)}`}
                    >
                      <span className="flex min-w-0 flex-1 items-center gap-[16px]">
                        <span aria-hidden="true" className="grid size-[36px] shrink-0 place-items-center">
                          <PfmCategoryIcon category={group.iconCategory} size={32} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="uc-type-n4-strong block text-[var(--uc-text)]">{group.label}</span>
                          <span className="uc-type-n5 block text-[var(--uc-text-muted)]">
                            {groupCount} {countLabel(groupCount)}
                          </span>
                        </span>
                        <span className="grid size-[32px] place-items-center text-[var(--uc-text)]">
                          <AppIcon
                            name={accordionValue.includes(group.id) ? "chevron-up" : "chevron-down-wide"}
                            color="currentColor"
                          />
                        </span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-[4px]">
                      <div role="radiogroup" aria-label={`${group.label} subcategories`}>
                        {group.subcategories.map((subcategory) => {
                          const selection = createSelection(originalGroup, subcategory);
                          const checked = isSameSelection(draftSelection, selection);

                          return (
                            <label
                              key={subcategory}
                              className="flex min-h-[64px] cursor-pointer items-center gap-[16px] py-[12px] text-[var(--uc-text)]"
                            >
                              <input
                                type="radio"
                                name="pfm-category-selection"
                                value={`${group.id}:${subcategory}`}
                                checked={checked}
                                onChange={() => setDraftSelection(selection)}
                                className="size-[24px] shrink-0 accent-[var(--uc-action)]"
                              />
                              <span className="uc-type-n4-strong">{subcategory}</span>
                            </label>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          ) : (
            <p className="uc-type-n4-strong py-[32px] text-center text-[var(--uc-text-muted)]">
              {t("runtime.pfmCategoryChange.noResults", "No categories found")}
            </p>
          )}
        </section>
      </div>

      <div className="shrink-0 border-t border-[var(--uc-border)] bg-[var(--uc-sheet-bg)] px-[24px] py-[16px]">
        <PrimaryButton
          className="mx-auto"
          disabled={!selectionChanged}
          onClick={() => onConfirm(draftSelection)}
        >
          {t("runtime.pfmCategoryChange.confirm", "CHANGE CATEGORY")}
        </PrimaryButton>
      </div>
    </BottomSheet>
  );
}
