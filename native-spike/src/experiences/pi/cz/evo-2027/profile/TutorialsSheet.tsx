import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { getTutorialsForCountry } from '@/app/config/tutorialsConfig';
import { ModalPanel } from '../../../../../universal/ModalPanel';
import { ModalPortal } from '../../../../../universal/ModalPortal';
import type { CzechNativeScreenProps } from '../contracts';
import { Page, s, useCurrentTokens } from './Primitives';
import { useCzechTranslation } from './features/preferences';
import {
  TutorialFooter,
  TutorialListContent,
  TutorialSlideContent,
} from '../support/TutorialContent';

export default function ProfileTutorialsSheet({
  host,
  onClose,
}: {
  host: CzechNativeScreenProps;
  onClose: () => void;
}) {
  const t = useCzechTranslation(),
    tokens = useCurrentTokens();
  const tutorials = getTutorialsForCountry('CZ');
  const [tutorialId, setTutorialId] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const tutorial = tutorials.find(item => item.id === tutorialId) ?? null;
  const close = useCallback(() => {
    setTutorialId(null);
    setStep(0);
    onClose();
  }, [onClose]);
  const registerBack = host.onBackHandlerChange;

  useEffect(() => {
    if (!registerBack) return;
    registerBack(() => {
      close();
      return true;
    });
    return () => registerBack(null);
  }, [close, registerBack]);

  if (tutorial)
    return (
      <ModalPortal
        visible
        transparent
        animationType="fade"
        onRequestClose={close}
      >
        <Page
          title={tutorial.shortTitle}
          largeTitle={false}
          headerSubtitle={
            'Step ' + (step + 1) + ' of ' + tutorial.slides.length
          }
          onBack={close}
          topInset={host.screenTopInset}
          active={host.isActive}
          footer={
            <TutorialFooter
              tutorial={tutorial}
              stepIndex={step}
              onStepChange={setStep}
              onDone={close}
            />
          }
        >
          <TutorialSlideContent
            tutorial={tutorial}
            stepIndex={step}
            onStepChange={setStep}
          />
        </Page>
      </ModalPortal>
    );

  return (
    <ModalPanel
      tokens={tokens}
      title={t('more.cards.tutorial', 'Tutorials')}
      visible
      onClose={close}
    >
      <ScrollView style={s.grow} showsVerticalScrollIndicator={false}>
        <TutorialListContent
          tutorials={tutorials}
          onSelect={id => {
            setStep(0);
            setTutorialId(id);
          }}
        />
      </ScrollView>
    </ModalPanel>
  );
}
