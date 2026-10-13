import React, { useState, useSyncExternalStore } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  deviceDeactivationError,
  profileSettingsStore,
  securityLevel,
  validProfileContact,
} from '@/features/profile/mobileFirstProfileSettings';
import {
  SETTINGS_MENU,
  SECURITY_ARTICLES,
  SECURITY_MISSIONS,
  SETTINGS_RESULTS,
} from '@/experiences/pi/it/mobile-first/profileSettingsContent';
import { profileSettingsAssets as a } from '@/experiences/pi/it/mobile-first/profileSettingsAssets';
import {
  nativeBiometricAvailable,
  authenticateNativeBiometric,
} from '../../../../platform/biometrics';
import { AssetGlyph } from '../../../../universal/AssetGlyph';
import {
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
import SettingsBank from './SettingsBank';
import SettingsCommunications from './SettingsCommunications';
import Security from './Security';
const menuIconDimensions: Record<string, { width: number; height: number }> = {
  general: { width: 22, height: 22 },
  devices: { width: 14, height: 22 },
  notifications: { width: 20, height: 22 },
  newsletter: { width: 21, height: 22 },
  limits: { width: 22, height: 22 },
  withdrawal: { width: 22, height: 22 },
  quick: { width: 22, height: 16 },
  'third-party': { width: 22, height: 22 },
  'face-id': { width: 22, height: 22 },
  security: { width: 16, height: 22 },
  privacy: { width: 22, height: 22 },
};

export default function Settings(props: ScreenNavigation) {
  const { route, onBack, onClose, onChanged } = props;
  const settings = useSyncExternalStore(
    profileSettingsStore.subscribe,
    profileSettingsStore.getSnapshot,
  );
  const [view, setView] = useState(
    route.id ?? (route.area === 'security' ? 'checkup' : 'settings'),
  );
  const [language, setLanguage] = useState(settings.language);
  const [preferred, setPreferred] = useState<string>(settings.preferredProfile);
  const [size, setSize] = useState(settings.textSize);
  const [location, setLocation] = useState(settings.location);
  const [ip, setIp] = useState(settings.ipService);
  const [bio, setBio] = useState(settings.biometric);
  const [biometricUnavailable, setBiometricUnavailable] = useState(false);
  const [selected, setSelected] = useState('iphone');
  const [tax, setTax] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [mission, setMission] = useState('device');
  const [article, setArticle] = useState('phishing');
  const [contact, setContact] = useState('');
  const [code, setCode] = useState('');
  const done = (message: string) => {
    onChanged();
    setNotice(message);
    setView('result');
  };
  const back = () => {
    setError(null);
    if (['language', 'preference', 'location'].includes(view))
      setView('general');
    else if (['device', 'deactivate', 'device-confirm'].includes(view))
      setView('devices');
    else if (
      ['missions', 'mission', 'article', 'articles', 'levels'].includes(view)
    )
      setView('checkup');
    else if (
      view === 'settings' ||
      (view === 'checkup' && route.area === 'security')
    )
      onBack();
    else setView('settings');
  };
  const common = {
    ...props,
    onBack: () => setView('settings'),
    route: { ...route, id: view },
  };
  if (
    [
      'security',
      'digital-signature',
      'forgot-mobile-code',
      'pin',
      'mobile-code',
      'screenshots',
      'access-history',
    ].includes(view)
  )
    return <Security {...common} />;
  if (['limits', 'quick', 'third-party', 'withdrawal'].includes(view))
    return <SettingsBank {...common} />;
  if (['notifications', 'newsletter', 'privacy'].includes(view))
    return <SettingsCommunications {...common} />;
  if (view === 'result')
    return (
      <Result
        variant="settings"
        title={notice}
        body={
          notice.startsWith('Simulazione Face ID')
            ? 'La biometria del dispositivo resta disabilitata. Per autorizzare le operazioni continua a utilizzare il Mobile Code.'
            : SETTINGS_RESULTS[notice]
        }
        onClose={onClose}
        onContinue={() => setView('settings')}
      />
    );
  if (view === 'general')
    return (
      <Page
        title="Generali"
        contentGap={0}
        titleSpacing={40}
        onBack={back}
        onClose={onClose}
        footer={
          <Button
            onPress={() => {
              profileSettingsStore.update({ textSize: size });
              done('Modifiche salvate');
            }}
          >
            Salva modifiche
          </Button>
        }
      >
        <Row
          label="Preferenza profilo"
          value={settings.preferredProfile}
          onPress={() => setView('preference')}
        />
        <Row
          label="Lingua"
          value={settings.language}
          onPress={() => setView('language')}
        />
        <Row label="Geolocalizzazione" onPress={() => setView('location')} />
        <Toggle
          label="Ridimensionamento testo"
          value={size}
          onChange={setSize}
        />
        <Copy>Adatta la dimensione dei testi alle tue preferenze.</Copy>
      </Page>
    );
  if (view === 'language')
    return (
      <Page
        title="Cambio lingua"
        onBack={back}
        onClose={onClose}
        footer={
          <Button
            onPress={() => {
              profileSettingsStore.update({ language });
              done('Lingua modificata');
            }}
          >
            Salva modifiche
          </Button>
        }
      >
        <Choice
          label="Lingua"
          value={language}
          options={['Italiano', 'English', 'Deutsch']}
          onChange={setLanguage}
        />
      </Page>
    );
  if (view === 'preference')
    return (
      <Page
        title="Preferenza profilo"
        description="Scegli quale profilo vuoi visualizzare quando apri l’App. Vedrai il profilo scelto nella pagina di accesso e nella Home."
        onBack={back}
        onClose={onClose}
        footer={
          <Button
            onPress={() => {
              profileSettingsStore.update({
                preferredProfile: preferred as 'UniCredit' | 'buddy',
              });
              done(`Hai cambiato il tuo profilo preferito in ${preferred}`);
            }}
          >
            Salva modifiche
          </Button>
        }
      >
        <Choice
          label="Profilo preferito"
          value={preferred}
          options={['UniCredit', 'buddy']}
          onChange={setPreferred}
        />
        <Copy>
          Potrai sempre navigare tra un profilo e l’altro o modificare la tua
          scelta in seguito.
        </Copy>
      </Page>
    );
  if (view === 'location')
    return (
      <Page
        title="Servizi geolocalizzazione"
        onBack={back}
        onClose={onClose}
        footer={
          <Button
            onPress={() => {
              profileSettingsStore.update({ location, ipService: ip });
              done('Preferenze geolocalizzazione aggiornate');
            }}
          >
            Conferma
          </Button>
        }
      >
        <Toggle
          label="Geolocalizzazione"
          value={location}
          onChange={setLocation}
        />
        <Toggle label="Rifornimento IP" value={ip} onChange={setIp} />
        <Copy>
          Gestisci i servizi di geolocalizzazione del tuo dispositivo.
        </Copy>
      </Page>
    );
  if (view === 'face-id')
    return (
      <Page
        title="Face ID"
        onBack={back}
        onClose={onClose}
        footer={
          <Button
            onPress={() => {
              const enable = async () => {
                setBiometricUnavailable(false);
                if (bio) {
                  if (!(await nativeBiometricAvailable())) {
                    setBiometricUnavailable(true);
                    setError(
                      'Riconoscimento biometrico non disponibile. Puoi visualizzare una simulazione dimostrativa.',
                    );
                    return;
                  }
                  const result = await authenticateNativeBiometric(
                    'Abilita riconoscimento biometrico',
                  );
                  if (result !== 'authenticated') {
                    setBiometricUnavailable(result === 'unavailable');
                    setError(
                      result === 'cancelled'
                        ? 'Abilitazione annullata.'
                        : 'Riconoscimento biometrico non disponibile.',
                    );
                    return;
                  }
                }
                profileSettingsStore.update({ biometric: bio });
                done(bio ? 'Face ID abilitato' : 'Face ID disabilitato');
              };
              enable().catch(() =>
                setError('Riconoscimento biometrico non disponibile.'),
              );
            }}
          >
            Salva modifiche
          </Button>
        }
      >
        <Toggle label="Abilita Face ID" value={bio} onChange={setBio} />
        <Copy>
          Accedi e autorizza le operazioni con il riconoscimento biometrico.
        </Copy>
        <ErrorText error={error} />
        {biometricUnavailable && (
          <Button
            secondary
            onPress={() =>
              done('Simulazione Face ID: abilitazione dimostrativa')
            }
          >
            Simula abilitazione Face ID
          </Button>
        )}
      </Page>
    );
  if (view === 'devices')
    return (
      <Page
        title="Dispositivi"
        onBack={back}
        onClose={onClose}
        footer={
          settings.devices.length > 0 && (
            <Button
              onPress={() =>
                setView(settings.sharedClient ? 'device-confirm' : 'deactivate')
              }
            >
              Disattiva tutti i dispositivi
            </Button>
          )
        }
      >
        <Title>Dispositivo principale</Title>
        {settings.devices
          .filter(item => item.primary)
          .map(item => (
            <Row
              key={item.id}
              label={item.name}
              onPress={() => {
                setSelected(item.id);
                setView('device');
              }}
            />
          ))}
        <Title>Altri dispositivi attivi</Title>
        {settings.devices
          .filter(item => !item.primary)
          .map(item => (
            <Row
              key={item.id}
              label={item.name}
              detail="Dispositivo secondario"
              onPress={() => {
                setSelected(item.id);
                setView('device');
              }}
            />
          ))}
        {!settings.devices.length && (
          <Copy>
            Nessun dispositivo attivo. Per accedere all’app sarà necessaria una
            nuova registrazione.
          </Copy>
        )}
      </Page>
    );
  if (view === 'device') {
    const device = settings.devices.find(item => item.id === selected);
    return (
      <Page
        title={device?.name ?? 'Dispositivo'}
        onBack={back}
        onClose={onClose}
      >
        <Fact label="Marca e sistema operativo">
          {device?.id === 'office' ? 'Windows' : 'Apple - iOS'}
        </Fact>
        {[
          'Data di registrazione',
          'Ultimo accesso',
          'Ultima autorizzazione',
        ].map(label => (
          <Fact key={label} label={label}>
            20/01/2025 - 15:05
          </Fact>
        ))}
        <Fact label="Tipologia di dispositivo">
          {device?.primary
            ? 'Dispositivo principale'
            : 'Dispositivo secondario'}
        </Fact>
      </Page>
    );
  }
  if (view === 'deactivate' || view === 'device-confirm')
    return (
      <Page
        title="Disattiva tutti i dispositivi"
        onBack={back}
        onClose={onClose}
        footer={
          <Button
            onPress={() => {
              if (view === 'device-confirm') {
                profileSettingsStore.update({ devices: [] });
                done('Dispositivi disattivati');
              } else {
                const issue = deviceDeactivationError(tax);
                setError(issue);
                if (!issue) setView('device-confirm');
              }
            }}
          >
            {view === 'device-confirm' ? 'Disattiva' : 'Conferma'}
          </Button>
        }
      >
        <Copy>
          Per completare la disattivazione dell’app da tutti i tuoi dispositivi,
          inserisci il tuo codice fiscale. Non potrai più accedere senza una
          nuova registrazione.
        </Copy>
        {view === 'deactivate' ? (
          <Field
            label="Inserisci codice fiscale"
            value={tax}
            onChange={setTax}
            autoCapitalize="characters"
          />
        ) : (
          <>
            <Title>
              Sei sicuro di voler disattivare l’app per tutti i dispositivi?
            </Title>
            <Button secondary onPress={back}>
              Annulla
            </Button>
          </>
        )}
        <ErrorText error={error} />
      </Page>
    );
  if (view === 'levels')
    return (
      <Page
        title="Livelli"
        onBack={back}
        onClose={onClose}
        description="Il livello del profilo di sicurezza si basa sull’analisi di alcuni parametri e impostazioni dello smartphone in uso. Le missioni suggeriscono comportamenti per ridurre i rischi."
      >
        {[
          [
            'Basso',
            'Il tuo smartphone presenta elementi che potrebbero esporti ad un rischio.',
          ],
          [
            'Medio',
            'Segui i task suggeriti per ridurre i rischi associati al tuo device.',
          ],
          ['Alto', 'Sei sulla buona strada, ma non abbassare mai la guardia.'],
        ].map(([level, text]) => (
          <View key={level} style={s.card}>
            <Title>{`Livello ${level}`}</Title>
            <Copy>{text}</Copy>
            <Copy>
              {securityLevel(settings.missions) === level
                ? 'Livello attuale'
                : 'Completa le missioni'}
            </Copy>
          </View>
        ))}
      </Page>
    );
  if (view === 'missions')
    return (
      <Page
        title="Missioni"
        description="Completa le missioni e passa di livello."
        onBack={back}
        onClose={onClose}
      >
        {SECURITY_MISSIONS.map(([id, title, text]) => (
          <Row
            key={id}
            label={title}
            detail={text}
            value={settings.missions.includes(id) ? 'Completato' : undefined}
            onPress={() => {
              setMission(id);
              setView('mission');
            }}
          />
        ))}
      </Page>
    );
  if (view === 'mission') {
    const item = SECURITY_MISSIONS.find(entry => entry[0] === mission)!;
    return (
      <Page
        title={item[1]}
        onBack={() => setView('missions')}
        onClose={onClose}
        footer={
          ['email', 'phone'].includes(mission) ? (
            <Button
              onPress={() => {
                setContact('');
                setCode('');
                setView('mission-contact');
              }}
            >
              Verifica recapito
            </Button>
          ) : mission === 'knowledge' ? (
            <Button
              onPress={() => {
                setArticle('phishing');
                setView('article');
              }}
            >
              Consulta la pagina Sicurezza
            </Button>
          ) : undefined
        }
      >
        <Copy>{item[2]}</Copy>
        {['email', 'phone'].includes(mission) && (
          <Fact label={mission === 'email' ? 'Email' : 'Numero di telefono'}>
            {mission === 'email' ? settings.email : settings.phone}
          </Fact>
        )}
      </Page>
    );
  }
  if (view === 'mission-contact')
    return (
      <Page
        title={
          mission === 'email'
            ? 'Verifica la tua email'
            : 'Verifica il tuo numero di telefono'
        }
        onBack={() => setView('mission')}
        onClose={onClose}
        footer={
          <Button
            onPress={() => {
              if (
                !validProfileContact(
                  mission === 'email' ? 'email' : 'phone',
                  contact,
                )
              ) {
                setError('Inserisci un recapito valido.');
                return;
              }
              setError(null);
              setView('mission-code');
            }}
          >
            Invia codice di verifica
          </Button>
        }
      >
        <Field
          label={mission === 'email' ? 'Email' : 'Numero di telefono'}
          value={contact}
          onChange={setContact}
          keyboardType={mission === 'email' ? 'email-address' : 'phone-pad'}
          autoCapitalize="none"
        />
        <ErrorText error={error} />
      </Page>
    );
  if (view === 'mission-code')
    return (
      <Page
        title="Verifica recapito"
        onBack={() => setView('mission-contact')}
        onClose={onClose}
        footer={
          <Button
            onPress={() => {
              if (code !== '123456') {
                setError('Il codice non è corretto. Riprova.');
                return;
              }
              profileSettingsStore.update({
                ...(mission === 'email'
                  ? { email: contact, emailVerified: true }
                  : { phone: contact, phoneVerified: true }),
                missions: [...new Set([...settings.missions, mission])],
              });
              onChanged();
              setError(null);
              setView('missions');
            }}
          >
            Conferma
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
  if (view === 'article') {
    const item = SECURITY_ARTICLES.find(entry => entry.id === article)!;
    return (
      <Page title={item.title} onBack={back} onClose={onClose}>
        <AssetGlyph asset={a[item.id]} width={343} height={180} fit="cover" />
        <Title>
          {article === 'phishing'
            ? 'Cos’è il phishing?'
            : 'Pillole di sicurezza'}
        </Title>
        <Copy>{item.text}</Copy>
        <Title>Attenzione!</Title>
        <Copy>{item.tip}</Copy>
        <Button
          secondary
          onPress={() => {
            profileSettingsStore.update({
              missions: [...new Set([...settings.missions, 'knowledge'])],
            });
            onChanged();
            setView('articles');
          }}
        >
          Scopri di più
        </Button>
      </Page>
    );
  }
  if (view === 'articles')
    return (
      <Page title="Pillole di sicurezza" onBack={back} onClose={onClose}>
        {SECURITY_ARTICLES.map(item => (
          <Row
            key={item.id}
            label={item.title}
            onPress={() => {
              setArticle(item.id);
              setView('article');
            }}
          />
        ))}
      </Page>
    );
  if (view === 'checkup')
    return (
      <Page
        title="Fai il Check-up della tua sicurezza"
        onBack={back}
        onClose={onClose}
      >
        <Copy>{`Il livello di protezione è: ${securityLevel(
          settings.missions,
        )}.\nScopri come migliorarlo`}</Copy>
        <Button secondary onPress={() => setView('levels')}>
          Scopri i livelli
        </Button>
        <Title>Missioni</Title>
        <Copy>Completa le missioni e passa di livello</Copy>
        {SECURITY_MISSIONS.filter(item => !settings.missions.includes(item[0]))
          .slice(0, 2)
          .map(([id, title, text]) => (
            <Row
              key={id}
              label={title}
              detail={text}
              onPress={() => {
                setMission(id);
                setView('mission');
              }}
            />
          ))}
        <Button secondary onPress={() => setView('missions')}>
          Scopri tutte le missioni
        </Button>
        <Title>Pillole di sicurezza</Title>
        {SECURITY_ARTICLES.map(item => (
          <Row
            key={item.id}
            label={item.title}
            onPress={() => {
              setArticle(item.id);
              setView('article');
            }}
          />
        ))}
        <Button secondary onPress={() => setView('articles')}>
          Scopri tutte le pillole di sicurezza
        </Button>
      </Page>
    );
  return (
    <Page
      title="Impostazioni"
      onBack={onBack}
      onClose={onClose}
      contentGap={0}
      titleSpacing={40}
      showHelp={false}
    >
      {SETTINGS_MENU.map(group => (
        <View key={group.title} style={m.group}>
          <View style={m.heading}>
            <Title>{group.title}</Title>
          </View>
          {group.rows.map(([label, target], index) => (
            <Row
              key={target}
              label={label}
              icon={a[target]}
              iconDimensions={menuIconDimensions[target]}
              kind="settings-menu"
              last={index === group.rows.length - 1}
              onPress={() => setView(target)}
            />
          ))}
        </View>
      ))}
    </Page>
  );
}
const m = StyleSheet.create({
  group: { marginBottom: 40 },
  heading: { marginBottom: 16 },
});
