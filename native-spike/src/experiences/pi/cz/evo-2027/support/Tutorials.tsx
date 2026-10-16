import React, { useState } from 'react';
import { getTutorialsForCountry } from '@/app/config/tutorialsConfig';
import type { CzechNativeScreenProps } from '../contracts';
import { Page } from '../profile/Primitives';
import { useCzechTranslation } from '../profile/features/preferences';
import {
  TutorialFooter,
  TutorialListContent,
  TutorialSlideContent,
} from './TutorialContent';

export default function Tutorials(props: CzechNativeScreenProps) {
  const t = useCzechTranslation();
  const tutorials = getTutorialsForCountry('CZ');
  const [selected, setSelected] = useState<string | null>(
    props.route.params?.id ?? null,
  );
  const [step, setStep] = useState(0);
  const tutorial = tutorials.find(item => item.id === selected) ?? null;
  const close = () => {
    setSelected(null);
    setStep(0);
    props.onBack();
  };

  if (!tutorial)
    return (
      <Page
        title={t('more.cards.tutorial', 'Tutorials')}
        onBack={close}
        topInset={props.screenTopInset}
        active={props.isActive}
      >
        <TutorialListContent
          tutorials={tutorials}
          onSelect={id => {
            setSelected(id);
            setStep(0);
          }}
        />
      </Page>
    );

  return (
    <Page
      title={tutorial.shortTitle}
      largeTitle={false}
      headerSubtitle={'Step ' + (step + 1) + ' of ' + tutorial.slides.length}
      onBack={close}
      topInset={props.screenTopInset}
      active={props.isActive}
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
  );
}
