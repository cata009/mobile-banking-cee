import React, { useState, useSyncExternalStore } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import { AssetGlyph } from '../../../../universal/AssetGlyph';
import { mobileFirstTokens as tokens } from '../../../../universal/tokens';
import { profileSettingsAssets as a } from '@/experiences/pi/it/mobile-first/profileSettingsAssets';
import { shareDemoFile } from '../../../../platform/nativeFiles';
import { ModelTextEncoder } from '../../../../platform/modelGlobals';
import CardArt from '../cards/CardArt';
import SettingsDocument from './SettingsDocument';
import { ITALY_CARDS } from '@/experiences/pi/it/mobile-first/cardsContent';
import {
  changeCredential,
  credentialError,
  createProfileMobileCode,
  effectiveProfileSignature,
  filterAccesses,
  profileSettingsStore,
  sendProfileAccessHistory,
  transitionProfileSignature,
  validProfileContact,
} from '@/features/profile/mobileFirstProfileSettings';
import {
  MOBILE_CODE_RULES,
  PIN_RULES,
  SETTINGS_RESULTS,
} from '@/experiences/pi/it/mobile-first/profileSettingsContent';
import {
  Authorize,
  Button,
  Choice,
  Copy,
  ErrorText,
  Fact,
  Field,
  DateInput,
  Page,
  Result,
  Row,
  Title,
  Toggle,
  type ScreenNavigation,
} from './Primitives';
const accesses = Array.from({ length: 14 }, (_, index) => ({
  id: String(index),
  date: index < 7 ? '2025-01-20' : '2024-12-20',
  time: '15:05:13',
  channel: index % 2 ? 'Web' : 'App',
}));
function SecurityAction({
  label,
  edit = false,
  badge,
  active = false,
}: {
  label: string;
  edit?: boolean;
  badge?: string;
  active?: boolean;
}) {
  return (
    <View style={sec.action}>
      <View style={sec.actionLabel}>
        <Text style={sec.actionText}>{label}</Text>
        <AssetGlyph asset={edit ? a.edit : a.forth} size={16} />
      </View>
      {badge && (
        <Text style={[sec.badge, active && sec.activeBadge]}>{badge}</Text>
      )}
    </View>
  );
}
export default function Security({
  route,
  onBack,
  onClose,
  onNavigate,
  onChanged,
}: ScreenNavigation) {
  const settings = useSyncExternalStore(
    profileSettingsStore.subscribe,
    profileSettingsStore.getSnapshot,
  );
  const initial =
    route.id === 'forgot-mobile-code'
      ? 'create-contacts'
      : route.id === 'digital-signature'
        ? 'signature-menu'
        : route.id === 'access-history'
          ? 'accesses'
          : route.id === 'screenshots'
            ? 'screenshots'
            : route.id === 'pin' || route.id === 'mobile-code'
              ? 'credential'
              : 'security';
  const [view, setView] = useState(initial);
  const [kind, setKind] = useState<'pin' | 'mobile'>(
    route.id === 'mobile-code' ? 'mobile' : 'pin',
  );
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [repeat, setRepeat] = useState('');
  const [screenshots, setScreenshots] = useState(settings.screenshots);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [pending, setPending] = useState<() => void>(() => () => {});
  const [returnView, setReturnView] = useState('security');
  const [cardBlock, setCardBlock] = useState('');
  const [contactKind, setContactKind] = useState<'email' | 'phone'>('email');
  const [contact, setContact] = useState('');
  const [code, setCode] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [channel, setChannel] = useState('Tutti');
  const [appliedFilters, setAppliedFilters] = useState({
    from: '',
    to: '',
    channel: 'Tutti',
  });
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [showEmail, setShowEmail] = useState(true);
  const [contactReturn, setContactReturn] = useState('create-contacts');
  const [signatureAction, setSignatureAction] = useState<
    'Attiva' | 'Sospesa' | 'Revocata'
  >('Attiva');
  const signature = effectiveProfileSignature(
    settings.signature,
    settings.signatureSuspendedAt,
  );
  const done = (message: string) => {
    onChanged();
    setNotice(message);
    setError(null);
    setView('result');
  };
  const auth = (action: () => void) => {
    setPending(() => action);
    setReturnView(view);
    setView('auth');
  };
  const back = () => {
    setError(null);
    if (view === initial || view === 'security') onBack();
    else setView('security');
  };
  if (view === 'auth')
    return (
      <Authorize
        onBack={() => setView(returnView)}
        onClose={onClose}
        onSuccess={pending}
        onForgot={() =>
          onNavigate({ area: 'settings', id: 'forgot-mobile-code' })
        }
      />
    );
  if (view === 'result')
    return (
      <Result
        variant="settings"
        title={notice}
        body={
          notice === 'Storico accessi inviato con successo!'
            ? 'Simulazione completata. Nessuna email è stata inviata dalla demo.'
            : SETTINGS_RESULTS[notice]
        }
        onClose={onClose}
        onContinue={() => setView('security')}
      />
    );
  if (view === 'screenshots')
    return (
      <Page
        title="Screenshot"
        onBack={back}
        onClose={onClose}
        footer={
          <Button
            onPress={() => {
              profileSettingsStore.update({ screenshots });
              done('Modifiche salvate');
            }}
          >
            Salva le modifiche
          </Button>
        }
      >
        <Copy>
          Da questa pagina puoi abilitare o disabilitare gli screenshot delle
          schermate dell’App sul tuo dispositivo.
        </Copy>
        <Copy>
          Ricorda che, abilitando gli screenshot, non sarà possibile oscurare i
          dati dell’App quando non è in primo piano (background).
        </Copy>
        <Toggle
          label="Abilita screenshot"
          value={screenshots}
          onChange={setScreenshots}
        />
      </Page>
    );
  if (view === 'mobile-menu')
    return (
      <Page
        title="Mobile Code"
        onBack={back}
        onClose={onClose}
        contentGap={0}
        titleSpacing={40}
      >
        <Row label="Creazione" onPress={() => setView('create-contacts')} />
        <Row
          label="Modifica"
          last
          onPress={() => {
            setKind('mobile');
            setCurrent('');
            setNext('');
            setRepeat('');
            setView('credential');
          }}
        />
      </Page>
    );
  if (view === 'credential')
    return (
      <Page
        title={kind === 'pin' ? 'Modifica PIN' : 'Modifica il Mobile Code'}
        onBack={back}
        onClose={onClose}
        footer={
          <Button
            disabled={!current || !next || !repeat}
            onPress={() => {
              const issue = credentialError(kind, current, next, repeat);
              setError(issue);
              if (issue) return;
              const apply = () => {
                const changeIssue = changeCredential(
                  kind,
                  current,
                  next,
                  repeat,
                );
                if (changeIssue) {
                  setError(changeIssue);
                  setView('credential');
                } else
                  done(
                    kind === 'pin'
                      ? 'Codice PIN modificato con successo!'
                      : 'Mobile Code modificato con successo!',
                  );
              };
              if (kind === 'pin') auth(apply);
              else apply();
            }}
          >
            Salva le modifiche
          </Button>
        }
      >
        {kind === 'mobile' && (
          <Copy>
            Il Mobile Code ti permette di generare password monouso con cui
            autorizzare le operazioni dall’App.
          </Copy>
        )}
        <Field
          label={
            kind === 'pin'
              ? 'Inserisci PIN attuale'
              : 'Inserisci attuale Mobile Code'
          }
          value={current}
          onChange={setCurrent}
          secureTextEntry
          keyboardType="number-pad"
        />
        <Field
          label={
            kind === 'pin'
              ? 'Inserisci nuovo PIN'
              : 'Inserisci il nuovo Mobile Code'
          }
          value={next}
          onChange={setNext}
          secureTextEntry
          keyboardType="number-pad"
        />
        <Field
          label={
            kind === 'pin'
              ? 'Conferma il nuovo PIN'
              : 'Conferma il nuovo Mobile Code'
          }
          value={repeat}
          onChange={setRepeat}
          secureTextEntry
          keyboardType="number-pad"
        />
        <ErrorText error={error} />
        <Title>{`Il tuo nuovo ${
          kind === 'pin' ? 'PIN' : 'Mobile Code'
        } deve:`}</Title>
        {(kind === 'pin' ? PIN_RULES : MOBILE_CODE_RULES).map(rule => (
          <Copy key={rule}>{`• ${rule}`}</Copy>
        ))}
      </Page>
    );
  if (view === 'create-contacts')
    return (
      <Page
        title="Creazione di un nuovo Mobile Code"
        onBack={back}
        onClose={onClose}
        footer={
          <Button
            disabled={!settings.emailVerified || !settings.phoneVerified}
            onPress={() => setView('create-card')}
          >
            Conferma
          </Button>
        }
      >
        <Copy>1 / 2 · Verifica dati</Copy>
        <Copy>
          Per ricevere il nuovo Mobile Code, verifica o conferma il tuo
          indirizzo email e il numero di cellulare.
        </Copy>
        <Row
          label="Email"
          value={settings.email}
          detail={settings.emailVerified ? 'Verificato' : 'Da verificare'}
          onPress={() => {
            setContactKind('email');
            setContact('');
            setView('contact');
          }}
        />
        <Row
          label="Numero di cellulare"
          value={settings.phone}
          detail={settings.phoneVerified ? 'Verificato' : 'Da verificare'}
          onPress={() => {
            setContactKind('phone');
            setContact('');
            setView('contact');
          }}
        />
        <Fact label="Operatore telefonico">{settings.operator}</Fact>
      </Page>
    );
  if (view === 'contact')
    return (
      <Page
        title={
          contactKind === 'email'
            ? 'Modifica email'
            : 'Modifica numero di cellulare'
        }
        onBack={() => setView(contactReturn)}
        onClose={onClose}
        footer={
          <Button
            onPress={() => {
              if (!validProfileContact(contactKind, contact)) {
                setError('Inserisci un recapito valido.');
                return;
              }
              setError(null);
              setCode('');
              setView('contact-code');
            }}
          >
            Invia codice di verifica
          </Button>
        }
      >
        <Field
          label={contactKind === 'email' ? 'Email' : 'Numero di cellulare'}
          value={contact}
          onChange={setContact}
          keyboardType={contactKind === 'email' ? 'email-address' : 'phone-pad'}
          autoCapitalize="none"
        />
        <ErrorText error={error} />
      </Page>
    );
  if (view === 'contact-code')
    return (
      <Page
        title="Verifica recapito"
        onBack={() => setView('contact')}
        onClose={onClose}
        footer={
          <Button
            onPress={() => {
              if (code !== '123456') {
                setError('Il codice di verifica non è corretto.');
                return;
              }
              profileSettingsStore.update(
                contactKind === 'email'
                  ? { email: contact, emailVerified: true }
                  : { phone: contact, phoneVerified: true },
              );
              onChanged();
              setError(null);
              setView(contactReturn);
            }}
          >
            Verifica
          </Button>
        }
      >
        <Copy>Inserisci il codice ricevuto sul recapito indicato.</Copy>
        <Field
          label="Codice di verifica"
          value={code}
          onChange={setCode}
          keyboardType="number-pad"
          maxLength={6}
        />
        <ErrorText error={error} />
      </Page>
    );
  if (view === 'create-card')
    return (
      <Page
        title="Creazione di un nuovo Mobile Code"
        onBack={() => setView('create-contacts')}
        onClose={onClose}
        footer={
          <Button
            onPress={() => {
              const issue = createProfileMobileCode(cardBlock);
              setError(issue);
              if (!issue) done('Mobile Code creato con successo!');
            }}
          >
            Conferma
          </Button>
        }
      >
        <Copy>2 / 2 · Conferma</Copy>
        <CardArt
          card={{ ...ITALY_CARDS[1], name: 'UniCredit Genius Card' }}
          hidden={false}
          mini
        />
        <Copy>
          Per sicurezza inserisci il penultimo blocco di quattro cifre della tua
          carta.
        </Copy>
        <Field
          label="Penultimo blocco di quattro cifre"
          value={cardBlock}
          onChange={value => setCardBlock(value.replace(/\D/g, ''))}
          keyboardType="number-pad"
          maxLength={4}
        />
        <ErrorText error={error} />
      </Page>
    );
  if (view === 'signature-menu')
    return (
      <Page title="Firma digitale" onBack={back} onClose={onClose}>
        <Fact label="Stato certificato">{signature}</Fact>
        {signature !== 'Attiva' && (
          <Row
            label={signature === 'Sospesa' ? 'Riattiva' : 'Attiva'}
            onPress={() => {
              setSignatureAction('Attiva');
              setView('signature-doc');
            }}
          />
        )}
        {signature === 'Attiva' && (
          <Row
            label="Sospendi"
            onPress={() => {
              setSignatureAction('Sospesa');
              setView('signature-doc');
            }}
          />
        )}
        {signature !== 'Revocata' && signature !== 'Non attiva' && (
          <Row
            label="Revoca"
            onPress={() => {
              setSignatureAction('Revocata');
              setView('signature-doc');
            }}
          />
        )}
      </Page>
    );
  if (view === 'signature-doc' && signatureAction === 'Attiva')
    return (
      <SettingsDocument
        key="signature-certificate"
        title="Richiesta di certificato per la firma digitale"
        body="L’emissione del certificato è gratuita ed è regolata dal Manuale Operativo del certificatore In.Te.S.A. S.p.A. UniCredit comunica nome, cognome, codice fiscale e data di nascita al certificatore, che li tratta come titolare autonomo. Ho preso visione del Manuale Operativo e richiedo la Firma Digitale."
        onBack={() => setView('signature-menu')}
        onClose={onClose}
        onAccept={() =>
          auth(() => {
            transitionProfileSignature('Attiva');
            done('Certificato attivato correttamente!');
          })
        }
      />
    );
  if (view === 'signature-doc')
    return (
      <Page
        title={
          signatureAction === 'Sospesa'
            ? 'Sei sicuro di voler sospendere il certificato di Firma digitale?'
            : 'Sei sicuro di voler revocare il certificato di Firma digitale?'
        }
        onBack={() => setView('signature-menu')}
        onClose={onClose}
        footer={
          <Button
            onPress={() =>
              auth(() => {
                transitionProfileSignature(signatureAction);
                done(
                  signatureAction === 'Sospesa'
                    ? 'Certificato sospeso correttamente'
                    : 'Certificato revocato correttamente',
                );
              })
            }
          >
            {signatureAction === 'Sospesa' ? 'Sospendi' : 'Revoca'}
          </Button>
        }
      >
        <Copy>
          Le firme già apposte rimangono valide e i documenti sono conservati
          dalla banca e dal certificatore.
        </Copy>
        <Copy>
          {signatureAction === 'Sospesa'
            ? 'Prima di firmare nuovi documenti dovrai riattivare il certificato. Se non lo riattivi entro 90 giorni, il certificato sarà revocato.'
            : 'Per firmare nuovi documenti sarà necessario richiedere un nuovo certificato.'}
        </Copy>
        <Button secondary onPress={() => setView('signature-menu')}>
          Annulla
        </Button>
      </Page>
    );
  if (view === 'history-filter')
    return (
      <Page
        title="Filtri storico accessi"
        onBack={() => setView('accesses')}
        onClose={onClose}
        footer={
          <Button
            onPress={() => {
              if (from && to && from > to) {
                setError('La data iniziale deve precedere la data finale.');
                return;
              }
              setFiltersApplied(true);
              setAppliedFilters({ from, to, channel });
              setError(null);
              setView('accesses');
            }}
          >
            Applica filtri
          </Button>
        }
      >
        <DateInput label="Dal" value={from} onChange={setFrom} />
        <DateInput label="Al" value={to} onChange={setTo} />
        <Choice
          label="Canale"
          value={channel}
          options={['Tutti', 'App', 'Web']}
          onChange={setChannel}
        />
        <ErrorText error={error} />
        <Button
          secondary
          onPress={() => {
            setFrom('');
            setTo('');
            setChannel('Tutti');
            setFiltersApplied(false);
            setAppliedFilters({ from: '', to: '', channel: 'Tutti' });
            setError(null);
            setView('accesses');
          }}
        >
          Rimuovi filtri
        </Button>
      </Page>
    );
  if (view === 'accesses') {
    const visible = filterAccesses(
      accesses,
      appliedFilters.from,
      appliedFilters.to,
      appliedFilters.channel,
    );
    return (
      <Page
        title={filtersApplied ? 'Risultati di ricerca' : 'Storico accessi'}
        onBack={back}
        onClose={onClose}
        description="Da questa pagina puoi visualizzare l’elenco degli accessi al servizio di Banca Multicanale."
        footer={
          <Button onPress={() => setView('access-email')}>Invia storico</Button>
        }
      >
        <Button
          secondary
          onPress={() => {
            setFrom(appliedFilters.from);
            setTo(appliedFilters.to);
            setChannel(appliedFilters.channel);
            setView('history-filter');
          }}
        >
          Filtra accessi
        </Button>
        {filtersApplied && (
          <Copy>{`Filtri applicati: ${appliedFilters.from || 'Inizio'} - ${
            appliedFilters.to || 'Oggi'
          } · ${appliedFilters.channel}`}</Copy>
        )}
        {visible.map(item => (
          <Row
            key={item.id}
            label={item.channel}
            detail={`${item.date} - ${item.time}`}
          />
        ))}
        {!visible.length && (
          <Copy>Nessun accesso nel periodo selezionato.</Copy>
        )}
      </Page>
    );
  }
  if (view === 'access-email')
    return (
      <Page
        title="Invia storico via email"
        onBack={() => setView('accesses')}
        onClose={onClose}
        footer={
          <Button
            onPress={() => {
              const issue = sendProfileAccessHistory(
                settings.email,
                filterAccesses(
                  accesses,
                  appliedFilters.from,
                  appliedFilters.to,
                  appliedFilters.channel,
                ).length,
              );
              setError(issue);
              if (!issue) done('Storico accessi inviato con successo!');
            }}
          >
            Invia storico
          </Button>
        }
      >
        <View style={sec.emailRow}>
          <View style={sec.grow}>
            <View style={sec.emailHeading}>
              <Copy>Email</Copy>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  showEmail ? 'Nascondi email' : 'Mostra email'
                }
                onPress={() => setShowEmail(!showEmail)}
                style={sec.control}
              >
                <AssetGlyph asset={a.emailEye} size={24} />
              </Pressable>
            </View>
            <Copy>{showEmail ? settings.email : '••••••'}</Copy>
          </View>
          <Button
            secondary
            onPress={() => {
              setContactReturn('access-email');
              setContactKind('email');
              setContact('');
              setCode('');
              setView('contact');
            }}
          >
            Modifica email
          </Button>
        </View>
        <Copy muted>
          {settings.emailVerified ? 'Verificato' : 'Da verificare'}
        </Copy>
        <ErrorText error={error} />
        <Button
          secondary
          onPress={() => {
            const value = filterAccesses(
              accesses,
              appliedFilters.from,
              appliedFilters.to,
              appliedFilters.channel,
            )
              .map(item => `${item.date} ${item.time} ${item.channel}`)
              .join('\n');
            shareDemoFile(
              'storico-accessi.txt',
              'text/plain',
              new ModelTextEncoder().encode(value),
            ).catch(issue =>
              setError(
                issue instanceof Error
                  ? issue.message
                  : 'Esportazione non disponibile.',
              ),
            );
          }}
        >
          Scarica storico
        </Button>
      </Page>
    );
  return (
    <Page
      title="Sicurezza"
      onBack={onBack}
      onClose={onClose}
      contentGap={0}
      titleSpacing={40}
    >
      <Row
        kind="settings-security"
        label="PIN"
        trailing={<SecurityAction label="MODIFICA" edit />}
        onPress={() => {
          setKind('pin');
          setCurrent('');
          setNext('');
          setRepeat('');
          setView('credential');
        }}
      />
      <Row
        kind="settings-security"
        label="Mobile Code"
        trailing={<SecurityAction label="GESTISCI" />}
        onPress={() => setView('mobile-menu')}
      />
      <Row
        kind="settings-security"
        label="Screenshot"
        trailing={
          <SecurityAction
            label="MODIFICA"
            edit
            badge={settings.screenshots ? 'Abilitato' : 'Disabilitato'}
            active={settings.screenshots}
          />
        }
        onPress={() => setView('screenshots')}
      />
      <Row
        kind="settings-security"
        label="Check up sicurezza"
        trailing={<SecurityAction label="VISUALIZZA" />}
        onPress={() => onNavigate({ area: 'security' })}
      />
      <Row
        kind="settings-security"
        label="Storico accessi"
        trailing={<SecurityAction label="VISUALIZZA" />}
        onPress={() => setView('accesses')}
      />
      <Row
        kind="settings-security"
        label="Firma digitale"
        last
        trailing={
          <SecurityAction
            label="MODIFICA"
            edit
            badge={signature}
            active={signature === 'Attiva'}
          />
        }
        onPress={() => setView('signature-menu')}
      />
    </Page>
  );
}
const sec = StyleSheet.create({
  action: { alignItems: 'flex-end', gap: 8 },
  actionLabel: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: {
    fontFamily: tokens.strongFont,
    fontSize: 14,
    lineHeight: 18,
    color: '#007a91',
  },
  badge: {
    fontFamily: tokens.font,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#ffc000',
    fontSize: 14,
    lineHeight: 18,
    color: '#262626',
  },
  activeBadge: { backgroundColor: '#3c8446', color: '#fff' },
  emailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  grow: { flex: 1, minWidth: 0 },
  emailHeading: { flexDirection: 'row', alignItems: 'center' },
  control: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
