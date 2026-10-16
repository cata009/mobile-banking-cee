import React, { useState } from 'react';
import { Image, StyleSheet } from 'react-native';
import { useDemoViewport } from '../../../../universal/DemoViewport';
import {
  getProductDetailContent,
  getProductApplyLabel,
  getProductDetailImageKey,
  type ProductDetailImageKey,
} from '@/features/products/evoProductDetail';
import activateAccount from '@/assets/products/detail/img_illustration_activateaccount.png';
import activateToken from '@/assets/products/detail/img_illustration_activatetoken.png';
import blocking from '@/assets/products/detail/img_illustration_blocking.png';
import documents from '@/assets/products/detail/img_illustration_documents.png';
import credentials from '@/assets/products/detail/img_illustration_forgottencredentials.png';
import home from '@/assets/products/detail/img_illustration_homeinsurance_RS.png';
import identifier from '@/assets/products/detail/img_illustration_hu_missing_secondary_identifier.png';
import scan from '@/assets/products/detail/img_illustration_scanqrcode.png';
import biometric from '@/assets/products/detail/img_illustration_touchfaceid.png';
import travel from '@/assets/products/detail/img_illustration_travelinsurance_RS.png';
import { ActionButton } from '../../../../universal/ActionButton';
import { Body, Heading, Page } from '../Primitives';
import { Authorization } from '../profile/Authorization';
import type { CurrentScreenProps } from '../contracts';
const images: Record<ProductDetailImageKey, string> = {
  'activate-account': activateAccount,
  'activate-token': activateToken,
  blocking,
  documents,
  'forgotten-credentials': credentials,
  'home-insurance': home,
  'hu-missing-secondary-identifier': identifier,
  'scan-qr-code': scan,
  'touch-face-id': biometric,
  'travel-insurance': travel,
};
export default function Detail(host: CurrentScreenProps) {
  const [step, setStep] = useState<'detail' | 'sign' | 'success'>('detail');
  const { title = 'Product', cardId, optionId } = host.route.params ?? {};
  const content = getProductDetailContent(optionId, cardId, title);
  const image = images[getProductDetailImageKey(optionId, cardId)];
  const width = useDemoViewport().width - 48;
  if (step === 'sign')
    return (
      <Authorization
        host={host}
        title={`Apply for ${title}`}
        actionLabel="Send request"
        onBack={() => setStep('detail')}
        onDone={() => setStep('success')}
      />
    );
  if (step === 'success')
    return (
      <Page
        host={{
          ...host,
          onBack: () => {
            setStep('detail');
            host.onBack();
          },
        }}
        title="Request sent"
      >
        <Heading host={host}>Request sent</Heading>
        <Body
          host={host}
        >{`We received your request for ${title}. You can follow it in My applications.`}</Body>
        <ActionButton
          tokens={host.tokens}
          label="Back to products"
          onPress={() => {
            setStep('detail');
            host.onBack();
          }}
        />
      </Page>
    );
  return (
    <Page host={host} title={title}>
      <Image
        source={typeof image === 'number' ? image : { uri: image }}
        resizeMode="cover"
        style={[s.image, { height: (width * 5) / 12 }]}
      />
      <Heading host={host}>{content.heading}</Heading>
      {content.body.map(paragraph => (
        <Body host={host} key={paragraph}>
          {paragraph}
        </Body>
      ))}
      <ActionButton
        tokens={host.tokens}
        label={getProductApplyLabel(cardId)}
        onPress={() => setStep('sign')}
      />
    </Page>
  );
}
const s = StyleSheet.create({ image: { width: '100%', borderRadius: 8 } });
