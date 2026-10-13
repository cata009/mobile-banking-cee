import React, { useState, useSyncExternalStore } from 'react';
import { View } from 'react-native';
import {
  categoryNotificationError,
  profileSettingsStore,
  saveProfileNotificationPreferences,
  switchProfileNotificationsToPush,
  transitionProfileSignature,
  validProfileContact,
} from '@/features/profile/mobileFirstProfileSettings';
import {
  CATEGORIES,
  NOTIFICATION_EVENTS,
  NOTIFICATION_GROUPS,
  PRIVACY_LABELS,
  TRANSPORT_SUBCATEGORIES,
} from '@/experiences/pi/it/mobile-first/profileSettingsContent';
import SettingsDocument from './SettingsDocument';
import {
  Authorize,
  Button,
  Choice,
  Copy,
  ErrorText,
  Fact,
  Field,
  Page,
  Result,
  Row,
  Title,
  Toggle,
  s,
  type ScreenNavigation,
} from './Primitives';
export default function SettingsCommunications({
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
  const section = route.id ?? 'notifications';
  const [view, setView] = useState(section);
  const [enabled, setEnabled] = useState(settings.notificationsEnabled);
  const [channels, setChannels] = useState({
    ...settings.notificationChannels,
  });
  const [groups, setGroups] = useState({
    ...settings.notificationGroupEnabled,
  });
  const [group, setGroup] = useState('Conti correnti');
  const [event, setEvent] = useState('Accrediti');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [removing, setRemoving] = useState('');
  const [privacy, setPrivacy] = useState([...settings.privacy]);
  const [cookies, setCookies] = useState(settings.cookies);
  const [ivass, setIvass] = useState(settings.ivass);
  const [newsletter, setNewsletter] = useState('Morning Meeting');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [pending, setPending] = useState<() => void>(() => () => {});
  const [returnView, setReturnView] = useState(section);
  const go = (next: string) => {
    setError(null);
    setView(next);
  };
  const done = (message: string) => {
    onChanged();
    setNotice(message);
    go('result');
  };
  const auth = (action: () => void) => {
    setPending(() => action);
    setReturnView(view);
    go('auth');
  };
  const back = () => (view === section ? onBack() : go(section));
  const saveNotifications = () => {
    saveProfileNotificationPreferences(enabled, channels, groups);
    done('Preferenze notifiche salvate');
  };
  const privacyBody =
    'Dichiaro di aver preso visione dell’Informativa privacy e confermo la volontà espressa in merito al trattamento dei dati personali. ' +
    PRIVACY_LABELS.map(
      (label, index) =>
        `${label}: ${privacy[index] ? 'Acconsento' : 'Non acconsento'}`,
    ).join('. ');
  if (view === 'auth')
    return (
      <Authorize
        onBack={() => go(returnView)}
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
        onClose={onClose}
        onContinue={() => go(section)}
      />
    );
  if (view === 'notifications')
    return (
      <Page
        title="Notifiche"
        onBack={onBack}
        onClose={onClose}
        footer={<Button onPress={saveNotifications}>Salva modifiche</Button>}
      >
        {settings.smsPremium && (
          <View style={s.card}>
            <Title>Ricevi ancora notifiche tramite SMS?</Title>
            <Copy>
              Passa a Notifiche Push: ricevi le comunicazioni gratuitamente sul
              tuo smartphone.
            </Copy>
            <Button secondary onPress={() => go('sms-warning')}>
              Modifica metodo di ricezione
            </Button>
          </View>
        )}
        <Toggle
          label="Abilita tutte le notifiche"
          value={enabled}
          onChange={setEnabled}
        />
        {NOTIFICATION_GROUPS.map(item => (
          <Row
            key={item}
            label={item}
            value="VISUALIZZA"
            onPress={() => {
              setGroup(item);
              go('group');
            }}
          />
        ))}
      </Page>
    );
  if (view === 'sms-warning')
    return (
      <Page
        title="Impostazioni notifiche"
        onBack={back}
        onClose={onClose}
        footer={
          <Button
            onPress={() =>
              auth(() => {
                switchProfileNotificationsToPush();
                setEnabled(true);
                setChannels(
                  profileSettingsStore.getSnapshot().notificationChannels,
                );
                done('Notifiche push attivate');
              })
            }
          >
            Autorizza
          </Button>
        }
      >
        <Copy>
          Non riceverai più SMS a pagamento ma notifiche push sul tuo
          smartphone.
        </Copy>
        <Copy>
          Ricordati che passando alle notifiche push non potrai più riattivare
          SMS Premium.
        </Copy>
        <Copy>
          Per il trattamento dei dati personali consulta l’informativa privacy.
        </Copy>
        <Button secondary onPress={() => go('privacy-info')}>
          Visualizza informativa privacy
        </Button>
      </Page>
    );
  if (view === 'group')
    return (
      <Page
        title={group}
        onBack={() => go('notifications')}
        onClose={onClose}
        footer={<Button onPress={saveNotifications}>Salva modifiche</Button>}
      >
        <Toggle
          label="Abilita le notifiche"
          value={groups[group] ?? true}
          onChange={value =>
            setGroups(current => ({ ...current, [group]: value }))
          }
        />
        {NOTIFICATION_EVENTS[group]?.map(item => (
          <Row
            key={item}
            label={item}
            value={channels[`${group}:${item}`] ?? 'Solo archivio'}
            onPress={() => {
              setEvent(item);
              go('event');
            }}
          />
        ))}
        {group === 'Bilancio familiare e budget' && (
          <Button secondary onPress={() => go('categories')}>
            Gestisci categorie
          </Button>
        )}
      </Page>
    );
  if (view === 'event')
    return (
      <Page
        title={event}
        onBack={() => go('group')}
        onClose={onClose}
        footer={<Button onPress={() => go('group')}>Conferma</Button>}
      >
        <Choice
          label="Modalità di ricezione"
          value={channels[`${group}:${event}`] ?? 'Solo archivio'}
          options={
            settings.smsPremium
              ? ['Solo archivio', 'Push', 'SMS Premium']
              : ['Solo archivio', 'Push']
          }
          onChange={value =>
            setChannels(current => ({
              ...current,
              [`${group}:${event}`]: value,
            }))
          }
        />
        <Copy>Le notifiche saranno consultabili anche nell’archivio.</Copy>
      </Page>
    );
  if (view === 'categories')
    return (
      <Page
        title="Bilancio familiare e Budget"
        onBack={() => go('group')}
        onClose={onClose}
        footer={
          <Button
            onPress={() => {
              const issue = categoryNotificationError(
                category,
                subcategory,
                settings.categoryNotifications,
              );
              setError(issue);
              if (!issue) {
                profileSettingsStore.update({
                  categoryNotifications: [
                    ...profileSettingsStore.getSnapshot().categoryNotifications,
                    `${category} - ${subcategory}`,
                  ],
                });
                onChanged();
                setCategory('');
                setSubcategory('');
              }
            }}
          >
            Conferma
          </Button>
        }
      >
        <Title>Nuova notifica per categoria</Title>
        <Copy>Seleziona una categoria per cui vuoi ricevere una notifica.</Copy>
        <Choice
          label="Categoria"
          value={category}
          options={CATEGORIES}
          onChange={value => {
            setCategory(value);
            setSubcategory('');
          }}
        />
        <Choice
          label="Sottocategoria"
          value={subcategory}
          options={
            category === 'Trasporti'
              ? TRANSPORT_SUBCATEGORIES
              : category
              ? [`Altro ${category}`]
              : []
          }
          onChange={setSubcategory}
        />
        <ErrorText error={error} />
        <Title>Notifiche attive</Title>
        {settings.categoryNotifications.map(item => (
          <Row
            key={item}
            label={item}
            action="ELIMINA"
            onPress={() => {
              setRemoving(item);
              go('category-remove');
            }}
          />
        ))}
        {!settings.categoryNotifications.length && (
          <Copy>Nessuna notifica attiva.</Copy>
        )}
      </Page>
    );
  if (view === 'category-remove')
    return (
      <Page
        title="Attenzione"
        onBack={() => go('categories')}
        onClose={onClose}
        footer={
          <Button
            onPress={() => {
              profileSettingsStore.update({
                categoryNotifications: profileSettingsStore
                  .getSnapshot()
                  .categoryNotifications.filter(item => item !== removing),
              });
              onChanged();
              go('categories');
            }}
          >
            Conferma eliminazione
          </Button>
        }
      >
        <Copy>
          Stai eliminando una notifica per le categorie di spesa selezionate in
          precedenza.
        </Copy>
        <Copy>{removing}</Copy>
        <Button secondary onPress={() => go('categories')}>
          Annulla
        </Button>
      </Page>
    );
  if (view === 'newsletter')
    return (
      <Page title="Newsletter" onBack={onBack} onClose={onClose}>
        <Title>Email</Title>
        <Row
          label="Email"
          value={settings.email}
          detail={settings.emailVerified ? 'Verificato' : 'Da verificare'}
          onPress={() => go('email')}
        />
        <Title>Iscrizioni</Title>
        {[
          'Morning Meeting',
          'Novità di Banca Multicanale',
          'Newsletter Genius',
        ].map(item => (
          <Toggle
            key={item}
            label={item}
            value={settings.newsletters.includes(item)}
            onChange={() => {
              setNewsletter(item);
              go('newsletter-confirm');
            }}
          />
        ))}
      </Page>
    );
  if (view === 'newsletter-confirm') {
    const active = settings.newsletters.includes(newsletter);
    return (
      <Page
        title={active ? 'Disattiva newsletter' : 'Attiva newsletter'}
        onBack={back}
        onClose={onClose}
        footer={
          <Button
            disabled={!settings.emailVerified}
            onPress={() =>
              auth(() => {
                const stored = profileSettingsStore.getSnapshot().newsletters;
                profileSettingsStore.update({
                  newsletters: active
                    ? stored.filter(item => item !== newsletter)
                    : [...stored, newsletter],
                });
                done(active ? 'Iscrizione disattivata' : 'Iscrizione attivata');
              })
            }
          >
            Conferma
          </Button>
        }
      >
        <Title>{newsletter}</Title>
        <Copy>
          {active
            ? 'Non riceverai più questa newsletter. Puoi riattivarla in qualsiasi momento.'
            : 'Riceverai questa newsletter sul tuo indirizzo email verificato.'}
        </Copy>
        <Fact label="Email">{settings.email}</Fact>
        <Button secondary onPress={back}>
          Annulla
        </Button>
      </Page>
    );
  }
  if (view === 'email')
    return (
      <Page
        title="Modifica email"
        onBack={back}
        onClose={onClose}
        footer={
          <Button
            onPress={() => {
              if (!validProfileContact('email', email)) {
                setError('Inserisci un indirizzo email valido.');
                return;
              }
              setCode('');
              go('email-code');
            }}
          >
            Invia codice di verifica
          </Button>
        }
      >
        <Field
          label="Email"
          value={email}
          onChange={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <ErrorText error={error} />
      </Page>
    );
  if (view === 'email-code')
    return (
      <Page
        title="Verifica email"
        onBack={() => go('email')}
        onClose={onClose}
        footer={
          <Button
            onPress={() => {
              if (code !== '123456') {
                setError('Il codice non è corretto. Riprova.');
                return;
              }
              profileSettingsStore.update({ email, emailVerified: true });
              onChanged();
              go('newsletter');
            }}
          >
            Conferma
          </Button>
        }
      >
        <Copy>Inserisci il codice ricevuto sul tuo indirizzo email.</Copy>
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
  if (view === 'privacy')
    return (
      <Page title="Consensi e Privacy" onBack={onBack} onClose={onClose}>
        <Title>Privacy</Title>
        <Button secondary onPress={() => go('privacy-edit')}>
          Modifica privacy
        </Button>
        {PRIVACY_LABELS.map((label, index) => (
          <Row
            key={label}
            label={label}
            value={settings.privacy[index] ? 'Acconsento' : 'Non acconsento'}
          />
        ))}
        <Title>Cookies</Title>
        <Row
          label="Tracciamento"
          value={settings.cookies ? 'Acconsento' : 'Non acconsento'}
          onPress={() => go('cookies')}
        />
        <Title>Informative Privacy e Cookies Policy</Title>
        <Copy>
          Consulta le informative Privacy e la Cookies Policy dell’App.
        </Copy>
        <Button secondary onPress={() => go('privacy-info')}>
          Visualizza informativa
        </Button>
        <Title>IVASS</Title>
        <Row
          label="Consensi IVASS"
          value={settings.ivass ? 'Acconsento' : 'Non acconsento'}
          onPress={() => go('ivass')}
        />
      </Page>
    );
  if (view === 'privacy-edit')
    return (
      <Page
        title="Proteggi la tua privacy scegliendo come tratteremo i tuoi dati"
        description="Fai la tua scelta, ma prima prendi visione dell’informativa sul trattamento e la protezione dei dati personali."
        onBack={back}
        onClose={onClose}
        footer={<Button onPress={() => go('privacy-intro')}>Prosegui</Button>}
      >
        {PRIVACY_LABELS.map((label, index) => (
          <Choice
            key={label}
            label={label}
            value={privacy[index] ? 'Acconsento' : 'Non acconsento'}
            options={['Acconsento', 'Non acconsento']}
            onChange={value =>
              setPrivacy(current =>
                current.map((checked, i) =>
                  i === index ? value === 'Acconsento' : checked,
                ),
              )
            }
          />
        ))}
      </Page>
    );
  if (view === 'privacy-intro')
    return (
      <Page
        title="Firma la documentazione"
        onBack={() => go('privacy-edit')}
        onClose={onClose}
        footer={
          <Button
            onPress={() =>
              go(
                settings.signature === 'Attiva'
                  ? 'privacy-doc'
                  : 'privacy-signature',
              )
            }
          >
            Avanti
          </Button>
        }
      >
        <Copy>
          Ti raccomandiamo l’attenta lettura della documentazione. Premendo
          Conferma avvierai il processo di presa visione e, ove previsto, di
          successiva firma ai fini della formalizzazione della pratica.
        </Copy>
      </Page>
    );
  if (view === 'privacy-signature')
    return (
      <SettingsDocument
        key="privacy-signature-certificate"
        title="Per firmare è necessaria la firma digitale: scopri come funziona"
        body="Per sottoscrivere i documenti informatici è necessaria l’emissione di un certificato di Firma Digitale, disponibile subito e senza costi aggiuntivi. L’emissione e la modalità di sottoscrizione sono regolate dal Manuale Operativo di In.Te.S.A. S.p.A. UniCredit comunica nome, cognome, codice fiscale e data di nascita al certificatore. Ho preso visione del Manuale Operativo e richiedo la Firma Digitale."
        onBack={() => go('privacy-intro')}
        onClose={onClose}
        onAccept={() => go('privacy-doc')}
      />
    );
  if (view === 'privacy-doc')
    return (
      <SettingsDocument
        key="privacy-consents-document"
        title="Documento Consensi Privacy"
        body={privacyBody}
        onBack={() => go('privacy-edit')}
        onClose={onClose}
        onAccept={() => go('privacy-complete')}
      />
    );
  if (view === 'privacy-complete')
    return (
      <Page
        title="Completa la sottoscrizione"
        onBack={() => go('privacy-doc')}
        onClose={onClose}
        footer={
          <Button
            onPress={() =>
              auth(() => {
                profileSettingsStore.update({ privacy });
                if (profileSettingsStore.getSnapshot().signature !== 'Attiva')
                  transitionProfileSignature('Attiva');
                done('La sottoscrizione si è conclusa correttamente!');
              })
            }
          >
            Conferma
          </Button>
        }
      >
        <Copy>
          Premendo Conferma e inserendo il sistema di autenticazione richiesto
          si completa la sottoscrizione elettronica in corrispondenza dei punti
          firma accettati.
        </Copy>
      </Page>
    );
  if (view === 'privacy-info')
    return (
      <Page
        title="Informative Privacy e Cookies Policy"
        onBack={() => go('privacy')}
        onClose={onClose}
      >
        <Title>Trattamento e protezione dei dati</Title>
        <Copy>
          Puoi scegliere separatamente i consensi di messaggistica, email,
          comunicazioni multimediali, chiamate e profilazione. Puoi modificarli
          o revocarli dalla sezione Privacy.
        </Copy>
        <Title>Cookies</Title>
        <Copy>
          Il consenso al tracciamento è facoltativo e può essere revocato. I
          cookie necessari al funzionamento del servizio restano attivi.
        </Copy>
        <Button secondary onPress={() => go('privacy-edit')}>
          Gestisci consensi
        </Button>
      </Page>
    );
  const cookieView = view === 'cookies';
  return (
    <Page
      title={cookieView ? 'Modifica cookies' : 'Modifica consenso IVASS'}
      onBack={() => go('privacy')}
      onClose={onClose}
      footer={
        <Button
          onPress={() => {
            profileSettingsStore.update(cookieView ? { cookies } : { ivass });
            done(
              cookieView
                ? 'Preferenze cookies aggiornate'
                : 'Consenso IVASS aggiornato',
            );
          }}
        >
          Salva modifiche
        </Button>
      }
    >
      <Choice
        label={cookieView ? 'Tracciamento' : 'Consenso IVASS'}
        value={(cookieView ? cookies : ivass) ? 'Acconsento' : 'Non acconsento'}
        options={['Acconsento', 'Non acconsento']}
        onChange={value =>
          cookieView
            ? setCookies(value === 'Acconsento')
            : setIvass(value === 'Acconsento')
        }
      />
    </Page>
  );
}
