import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  canAcceptProfileDocument,
  createProfilePdf,
} from '@/features/profile/mobileFirstProfileSettings';
import { profileSettingsAssets as a } from '@/experiences/pi/it/mobile-first/profileSettingsAssets';
import { AssetGlyph } from '../../../../universal/AssetGlyph';
import { shareDemoFile } from '../../../../platform/nativeFiles';
import { Button, Copy, ErrorText, Page, Title, Toggle } from './Primitives';
export default function SettingsDocument({
  title,
  body,
  onBack,
  onClose,
  onAccept,
}: {
  title: string;
  body: string;
  onBack: () => void;
  onClose: () => void;
  onAccept: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');
  const [paperWidth, setPaperWidth] = useState(343);
  const privacyDocument = title === 'Documento Consensi Privacy';
  const certificateDocument =
    title.includes('certificato') || title.startsWith('Per firmare');
  const paperImage = privacyDocument
    ? a.privacyDocument
    : title.toLowerCase().includes('limiti')
    ? a.limitsDocument
    : title.includes('collegamento')
    ? a.relationshipDocument
    : undefined;
  const canAccept = canAcceptProfileDocument({
    seen,
    accepted,
    certificateDocument,
  });
  return (
    <Page
      title={title}
      onBack={onBack}
      onClose={onClose}
      footer={
        <Button
          disabled={!canAccept}
          onPress={() => {
            if (
              canAcceptProfileDocument({ seen, accepted, certificateDocument })
            )
              onAccept();
          }}
        >
          Accetta e prosegui
        </Button>
      }
    >
      <Copy>
        {privacyDocument
          ? 'Dichiaro di aver preso visione dell’Informativa privacy e di confermare la volontà espressa in merito ai consensi al trattamento dei dati personali.'
          : 'Prima di procedere, è necessario prendere visione del documento.'}
      </Copy>
      <View
        style={[d.paper, paperImage && d.imagePaper]}
        onLayout={event => setPaperWidth(event.nativeEvent.layout.width)}
      >
        {paperImage ? (
          <AssetGlyph
            asset={paperImage}
            width={paperWidth}
            height={(paperWidth * 2339) / 1654}
            fit="contain"
          />
        ) : (
          <>
            {!certificateDocument && <Copy strong>FACSIMILE</Copy>}
            <Copy>{body}</Copy>
          </>
        )}
      </View>
      {!certificateDocument && (
        <Button
          secondary
          onPress={() => {
            setOpen(true);
            setSeen(true);
            if (privacyDocument) setAccepted(true);
          }}
        >
          Visualizza il documento PDF
        </Button>
      )}
      {open && (
        <View accessibilityLabel="Documento PDF" style={d.viewer}>
          <Title>{title}</Title>
          <Copy>{body}</Copy>
          <Button
            secondary
            onPress={() => {
              shareDemoFile(
                'documento-consensi.pdf',
                'application/pdf',
                createProfilePdf(title, body),
              ).catch(issue =>
                setError(
                  issue instanceof Error
                    ? issue.message
                    : 'Condivisione non disponibile.',
                ),
              );
            }}
          >
            Condividi documento
          </Button>
          <Button secondary onPress={() => setOpen(false)}>
            Chiudi documento
          </Button>
        </View>
      )}
      {!privacyDocument && (
        <Toggle
          label={
            certificateDocument
              ? 'Ho preso visione del Manuale Operativo e richiedo la Firma Digitale'
              : 'Confermo di aver preso visione'
          }
          value={accepted}
          onChange={setAccepted}
        />
      )}
      <ErrorText error={error} />
    </Page>
  );
}
const d = StyleSheet.create({
  paper: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    minHeight: 180,
    padding: 24,
    gap: 16,
    marginVertical: 24,
  },
  imagePaper: {
    padding: 0,
    borderWidth: 0,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  viewer: {
    gap: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fafafa',
    marginVertical: 16,
  },
});
