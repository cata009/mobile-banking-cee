import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SourceCustomIcon } from '../../../../universal/SourceCustomIcon';
import { sourceColor } from '../../../../universal/sourceColor';
import { getTutorialsForCountry } from '@/app/config/tutorialsConfig';
import type { CurrentScreenProps } from '../contracts';
import { Copy, useCurrentTokens, useLocalBack } from './Primitives';
import { useProfileTranslation } from './Host';
import { BottomSheet } from './BottomSheet';
export default function Tutorials(props: CurrentScreenProps) {
  const t = useProfileTranslation(),
    tokens = useCurrentTokens();
  const tutorials = getTutorialsForCountry(props.country);
  const [selected, setSelected] = useState<string | null>(
      props.route.params?.id ?? null,
    ),
    [step, setStep] = useState(0);
  const tutorial = tutorials.find(item => item.id === selected);
  const close = () => {
    setSelected(null);
    setStep(0);
    props.onBack();
  };
  useLocalBack(close, props.isActive);
  if (!tutorial)
    return (
      <BottomSheet
        title={t('more.cards.tutorial', 'Tutorials')}
        maxHeightOffset={102}
        onClose={close}
      >
        <View style={overlayStyles.list}>
          {tutorials.map(item => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={'Open tutorial: ' + item.title}
              onPress={() => {
                setSelected(item.id);
                setStep(0);
              }}
              style={overlayStyles.listRow}
            >
              <Copy strong size={14} lineHeight={18} letterSpacing={0.28}>
                {item.title}
              </Copy>
              <View style={overlayStyles.listChevron}>
                <SourceCustomIcon
                  name="chevron-link"
                  color={tokens.text}
                  size={32}
                />
              </View>
            </Pressable>
          ))}
        </View>
      </BottomSheet>
    );
  const slide = tutorial.slides[step] ?? tutorial.slides[0],
    last = step === tutorial.slides.length - 1;
  return (
    <View style={overlayStyles.backdrop}>
      <View
        role="dialog"
        accessibilityLabel={tutorial.shortTitle + ' tutorial'}
        accessibilityViewIsModal
        style={[
          overlayStyles.panel,
          {
            top: props.screenTopInset,
            backgroundColor: sourceColor(
              'var(--uc-surface)',
              tokens.text.toLowerCase() !== '#262626',
            ),
          },
        ]}
      >
        <View style={[overlayStyles.header, { borderColor: tokens.border }]}>
          <View style={overlayStyles.iconSlot} />
          <View style={overlayStyles.heading}>
            <Copy strong size={14} lineHeight={18}>
              {tutorial.shortTitle}
            </Copy>
            <Copy size={11} lineHeight={14} color={tokens.muted}>
              Step {step + 1} of {tutorial.slides.length}
            </Copy>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close tutorial"
            onPress={close}
            style={overlayStyles.iconSlot}
          >
            <SourceCustomIcon name="close-x" size={24} color={tokens.text} />
          </Pressable>
        </View>
        <ScrollView
          style={overlayStyles.grow}
          contentContainerStyle={overlayStyles.body}
        >
          {slide.kind !== 'checklist' ? (
            <TutorialVisual
              accent={tutorial.accent}
              confirmation={slide.kind === 'confirmation'}
            />
          ) : null}
          <View
            testID={'current-tutorial-' + slide.kind}
            style={[
              tutorialStyles.textBlock,
              slide.kind === 'checklist'
                ? tutorialStyles.checklistText
                : undefined,
            ]}
          >
            <Copy strong size={24} lineHeight={31}>
              {slide.title}
            </Copy>
            <Copy size={16} lineHeight={22}>
              {slide.body}
            </Copy>
            <Copy size={14} lineHeight={20} color={tokens.muted}>
              {slide.helper}
            </Copy>
            {slide.kind === 'checklist' ? (
              <View style={tutorialStyles.checklist}>
                {[
                  'Select the product',
                  'Check the details',
                  'Continue securely',
                ].map((item, index) => (
                  <View key={item} style={tutorialStyles.checklistRow}>
                    <View
                      style={[
                        tutorialStyles.number,
                        { backgroundColor: tutorial.accent },
                      ]}
                    >
                      <Copy strong size={14} color="#ffffff">
                        {index + 1}
                      </Copy>
                    </View>
                    <Copy strong lineHeight={20}>
                      {item}
                    </Copy>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        </ScrollView>
        <View style={overlayStyles.dots}>
          {tutorial.slides.map((item, index) => (
            <Pressable
              key={item.title + index}
              accessibilityRole="button"
              accessibilityLabel={'Go to step ' + (index + 1)}
              onPress={() => setStep(index)}
              style={[
                tutorialStyles.dot,
                index === step
                  ? [
                      tutorialStyles.selectedDot,
                      { backgroundColor: tokens.text },
                    ]
                  : undefined,
              ]}
            />
          ))}
        </View>
        <View
          style={[
            overlayStyles.footer,
            {
              borderColor: tokens.border,
              backgroundColor: sourceColor(
                'var(--uc-surface)',
                tokens.text.toLowerCase() !== '#262626',
              ),
            },
          ]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Previous tutorial step"
            disabled={step === 0}
            onPress={() => setStep(current => Math.max(0, current - 1))}
            style={[
              overlayStyles.iconSlot,
              step === 0 ? overlayStyles.disabled : undefined,
            ]}
          >
            <SourceCustomIcon
              name="chevron-left"
              size={24}
              color={tokens.text}
            />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={last ? 'DONE' : 'NEXT'}
            onPress={
              last
                ? close
                : () =>
                    setStep(current =>
                      Math.min(tutorial.slides.length - 1, current + 1),
                    )
            }
          >
            <Copy strong size={14} lineHeight={18} color={tokens.accent}>
              {last ? 'DONE' : 'NEXT'}
            </Copy>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
const overlayStyles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    zIndex: 50,
    backgroundColor: 'rgba(0,0,0,.4)',
  },
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  header: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingHorizontal: 8,
  },
  heading: { flex: 1, minWidth: 0, paddingHorizontal: 8, alignItems: 'center' },
  iconSlot: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grow: { flex: 1 },
  body: { paddingBottom: 104 },
  dots: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 50,
    height: 32,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 72,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  disabled: { opacity: 0.3 },
  list: { marginTop: -8, paddingBottom: 8 },
  listRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 10,
    paddingRight: 48,
  },
  listChevron: { position: 'absolute', right: 0, width: 32, height: 32 },
});
function TutorialVisual({
  accent,
  confirmation,
}: {
  accent: string;
  confirmation: boolean;
}) {
  const validation = confirmation ? '#3d7d43' : accent;
  return (
    <View style={tutorialStyles.visual}>
      <View style={tutorialStyles.phone}>
        <View style={tutorialStyles.notch} />
        <View
          style={[tutorialStyles.phoneAccent, { backgroundColor: accent }]}
        />
        <View style={tutorialStyles.phoneLines}>
          <View style={tutorialStyles.line} />
          <View style={[tutorialStyles.line, tutorialStyles.shortLine]} />
          <View style={tutorialStyles.phoneAction} />
        </View>
        <View style={tutorialStyles.phoneCircle}>
          <View
            style={[tutorialStyles.validation, { backgroundColor: validation }]}
          >
            <Copy strong size={20} color="#ffffff">
              {confirmation ? 'OK' : '1'}
            </Copy>
          </View>
        </View>
      </View>
      <View style={tutorialStyles.leftCard}>
        <View
          style={[tutorialStyles.leftAccent, { backgroundColor: accent }]}
        />
        <View style={tutorialStyles.cardLine} />
        <View style={[tutorialStyles.cardLine, tutorialStyles.shortCardLine]} />
      </View>
      <View style={tutorialStyles.rightCard}>
        <View style={tutorialStyles.rightLine} />
        <View
          style={[tutorialStyles.rightAccent, { backgroundColor: accent }]}
        />
      </View>
    </View>
  );
}
const tutorialStyles = StyleSheet.create({
  previous: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: { paddingHorizontal: 16, paddingTop: 24, gap: 12 },
  checklistText: { paddingTop: 56 },
  checklist: { marginTop: 40, gap: 16 },
  checklistRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  number: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: {
    marginTop: 24,
    marginBottom: 12,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#999999' },
  selectedDot: { width: 30, backgroundColor: '#262626' },
  visual: {
    height: 439,
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
    alignItems: 'center',
  },
  phone: {
    position: 'absolute',
    top: 54,
    width: 178,
    height: 294,
    borderRadius: 28,
    borderWidth: 8,
    borderColor: '#262626',
    backgroundColor: '#ffffff',
  },
  notch: {
    alignSelf: 'center',
    marginTop: 10,
    height: 5,
    width: 48,
    borderRadius: 3,
    backgroundColor: '#262626',
  },
  phoneAccent: {
    marginHorizontal: 16,
    marginTop: 24,
    height: 48,
    borderRadius: 8,
  },
  phoneLines: { marginHorizontal: 16, marginTop: 22, gap: 10 },
  line: { height: 10, borderRadius: 5, backgroundColor: '#d9d9d9' },
  shortLine: { width: 72 },
  phoneAction: {
    marginTop: 12,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#262626',
  },
  phoneCircle: {
    position: 'absolute',
    bottom: 18,
    alignSelf: 'center',
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  validation: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftCard: {
    position: 'absolute',
    left: 24,
    top: 82,
    height: 74,
    width: 120,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
  leftAccent: { margin: 12, height: 14, width: 52, borderRadius: 7 },
  cardLine: {
    marginHorizontal: 12,
    marginTop: 2,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d9d9d9',
  },
  shortCardLine: { marginTop: 8, width: 64 },
  rightCard: {
    position: 'absolute',
    right: 18,
    top: 240,
    height: 88,
    width: 132,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  rightLine: {
    marginHorizontal: 14,
    marginTop: 14,
    height: 12,
    width: 78,
    borderRadius: 6,
    backgroundColor: '#d9d9d9',
  },
  rightAccent: {
    marginHorizontal: 14,
    marginTop: 14,
    height: 28,
    borderRadius: 8,
  },
});
