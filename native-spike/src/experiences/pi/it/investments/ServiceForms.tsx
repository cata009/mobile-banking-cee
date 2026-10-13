import React, { useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { Text } from '../../../../universal/Typography';
import {
  isValidMobileCode,
  investmentServicesDemoCode,
  validateInvestmentServiceMobileCode,
} from '@/features/investments/mobileFirstInvestmentServices';
import { FormField } from '../../../../universal/FormField';
import documentDownload from '@/assets/mobile-first/it/investments/services/imgNavigationAndActionDownloadT2.svg';
import {
  Button,
  Check,
  ServiceLink as Link,
  Rows,
  s,
  tokens,
} from './Primitives';
export function OriginalDocumentPreview({
  asset,
  label,
}: {
  asset: string | number;
  label: string;
}) {
  const [measuredWidth, setMeasuredWidth] = useState(0);
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.max(0, Math.min(measuredWidth, windowWidth - 32));
  return (
    <View
      style={styles.previewHost}
      onLayout={event => setMeasuredWidth(event.nativeEvent.layout.width)}
    >
      {width > 0 && (
        <Image
          source={typeof asset === 'number' ? asset : { uri: asset }}
          style={[styles.preview, styles.previewFrame, { width }]}
          resizeMode="contain"
          accessibilityLabel={label}
        />
      )}
    </View>
  );
}
export function ServiceDocument({
  title,
  rows,
  reviewed,
  onReview,
  image,
  onDownload,
}: {
  title: string;
  rows?: readonly { label: string; value: React.ReactNode }[];
  reviewed: boolean;
  onReview: () => void;
  image?: string | number;
  onDownload?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [ratio, setRatio] = useState(0.707);
  const [measuredWidth, setMeasuredWidth] = useState(0);
  const { width: windowWidth } = useWindowDimensions();
  const contentWidth = Math.max(0, Math.min(measuredWidth, windowWidth - 32));
  const documentWidth = Math.max(0, contentWidth - 34);
  const imageSource = typeof image === 'number' ? image : { uri: image };
  return (
    <View
      style={styles.document}
      onLayout={event => setMeasuredWidth(event.nativeEvent.layout.width)}
    >
      <Text style={s.heading}>{title}</Text>
      <Text style={s.body}>
        Ti raccomandiamo l’attenta lettura della documentazione e delle
        dichiarazioni contenute.
      </Text>
      {image && contentWidth > 0 && (
        <Image
          source={imageSource}
          style={[
            styles.preview,
            {
              width: contentWidth,
              height: Math.min(240, contentWidth / ratio),
            },
          ]}
          resizeMode="contain"
          accessibilityLabel={title}
        />
      )}
      <Link
        label={open ? 'CHIUDI IL DOCUMENTO' : 'APRI IL DOCUMENTO'}
        onPress={() => setOpen(!open)}
      />
      {open && (
        <View style={styles.openDocument}>
          {image && documentWidth > 0 ? (
            <Image
              source={imageSource}
              style={[
                styles.fullImage,
                { width: documentWidth, height: documentWidth / ratio },
              ]}
              resizeMode="contain"
              accessibilityLabel={`${title} - documento completo`}
              onLoad={event => {
                const source = event.nativeEvent.source;
                if (source.width > 0 && source.height > 0)
                  setRatio(source.width / source.height);
              }}
            />
          ) : !image ? (
            <Rows rows={rows ?? []} />
          ) : null}
          <Check
            label="Ho preso visione del documento"
            value={reviewed}
            onPress={() => {
              if (!reviewed) onReview();
            }}
          />
        </View>
      )}
      {image && onDownload && (
        <Link
          label="SALVA IL DOCUMENTO"
          onPress={onDownload}
          icon={documentDownload}
          anchor
        />
      )}
      {reviewed && (
        <Text accessibilityRole="alert" style={[s.body, s.positive]}>
          Documento consultato
        </Text>
      )}
    </View>
  );
}
export function ServiceMobileCode({
  onConfirm,
}: {
  onConfirm: (code: string) => void;
}) {
  const [code, setCode] = useState('');
  const [help, setHelp] = useState(false);
  const [error, setError] = useState('');
  const change = (value: string) => {
    setCode(value.replace(/\D/g, '').slice(0, 5));
    setError('');
  };
  return (
    <>
      <Text style={s.body}>Inserisci il tuo</Text>
      <Text style={s.heading}>Mobile Code</Text>
      <FormField
        tokens={tokens}
        label="Inserisci il tuo PIN"
        value={code}
        onChange={change}
        labelStyle={s.body}
        inputProps={{
          accessibilityLabel: 'Mobile Code',
          secureTextEntry: true,
          keyboardType: 'number-pad',
          maxLength: 5,
          style: styles.code,
        }}
      />
      <Text style={s.small}>
        Per questa demo usa il Mobile Code {investmentServicesDemoCode}.
      </Text>
      {!!error && (
        <Text accessibilityRole="alert" style={s.error}>
          {error}
        </Text>
      )}
      <View style={styles.keypad}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map(value => (
          <Pressable
            key={value}
            accessibilityRole="button"
            accessibilityLabel={`Cifra ${value}`}
            style={styles.key}
            onPress={() => change(code + value)}
          >
            <Text style={s.heading}>{value}</Text>
          </Pressable>
        ))}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cancella cifra"
          style={styles.key}
          onPress={() => change(code.slice(0, -1))}
        >
          <Text style={s.heading}>⌫</Text>
        </Pressable>
      </View>
      <Link
        label="Ho dimenticato il Mobile Code"
        onPress={() => setHelp(!help)}
      />
      {help && (
        <Text accessibilityRole="alert" style={s.body}>
          Puoi reimpostare il Mobile Code dalla sezione Mobile Token del tuo
          profilo.
        </Text>
      )}
      <Button
        label="Conferma"
        disabled={!isValidMobileCode(code)}
        onPress={() => {
          const issue = validateInvestmentServiceMobileCode(code);
          if (issue) setError(issue);
          else onConfirm(code);
        }}
      />
    </>
  );
}
const styles = StyleSheet.create({
  document: {
    gap: 16,
    paddingVertical: 16,
    alignSelf: 'stretch',
    minWidth: 0,
    maxWidth: '100%',
  },
  openDocument: {
    alignSelf: 'stretch',
    minWidth: 0,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
    gap: 16,
  },
  preview: {
    alignSelf: 'center',
    backgroundColor: '#f5f5f5',
    marginVertical: 16,
  },
  fullImage: { alignSelf: 'center' },
  previewHost: { minWidth: 0, alignSelf: 'stretch', minHeight: 240 },
  previewFrame: { height: 240 },
  code: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  key: {
    width: '28%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
