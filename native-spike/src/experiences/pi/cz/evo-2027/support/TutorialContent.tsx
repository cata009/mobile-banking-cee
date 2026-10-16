import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { BankingTutorial } from '@/app/config/tutorialsConfig';
import { SourceCustomIcon } from '../../../../../universal/SourceCustomIcon';
import { Button, Copy, Row, s } from '../profile/Primitives';

export function TutorialListContent({
  tutorials,
  onSelect,
}: {
  tutorials: readonly BankingTutorial[];
  onSelect: (tutorialId: string) => void;
}) {
  return (
    <>
      {tutorials.map(tutorial => (
        <Row
          key={tutorial.id}
          title={tutorial.title}
          label={'Open tutorial: ' + tutorial.title}
          rowHeight={72}
          titleSize={14}
          onPress={() => onSelect(tutorial.id)}
        />
      ))}
    </>
  );
}

export function TutorialSlideContent({
  tutorial,
  stepIndex,
  onStepChange,
}: {
  tutorial: BankingTutorial;
  stepIndex: number;
  onStepChange: (stepIndex: number) => void;
}) {
  const slide = tutorial.slides[stepIndex] ?? tutorial.slides[0];
  return (
    <View testID={'cz-tutorial-' + slide.kind}>
      {slide.kind !== 'checklist' ? (
        <TutorialVisual
          accent={tutorial.accent}
          confirmation={slide.kind === 'confirmation'}
        />
      ) : null}
      <View
        style={[
          tutorialStyles.textBlock,
          slide.kind === 'checklist' && tutorialStyles.checklistText,
        ]}
      >
        <Copy strong size={24} lineHeight={31}>
          {slide.title}
        </Copy>
        <Copy size={16} lineHeight={22}>
          {slide.body}
        </Copy>
        <Copy size={14} lineHeight={20} color="#666666">
          {slide.helper}
        </Copy>
        {slide.kind === 'checklist' ? (
          <View style={tutorialStyles.checklist}>
            {[
              'Select the product',
              'Check the details',
              'Continue securely',
            ].map((label, index) => (
              <View key={label} style={tutorialStyles.checklistRow}>
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
                  {label}
                </Copy>
              </View>
            ))}
          </View>
        ) : null}
      </View>
      <View style={tutorialStyles.dots}>
        {tutorial.slides.map((item, index) => (
          <Pressable
            key={item.title}
            accessibilityRole="button"
            accessibilityLabel={'Go to step ' + (index + 1)}
            onPress={() => onStepChange(index)}
            style={[
              tutorialStyles.dot,
              index === stepIndex ? tutorialStyles.selectedDot : undefined,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

export function TutorialFooter({
  tutorial,
  stepIndex,
  onStepChange,
  onDone,
}: {
  tutorial: BankingTutorial;
  stepIndex: number;
  onStepChange: (stepIndex: number) => void;
  onDone: () => void;
}) {
  const last = stepIndex >= tutorial.slides.length - 1;
  return (
    <View style={s.horizontal}>
      <View style={s.grow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous tutorial step"
          disabled={stepIndex === 0}
          onPress={() => onStepChange(Math.max(0, stepIndex - 1))}
          style={tutorialStyles.previous}
        >
          <SourceCustomIcon name="chevron-left" size={24} />
        </Pressable>
      </View>
      <View style={s.grow}>
        <Button
          label={last ? 'DONE' : 'NEXT'}
          secondary
          onPress={
            last
              ? onDone
              : () =>
                  onStepChange(
                    Math.min(tutorial.slides.length - 1, stepIndex + 1),
                  )
          }
        />
      </View>
    </View>
  );
}

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
    marginTop: 22,
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
