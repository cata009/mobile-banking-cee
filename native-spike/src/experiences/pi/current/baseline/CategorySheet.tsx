import React, { useState, type CSSProperties } from 'react';
import { Platform, Pressable, View, type ViewStyle } from 'react-native';
import {
  PFM_CATEGORY_GROUPS,
  type PfmCategoryGroupDefinition,
  type PfmCategorySelection,
} from '@/data/pfmCategories';
import type { CurrentScreenProps } from '../contracts';
import { BaselineBottomSheet } from '../../../../universal/BaselineBottomSheet';
import { ModalPortal } from '../../../../universal/ModalPortal';
import { useDemoViewport } from '../../../../universal/DemoViewport';
import { Text } from '../../../../universal/Typography';
import { BaselineSearchBar } from '../../../../universal/BaselineSearchBar';
import { PrimaryButton } from '../../../../universal/PrimaryButton';
import { SourceCustomIcon } from '../../../../universal/SourceCustomIcon';
import { BaselineTransactionAvatar } from '../../../../universal/BaselineTransactionAvatar';
import { sourceColor } from '../../../../universal/sourceColor';
const untransformedWebStyle = {
  transform: 'none',
} satisfies CSSProperties;
const disabledWebButtonStyle = untransformedWebStyle as unknown as ViewStyle;
export function RoBaselineCategorySheet({
  host,
  currentSelection,
  onClose,
  onConfirm,
}: {
  host: CurrentScreenProps;
  currentSelection: PfmCategorySelection;
  onClose: () => void;
  onConfirm: (selection: PfmCategorySelection) => void;
}) {
  const [query, setQuery] = useState(''),
    [expanded, setExpanded] = useState<string[]>([]),
    [draft, setDraft] = useState(currentSelection);
  const normalized = query.trim().toLocaleLowerCase(),
    { width, height } = useDemoViewport(),
    dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true);
  const sheet = sourceColor('var(--uc-sheet-bg)', dark);
  const groups = PFM_CATEGORY_GROUPS.flatMap<PfmCategoryGroupDefinition>(
    group => {
      if (!normalized) return [group];
      const match = group.label.toLocaleLowerCase().includes(normalized),
        subcategories = group.subcategories.filter(s => {
          return s.toLocaleLowerCase().includes(normalized);
        });
      return match
        ? [group]
        : subcategories.length
        ? [
            {
              ...group,
              subcategories,
            },
          ]
        : [];
    },
  );
  const same = (left: PfmCategorySelection, right: PfmCategorySelection) => {
    return (
      left.groupId === right.groupId && left.subcategory === right.subcategory
    );
  };
  const labelStyle = {
    fontFamily: 'UniCredit-bold',
    fontSize: 16,
    lineHeight: 17,
    color: host.tokens.text,
  } as const;
  const muted = {
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    lineHeight: 15,
    color: host.tokens.muted,
  } as const;
  const heading = (text: string) => {
    const sourceStyle0 = {
      paddingBottom: 4,
      borderBottomWidth: 1,
      borderBottomColor: host.tokens.border,
    } as const;
    return <Text style={[labelStyle, sourceStyle0]}>{text}</Text>;
  };
  const sourceStyle8 = {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: host.tokens.border,
    paddingBottom: 6,
  } as const;
  const sourceStyle9 = {
    textTransform: 'uppercase',
  } as const;
  const sourceStyle10 = {
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
    lineHeight: 17,
    color: host.tokens.text,
  } as const;
  const sourceStyle11 = {
    paddingTop: 32,
  } as const;
  const sourceStyle12 = {
    paddingVertical: 24,
  } as const;
  const sourceStyle20 = {
    paddingVertical: 32,
    textAlign: 'center',
    color: host.tokens.muted,
  } as const;
  // The footer bleeds to the sheet edges; the sheet panel insets everything by 20.
  const sourceStyle21 = {
    borderTopWidth: 1,
    borderTopColor: host.tokens.border,
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginHorizontal: -20,
    marginBottom: -20,
    backgroundColor: sheet,
  } as const;
  return (
    <ModalPortal
      visible
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Canonical Design System bottom sheet: backdrop, drag handle, title and the pinned action. */}
      <BaselineBottomSheet
        title={host.t('runtime.pfmCategoryChange.title', 'Change category')}
        onClose={onClose}
        width={width}
        height={height}
        fixedHeight
        showDragHandle
        showCloseButton={false}
        closeLabel="Close category sheet"
        padding={20}
        dark={dark}
        footer={
          <View style={sourceStyle21}>
            <PrimaryButton
              label={host.t(
                'runtime.pfmCategoryChange.confirm',
                'CHANGE CATEGORY',
              )}
              disabled={same(draft, currentSelection)}
              onPress={() => {
                return onConfirm(draft);
              }}
              dark={dark}
              style={
                Platform.OS === 'web' && same(draft, currentSelection)
                  ? disabledWebButtonStyle
                  : undefined
              }
            />
          </View>
        }
      >
        <>
            {heading(
              host.t(
                'runtime.pfmCategoryChange.recommendedCategories',
                'Recommended categories',
              ),
            )}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Recommended category"
              onPress={() => {
                return setDraft(currentSelection);
              }}
              style={sourceStyle8}
            >
              <View>
                <Text style={[muted, sourceStyle9]}>
                  {host.t(
                    'runtime.pfmCategoryChange.tapToChoose',
                    'Tap to choose',
                  )}
                </Text>
                <Text style={sourceStyle10}>
                  {currentSelection.subcategory.charAt(0) +
                    currentSelection.subcategory.slice(1).toLocaleLowerCase()}
                </Text>
              </View>
              <SourceCustomIcon
                name="chevron-down-wide"
                size={20}
                color={host.tokens.text}
              />
            </Pressable>
            <View style={sourceStyle11}>
              {heading(
                host.t(
                  'runtime.pfmCategoryChange.categoryGroups',
                  'CATEGORY GROUPS',
                ),
              )}
            </View>
            <View style={sourceStyle12}>
              <BaselineSearchBar
                value={query}
                placeholder={host.t(
                  'runtime.pfmCategoryChange.search',
                  'Search',
                )}
                onValueChange={setQuery}
                showRemoveFiltersAction={false}
                showTrailingAction={false}
                dark={dark}
              />
            </View>
            {groups.map(group => {
              const original = PFM_CATEGORY_GROUPS.find(g => {
                  return g.id === group.id;
                })!,
                count = original.subcategories.length,
                open = Boolean(normalized) || expanded.includes(group.id);
              const sourceStyle13 = {
                minHeight: 72,
                paddingVertical: 12,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 16,
              } as const;
              const sourceStyle14 = {
                width: 36,
                height: 36,
                alignItems: 'center',
                justifyContent: 'center',
              } as const;
              const sourceStyle15 = {
                flex: 1,
              } as const;
              const sourceStyle16 = {
                width: 32,
                height: 32,
                alignItems: 'center',
                justifyContent: 'center',
              } as const;
              const sourceStyle17 = {
                paddingBottom: 4,
              } as const;
              return (
                <View key={group.id}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${group.label} ${count} ${
                      count === 1 ? 'category' : 'categories'
                    }`}
                    accessibilityState={{
                      expanded: open,
                    }}
                    onPress={() => {
                      return setExpanded(current => {
                        return current.includes(group.id)
                          ? current.filter(id => {
                              return id !== group.id;
                            })
                          : [...current, group.id];
                      });
                    }}
                    style={sourceStyle13}
                  >
                    <View style={sourceStyle14}>
                      <BaselineTransactionAvatar
                        identity={{
                          kind: 'category',
                          category: group.iconCategory,
                          pfmVariant: 'glyph',
                        }}
                        size={32}
                        dark={dark}
                      />
                    </View>
                    <View style={sourceStyle15}>
                      <Text style={labelStyle}>{group.label}</Text>
                      <Text style={muted}>
                        {count} {count === 1 ? 'category' : 'categories'}
                      </Text>
                    </View>
                    <View style={sourceStyle16}>
                      <SourceCustomIcon
                        name={open ? 'chevron-up' : 'chevron-down-wide'}
                        size={20}
                        color={host.tokens.text}
                      />
                    </View>
                  </Pressable>
                  {open ? (
                    <View
                      accessibilityRole="radiogroup"
                      accessibilityLabel={`${group.label} subcategories`}
                      style={sourceStyle17}
                    >
                      {group.subcategories.map(subcategory => {
                        const selection: PfmCategorySelection = {
                            groupId: group.id,
                            groupLabel: group.label,
                            category: group.category,
                            subcategory,
                          },
                          checked = same(draft, selection);
                        const sourceStyle18 = {
                          minHeight: 64,
                          paddingVertical: 12,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 16,
                        } as const;
                        const sourceStyle19 = {
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          borderWidth: checked ? 7 : 1,
                          borderColor: checked
                            ? host.tokens.accent
                            : host.tokens.border,
                        } as const;
                        return (
                          <Pressable
                            key={subcategory}
                            accessibilityRole="radio"
                            role="radio"
                            accessibilityLabel={subcategory}
                            accessibilityState={{
                              checked,
                            }}
                            onPress={() => {
                              return setDraft(selection);
                            }}
                            style={sourceStyle18}
                          >
                            <View style={sourceStyle19} />
                            <Text style={labelStyle}>{subcategory}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  ) : null}
                </View>
              );
            })}
            {groups.length === 0 ? (
              <Text style={[labelStyle, sourceStyle20]}>
                {host.t(
                  'runtime.pfmCategoryChange.noResults',
                  'No categories found',
                )}
              </Text>
            ) : null}
        </>
      </BaselineBottomSheet>
    </ModalPortal>
  );
}
