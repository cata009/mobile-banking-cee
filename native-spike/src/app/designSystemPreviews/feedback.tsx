import React, { useState } from 'react';
import { View } from 'react-native';
import {
  BaselineFeedbackSkeleton,
  BaselineProgressOutput,
  BaselineFeedbackSlider,
  BaselineLinearProgress,
  BaselineFeedbackInfo,
  BaselineNpsStars,
} from '../../universal/BaselineFeedbackProgress';
import type { DesignSystemPreviewProps } from './core';

const paragraph =
  'After you have activated Fingerprint Login your mobile device allows you to control access to it using any fingerprint that you store in the device.\n\nIMPORTANT: When you use Finger Scanner to sign in, you should ensure that only your fingerprints are stored in your device.';

function FeedbackSample({
  componentId,
  variantId = 'default',
  dark,
}: DesignSystemPreviewProps) {
  const [value, setValue] = useState(
    componentId === 'ui.feedback-nps'
      ? variantId === 'selected'
        ? 3
        : 0
      : variantId === 'max'
        ? 303
        : 137,
  );
  if (componentId === 'ui.feedback-skeleton')
    return <BaselineFeedbackSkeleton />;
  if (componentId === 'ui.feedback-output') {
    const title = !variantId.includes('no-title');
    return (
      <BaselineProgressOutput
        label={title ? 'Label' : undefined}
        value={variantId.startsWith('full') ? 32 : 0}
        max={title ? 190 : 327}
        dark={dark}
      />
    );
  }
  if (componentId === 'ui.feedback-slider')
    return (
      <BaselineFeedbackSlider
        label="Label"
        min={0}
        max={303}
        step={1}
        value={value}
        onChange={setValue}
        dark={dark}
      />
    );
  if (componentId === 'ui.feedback-linear')
    return (
      <BaselineLinearProgress
        value={Number(variantId) || 0}
        label="LABEL"
        valueLabel="00:00"
        dark={dark}
      />
    );
  if (componentId === 'ui.feedback-info')
    return (
      <BaselineFeedbackInfo
        variant={
          variantId === 'image' || variantId === 'icon' ? variantId : 'text'
        }
        title="Access with the Touch ID"
        paragraph={
          variantId === 'icon' ? 'I am not under PROBATION PERIOD' : paragraph
        }
        dark={dark}
      />
    );
  if (componentId === 'ui.feedback-nps')
    return <BaselineNpsStars value={value} onChange={setValue} dark={dark} />;
  return null;
}

/** Six real source families, each with one controlled composition and authored variant inputs. */
export function FeedbackDesignSystemPreview(props: DesignSystemPreviewProps) {
  if (
    ![
      'ui.feedback-skeleton',
      'ui.feedback-output',
      'ui.feedback-slider',
      'ui.feedback-linear',
      'ui.feedback-info',
      'ui.feedback-nps',
    ].includes(props.componentId)
  )
    return null;
  return (
    <View style={{ alignSelf: 'flex-start' }}>
      <FeedbackSample
        key={`${props.componentId}:${props.variantId ?? ''}`}
        {...props}
      />
    </View>
  );
}
