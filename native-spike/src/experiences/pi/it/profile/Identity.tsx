import React, { useState, useSyncExternalStore } from 'react';
import {
  getIdentityDocumentsSnapshot,
  subscribeProfileData,
  identityStatus,
  saveIdentityDocument,
  validateIdentityDocument,
  type IdentityDocument,
} from '@/features/profile/mobileFirstProfileData';
import { documentTypes } from '@/experiences/pi/it/mobile-first/profileDataContent';
import { profileDataAssets as a } from '@/experiences/pi/it/mobile-first/profileDataAssets';
import { AssetGlyph } from '../../../../universal/AssetGlyph';
import {
  Authorize,
  Button,
  Check,
  Choice,
  Copy,
  ErrorText,
  Fact,
  Field,
  Page,
  Result,
  Title,
  type ScreenNavigation,
} from './Primitives';
import { DocumentCards } from './DataElements';
const blank = (): IdentityDocument => ({
  id: `document-${Date.now()}`,
  type: documentTypes[1],
  number: '',
  issued: '',
  expires: '',
  country: 'Italia',
  city: '',
  province: '',
});
export default function Identity({
  route,
  onBack,
  onClose,
  onNavigate,
  onChanged,
}: ScreenNavigation) {
  const documents = useSyncExternalStore(
    subscribeProfileData,
    getIdentityDocumentsSnapshot,
  );
  const initial = documents.find(item => item.id === route.id);
  const [phase, setPhase] = useState(initial ? 'detail' : 'list');
  const [document, setDocument] = useState<IdentityDocument>(() =>
    initial ? { ...initial } : blank(),
  );
  const [error, setError] = useState('');
  const [captureHelp, setCaptureHelp] = useState(false);
  const set = (key: keyof IdentityDocument, value: string) => {
    setDocument(current => ({ ...current, [key]: value }));
    setError('');
  };
  if (phase === 'success')
    return (
      <Result
        title="Il tuo documento è stato aggiornato"
        body="Il tuo documento è stato aggiornato ed è in corso di validità."
        onClose={onClose}
        onContinue={() => setPhase('list')}
      />
    );
  if (phase === 'auth')
    return (
      <Authorize
        onBack={() => setPhase('form')}
        onClose={onClose}
        onSuccess={() => {
          const issue = saveIdentityDocument(document);
          if (issue) {
            setError(issue);
            setPhase('form');
          } else {
            onChanged();
            setPhase('success');
          }
        }}
        onForgot={() =>
          onNavigate({ area: 'settings', id: 'forgot-mobile-code' })
        }
      />
    );
  if (phase === 'detail')
    return (
      <Page
        title={document.type}
        onBack={() => setPhase('list')}
        onClose={onClose}
        footer={<Button onPress={() => setPhase('type')}>Aggiorna</Button>}
      >
        {[
          ['Numero di documento', document.number],
          ['Stato', identityStatus(document)],
          ['Data di rilascio', document.issued],
          ['Data di scadenza', document.expires],
          ['Rilasciato da', 'Comune'],
          ['Stato', document.country],
          ['Località di rilascio', document.city],
          ['Provincia di rilascio', document.province],
        ].map(([label, value], index) => (
          <Fact key={index} label={label}>
            {value}
          </Fact>
        ))}
      </Page>
    );
  if (phase === 'type')
    return (
      <Page
        title="Seleziona la tipologia di documento"
        onBack={() => setPhase('list')}
        onClose={onClose}
        footer={
          <Button onPress={() => setPhase('instructions')}>Conferma</Button>
        }
      >
        {documentTypes.map(type => (
          <Check
            key={type}
            radio
            label={type}
            value={document.type === type}
            onChange={() => set('type', type)}
          />
        ))}
        <Button secondary onPress={() => onNavigate({ area: 'appointments' })}>
          Fissa un appuntamento
        </Button>
      </Page>
    );
  if (phase === 'instructions')
    return (
      <Page
        title="Aggiorna il tuo documento di identità"
        onBack={() => setPhase('type')}
        onClose={onClose}
        footer={
          <Button onPress={() => setPhase('capture-front')}>
            Scatta una foto
          </Button>
        }
      >
        <Title>Scatta una foto</Title>
        <Copy>Puoi scattare una foto.</Copy>
        <Title>Controlla la validità</Title>
        <Copy>
          Controlla la data di validità del documento e che sia integro e
          leggibile.
        </Copy>
        <Title>Controlla la qualità del file</Title>
        <Copy>Se fai una foto assicurati che sia a fuoco.</Copy>
        <Button secondary onPress={() => setCaptureHelp(!captureHelp)}>
          Informazioni sulla foto
        </Button>
        {captureHelp && (
          <Copy>
            Il documento deve essere stato rilasciato da un’autorità italiana ed
            essere in corso di validità e non prossimo alla scadenza. Sono
            ammesse immagini scattate sul momento o caricate dal device oppure
            PDF a colori.
          </Copy>
        )}
      </Page>
    );
  if (phase === 'capture-front' || phase === 'capture-back')
    return (
      <Page
        title="Aggiorna il tuo documento di identità"
        onBack={() =>
          setPhase(phase === 'capture-back' ? 'capture-front' : 'instructions')
        }
        onClose={onClose}
        footer={
          <Button
            onPress={() =>
              setPhase(phase === 'capture-front' ? 'capture-back' : 'preview')
            }
          >
            Scatta una foto
          </Button>
        }
      >
        <Copy>{`Scatta la fotografia del ${
          phase === 'capture-front' ? 'fronte' : 'retro'
        } del documento.`}</Copy>
        <AssetGlyph asset={a.capture} width={343} height={248} fit="contain" />
        <Button
          secondary
          onPress={() =>
            setPhase(phase === 'capture-front' ? 'capture-back' : 'preview')
          }
        >
          Carica immagine o PDF
        </Button>
      </Page>
    );
  if (phase === 'preview')
    return (
      <Page
        title="Controlla le fotografie"
        onBack={() => setPhase('capture-back')}
        onClose={onClose}
        footer={
          <>
            <Button onPress={() => setPhase('form')}>Conferma</Button>
            <Button secondary onPress={() => setPhase('capture-front')}>
              Riprova
            </Button>
          </>
        }
      >
        <AssetGlyph asset={a.capture} width={343} height={210} />
        <AssetGlyph asset={a.capture} width={343} height={210} />
      </Page>
    );
  if (phase === 'nfc' || phase === 'nfc-read' || phase === 'nfc-complete')
    return (
      <Page
        title="Segui le istruzioni per leggere il chip con NFC del tuo smartphone"
        onBack={() => setPhase('form')}
        onClose={onClose}
        footer={
          <Button
            onPress={() =>
              setPhase(
                phase === 'nfc'
                  ? 'nfc-read'
                  : phase === 'nfc-read'
                  ? 'nfc-complete'
                  : 'auth',
              )
            }
          >
            {phase === 'nfc' ? 'Inizia' : 'Continua'}
          </Button>
        }
      >
        <Copy>
          Premi il tasto inizia, avvicina il tuo smartphone al chip della carta
          di identità e attendi che la lettura sia completata.
        </Copy>
        <AssetGlyph asset={a.nfc} width={300} height={300} />
        {phase !== 'nfc' && (
          <Copy>
            {phase === 'nfc-read'
              ? 'Lettura in corso — 50%. Mantieni il dispositivo fermo ancora per qualche secondo.'
              : 'Lettura completata — 100%'}
          </Copy>
        )}
        <Button secondary onPress={() => setPhase('auth')}>
          Il mio smartphone non supporta NFC
        </Button>
      </Page>
    );
  if (phase === 'form')
    return (
      <Page
        title="Compila dati documento"
        onBack={() => setPhase('preview')}
        onClose={onClose}
        footer={
          <Button
            onPress={() => {
              const issue = validateIdentityDocument(document);
              if (issue) setError(issue);
              else
                setPhase(
                  document.type === 'Carta d’identità elettronica'
                    ? 'nfc'
                    : 'auth',
                );
            }}
          >
            Conferma
          </Button>
        }
      >
        <Fact label="Tipologia">{document.type}</Fact>
        <Field
          label="Numero documento"
          value={document.number}
          onChange={value => set('number', value.toUpperCase())}
          autoCapitalize="characters"
        />
        <Field
          label="Inserisci la data di rilascio"
          value={document.issued}
          onChange={value => set('issued', value)}
          placeholder="AAAA-MM-GG"
        />
        <Field
          label="Inserisci la data di scadenza"
          value={document.expires}
          onChange={value => set('expires', value)}
          placeholder="AAAA-MM-GG"
        />
        <Choice
          label="Stato"
          value={document.country}
          options={['Italia', 'Ente Italiano all’estero']}
          onChange={value => set('country', value)}
        />
        <Field
          label="Località di rilascio"
          value={document.city}
          onChange={value => set('city', value)}
        />
        <Choice
          label="Provincia di rilascio"
          value={document.province}
          onChange={value => set('province', value)}
          options={['MI', 'RM', 'TO', 'NA', 'BO', 'FI', 'VE', 'Altro']}
        />
        <ErrorText error={error} />
      </Page>
    );
  return (
    <Page
      title="Documenti d’identità"
      onBack={onBack}
      onClose={onClose}
      footer={
        <Button
          onPress={() => {
            setDocument(blank());
            setPhase('type');
          }}
        >
          Carica documento
        </Button>
      }
    >
      <DocumentCards
        documents={documents}
        onSelect={item => {
          setDocument({ ...item });
          setPhase('detail');
        }}
      />
    </Page>
  );
}
