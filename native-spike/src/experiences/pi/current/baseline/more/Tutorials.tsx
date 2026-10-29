import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import {
  getTutorialsForCountry,
  type BankingTutorialSlide,
  type BankingTutorial,
} from '@/app/config/tutorialsConfig';
import type { CurrentScreenProps } from '../../contracts';
import { BOTTOM_SHEET_CONTRACT } from '@/app/components/contracts/bottomSheet';
import { ModalPortal } from '../../../../../universal/ModalPortal';
import { useDemoViewport } from '../../../../../universal/DemoViewport';
import { SourceCustomIcon } from '../../../../../universal/SourceCustomIcon';
import { sourceColor } from '../../../../../universal/sourceColor';
import { Text } from '../../../../../universal/Typography';

/** Local tutorial state mirrors Source TutorialsFlow and resets when the overlay unmounts. */
export default function Tutorials({
  host,
  onClose,
  initialTutorial,
}: {
  host: CurrentScreenProps;
  onClose: () => void;
  initialTutorial?: BankingTutorial;
}) {
  const tutorials = initialTutorial
    ? [initialTutorial]
    : getTutorialsForCountry(host.country);
  const [selected, setSelected] = useState<string | null>(
    initialTutorial?.id ?? null,
  );
  const [step, setStep] = useState(0);
  const tutorial = tutorials.find(item => item.id === selected);
  const viewport = useDemoViewport();
  const dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true);
  const color = (token: string) => sourceColor(`var(${token})`, dark);
  if (!tutorial)
    return (
      <ModalPortal
        visible
        transparent
        animationType="none"
        onRequestClose={onClose}
      >
        <View
          testID="ro-tutorials-list"
          style={[
            s.overlay,
            Platform.OS === 'web' && s.webList,
            { backgroundColor: color('--uc-overlay') },
          ]}
        >
          <Pressable
            aria-hidden
            accessibilityLabel="Close sheet"
            onPress={onClose}
            style={StyleSheet.absoluteFill}
          />
          <ScrollView
            style={[
              s.listPanel,
              {
                maxHeight: viewport.height - 102,
                backgroundColor: color('--uc-sheet-bg'),
              },
              Platform.OS === 'web' && s.webScroll,
            ]}
            contentContainerStyle={s.listPanelContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            accessibilityViewIsModal
          >
            <View style={s.listHeader}>
              <Text
                accessibilityRole="header"
                style={[s.listHeading, { color: color('--uc-text') }]}
              >
                {host.t('more.cards.tutorial', 'Tutorials')}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close"
                onPress={onClose}
                style={s.iconSlot}
              >
                <SourceCustomIcon
                  name="close-x"
                  size={BOTTOM_SHEET_CONTRACT.closeSize}
                  color={color('--uc-icon')}
                />
              </Pressable>
            </View>
            <View style={s.list}>
              {tutorials.map(item => (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Open tutorial: ${item.title}`}
                  style={s.listRow}
                  onPress={() => {
                    setSelected(item.id);
                    setStep(0);
                  }}
                >
                  <Text style={[s.listTitle, { color: color('--uc-text') }]}>
                    {item.title}
                  </Text>
                  <SourceCustomIcon
                    name="chevron-link"
                    color={color('--uc-icon')}
                    size={32}
                  />
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      </ModalPortal>
    );
  const slide = tutorial.slides[step] ?? tutorial.slides[0];
  const last = step === tutorial.slides.length - 1;
  const surface = color('--uc-surface');
  return (
    <ModalPortal
      visible
      transparent
      animationType="none"
      manageFocus={false}
      onRequestClose={onClose}
    >
      <View
        testID="ro-tutorial-detail"
        style={[s.overlay, { backgroundColor: color('--uc-overlay') }]}
      >
        <View
          role="dialog"
          accessibilityLabel={`${tutorial.shortTitle} tutorial`}
          accessibilityViewIsModal
          style={[
            s.panel,
            { top: host.screenTopInset, backgroundColor: surface },
          ]}
        >
          <View
            style={[
              s.header,
              {
                borderColor: color('--uc-border-muted'),
                backgroundColor: surface,
              },
            ]}
          >
            <View style={s.iconSlot} />
            <View style={s.heading}>
              <Text
                numberOfLines={1}
                style={[s.shortTitle, { color: color('--uc-text') }]}
              >
                {tutorial.shortTitle}
              </Text>
              <Text
                testID="ro-tutorial-step"
                numberOfLines={1}
                style={[s.step, { color: color('--uc-text-muted') }]}
              >
                Step {step + 1} of {tutorial.slides.length}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close tutorial"
              onPress={onClose}
              style={s.iconSlot}
            >
              <SourceCustomIcon
                name="close-x"
                color={color('--uc-icon')}
                size={32}
              />
            </Pressable>
          </View>
          <ScrollView
            style={[s.scroll, Platform.OS === 'web' && s.webScroll]}
            contentContainerStyle={s.body}
            showsVerticalScrollIndicator={false}
          >
            <TutorialSlide tutorial={tutorial} slide={slide} dark={dark} />
          </ScrollView>
          <View
            style={[
              s.dots,
              {
                backgroundColor:
                  Platform.OS === 'web'
                    ? `color-mix(in srgb, ${surface} 92%, transparent)`
                    : dark
                      ? 'rgba(38,38,38,.92)'
                      : 'rgba(255,255,255,.92)',
              },
            ]}
          >
            {tutorial.slides.map((item, index) => {
              // Source's --uc-border-strong is undefined; inactive dots have no fill.
              const dotStyle = {
                width: index === step ? 30 : 6,
                backgroundColor:
                  index === step ? color('--uc-text') : 'transparent',
              };
              return (
                <Pressable
                  key={`${item.title}-${index}`}
                  accessibilityRole="button"
                  accessibilityLabel={`Go to step ${index + 1}`}
                  onPress={() => setStep(index)}
                  style={[s.dot, dotStyle]}
                />
              );
            })}
          </View>
          <View
            style={[
              s.footer,
              {
                borderColor: color('--uc-border-muted'),
                backgroundColor: surface,
              },
            ]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Previous tutorial step"
              disabled={step === 0}
              onPress={() => setStep(current => Math.max(0, current - 1))}
              style={[s.iconSlot, step === 0 && s.disabled]}
            >
              <SourceCustomIcon
                name="chevron-left"
                size={24}
                color={color('--uc-icon')}
              />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={last ? 'DONE' : 'NEXT'}
              onPress={
                last
                  ? onClose
                  : () =>
                      setStep(current =>
                        Math.min(tutorial.slides.length - 1, current + 1),
                      )
              }
            >
              <Text style={[s.next, { color: color('--uc-action') }]}>
                {last ? 'DONE' : 'NEXT'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ModalPortal>
  );
}

function TutorialSlide({
  tutorial,
  slide,
  dark,
}: {
  tutorial: BankingTutorial;
  slide: BankingTutorialSlide;
  dark: boolean;
}) {
  const primary = sourceColor('var(--uc-text)', dark);
  const muted = sourceColor('var(--uc-text-muted)', dark);
  const checklist = slide.kind === 'checklist';
  return (
    <>
      {!checklist && (
        <TutorialVisual
          accent={tutorial.accent}
          confirmation={slide.kind === 'confirmation'}
        />
      )}
      <View style={[s.slide, checklist && s.checklistSlide]}>
        <View style={s.textBlock}>
          <Text style={[s.title, { color: primary }]}>{slide.title}</Text>
          <Text style={[s.description, { color: primary }]}>{slide.body}</Text>
          <Text style={[s.helper, { color: muted }]}>{slide.helper}</Text>
        </View>
        {checklist && (
          <View style={s.checklist}>
            {[
              'Select the product',
              'Check the details',
              'Continue securely',
            ].map((item, index) => (
              <View
                key={item}
                style={[
                  s.checklistRow,
                  { borderColor: sourceColor('var(--uc-border-muted)', dark) },
                ]}
              >
                <View style={[s.number, { backgroundColor: tutorial.accent }]}>
                  <Text style={s.numberLabel}>{index + 1}</Text>
                </View>
                <Text style={[s.checklistLabel, { color: primary }]}>
                  {item}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </>
  );
}

function TutorialVisual({
  accent,
  confirmation,
}: {
  accent: string;
  confirmation: boolean;
}) {
  const validationStyle = {
    backgroundColor: confirmation ? '#3D7D43' : accent,
  };
  return (
    <View style={s.visual}>
      <View style={s.phone}>
        <View style={s.notch} />
        <View style={[s.phoneAccent, { backgroundColor: accent }]} />
        <View style={s.phoneLines}>
          <View style={s.line} />
          <View style={[s.line, s.shortLine]} />
          <View style={s.phoneAction} />
        </View>
        <View style={s.phoneCircle}>
          <View style={[s.validation, validationStyle]}>
            <Text style={s.validationLabel}>{confirmation ? 'OK' : '1'}</Text>
          </View>
        </View>
      </View>
      <View style={s.leftCard}>
        <View style={[s.leftAccent, { backgroundColor: accent }]} />
        <View style={s.cardLine} />
        <View style={[s.cardLine, s.shortCardLine]} />
      </View>
      <View style={s.rightCard}>
        <View style={s.rightLine} />
        <View style={[s.rightAccent, { backgroundColor: accent }]} />
      </View>
    </View>
  );
}

const bold: TextStyle = { fontFamily: 'UniCredit-bold' };
const s = StyleSheet.create({
  webList: { transform: 'none' } as unknown as ViewStyle,
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 50,
    justifyContent: 'flex-end',
  },
  list: { marginTop: -8, paddingBottom: 8 },
  listPanel: {
    width: '100%',
    flexGrow: 0,
    flexShrink: 1,
    borderTopLeftRadius: BOTTOM_SHEET_CONTRACT.radius,
    borderTopRightRadius: BOTTOM_SHEET_CONTRACT.radius,
    boxShadow: '0 -8px 24px rgba(0,0,0,.18)',
  },
  listPanelContent: { padding: BOTTOM_SHEET_CONTRACT.padding },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: BOTTOM_SHEET_CONTRACT.headerGap,
    marginBottom: 24,
  },
  listHeading: { fontFamily: 'UniCredit-bold', fontSize: 28, flexShrink: 1 },
  listRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 10,
  },
  listTitle: {
    ...bold,
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0.28,
    textTransform: 'uppercase',
    maxWidth: 286,
    flexShrink: 1,
  },
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  header: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingHorizontal: 8,
  },
  iconSlot: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  heading: { minWidth: 0, flex: 1, paddingHorizontal: 8, alignItems: 'center' },
  shortTitle: {
    ...bold,
    fontSize: 14,
    lineHeight: 18,
    width: '100%',
    textAlign: 'center',
  },
  step: {
    fontFamily: 'UniCredit-regular',
    fontSize: 11,
    lineHeight: 14,
    width: '100%',
    textAlign: 'center',
  },
  scroll: { flex: 1 },
  webScroll: { transform: 'none' },
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
  dot: { height: 6, borderRadius: 999 },
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
  next: { ...bold, fontSize: 14, lineHeight: 18 },
  slide: { paddingHorizontal: 16, paddingTop: 24 },
  checklistSlide: { paddingTop: 56 },
  textBlock: { gap: 12 },
  title: { ...bold, fontSize: 24, lineHeight: 31 },
  description: {
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
    lineHeight: 22,
  },
  helper: { fontFamily: 'UniCredit-regular', fontSize: 14, lineHeight: 20 },
  checklist: { marginTop: 40, gap: 16 },
  checklistRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderBottomWidth: 1,
  },
  number: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  numberLabel: { ...bold, fontSize: 14, color: '#fff' },
  checklistLabel: { ...bold, fontSize: 16, lineHeight: 20 },
  visual: {
    height: 439,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
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
    backgroundColor: '#fff',
    boxShadow: '0 16px 36px rgba(38,38,38,0.18)',
  },
  notch: {
    alignSelf: 'center',
    marginTop: 10,
    height: 5,
    width: 48,
    borderRadius: 999,
    backgroundColor: '#262626',
  },
  phoneAccent: {
    marginHorizontal: 16,
    marginTop: 24,
    height: 48,
    borderRadius: 8,
  },
  phoneLines: { marginHorizontal: 16, marginTop: 22, gap: 10 },
  line: { height: 10, borderRadius: 999, backgroundColor: '#D9D9D9' },
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
    borderColor: '#E5E5E5',
    backgroundColor: '#fff',
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
  validationLabel: { ...bold, fontSize: 20, color: '#fff' },
  leftCard: {
    position: 'absolute',
    left: 24,
    top: 82,
    height: 74,
    width: 120,
    borderRadius: 10,
    backgroundColor: '#fff',
    boxShadow: '0 10px 24px rgba(38,38,38,0.12)',
  },
  leftAccent: { margin: 12, height: 14, width: 52, borderRadius: 999 },
  cardLine: {
    marginHorizontal: 12,
    marginTop: 2,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#D9D9D9',
  },
  shortCardLine: { marginTop: 8, width: 64 },
  rightCard: {
    position: 'absolute',
    right: 18,
    top: 240,
    height: 88,
    width: 132,
    borderRadius: 12,
    backgroundColor: '#fff',
    boxShadow: '0 10px 24px rgba(38,38,38,0.12)',
  },
  rightLine: {
    marginHorizontal: 14,
    marginTop: 14,
    height: 12,
    width: 78,
    borderRadius: 999,
    backgroundColor: '#D9D9D9',
  },
  rightAccent: {
    marginHorizontal: 14,
    marginTop: 14,
    height: 28,
    borderRadius: 8,
  },
});
