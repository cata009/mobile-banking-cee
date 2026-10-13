import React, { useState, useSyncExternalStore } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  getProfileDataSnapshot,
  getIdentityDocumentsSnapshot,
  subscribeProfileData,
  updateProfileData,
  profileAddressUpdate,
  validatePersonalChange,
  type PersonalChange,
  type ProfileAddress,
  type ProfilePersonalData,
} from '@/features/profile/mobileFirstProfileData';
import {
  correspondenceDisclaimer,
  educationOptions,
  familyOptions,
  providers,
  photoPrivacyFull,
  photoConsentOptions,
} from '@/experiences/pi/it/mobile-first/profileDataContent';
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
  s,
  type ScreenNavigation,
} from './Primitives';
import Questionnaire from './Questionnaire';
import {
  DataGroup,
  DataLink,
  DataStatus,
  DocumentCards,
  PersonalRow,
} from './DataElements';

const titles: Record<PersonalChange, string> = {
  email: 'Modifica email',
  phone: 'Modifica il tuo numero di cellulare',
  residence: 'Modifica il tuo indirizzo di residenza',
  correspondence: 'Modifica il tuo indirizzo di corrispondenza',
  education: 'Titolo di studio',
  family: 'Nucleo familiare',
  plates: 'Targa veicoli auto e moto',
  portability: 'Richiesta portabilità dei dati',
  photo: 'Informativa privacy',
  questionnaire: 'Questionario di adeguata verifica',
};
const accounts = ['Conto corrente • 0000123456', 'Conto corrente • 0000123457'];
export default function Personal({
  route,
  onBack,
  onClose,
  onNavigate,
  onChanged,
}: ScreenNavigation) {
  const data = useSyncExternalStore(
    subscribeProfileData,
    getProfileDataSnapshot,
  );
  const documents = useSyncExternalStore(
    subscribeProfileData,
    getIdentityDocumentsSnapshot,
  );
  const [change, setChange] = useState<PersonalChange | null>(() =>
    route.id && route.id in titles ? (route.id as PersonalChange) : null,
  );
  const [phase, setPhase] = useState(route.id === 'photo' ? 'photo' : 'edit');
  const [values, setValues] = useState<Record<string, string>>({
    prefix: '+39',
    education: data.education === '---' ? '' : data.education,
    family: data.family === '---' ? '' : data.family,
    account: accounts[0],
  });
  const [children, setChildren] = useState([...data.children]);
  const [plates, setPlates] = useState([...data.plates]);
  const [consent, setConsent] = useState(false);
  const [photoConsents, setPhotoConsents] = useState([false, false, false]);
  const [error, setError] = useState('');
  const set = (key: string, value: string) => {
    setValues(current => ({ ...current, [key]: value }));
    setError('');
  };
  const open = (next: PersonalChange) => {
    setChange(next);
    setPhase(
      next === 'photo'
        ? 'photo'
        : next === 'correspondence'
        ? 'addresses'
        : 'edit',
    );
    setValues({
      prefix: '+39',
      education: data.education === '---' ? '' : data.education,
      family: data.family === '---' ? '' : data.family,
      account: accounts[0],
    });
    setChildren([...data.children]);
    setPlates([...data.plates]);
    setConsent(false);
    setPhotoConsents([false, false, false]);
    setError('');
  };
  const reset = () => {
    setChange(null);
    setPhase('edit');
    setError('');
  };
  const save = () => {
    const address: ProfileAddress = {
      street: values.street ?? '',
      number: values.number ?? '',
      postal: values.postal ?? '',
      city: values.city ?? '',
      province: values.province ?? '',
      careOf: values.careOf ?? '',
    };
    const patch: Partial<ProfilePersonalData> =
      change === 'email'
        ? { email: values.email }
        : change === 'phone'
        ? {
            phone: values.phone,
            provider: values.provider,
            prefix: values.prefix,
          }
        : change === 'residence'
        ? profileAddressUpdate('residence', address, '', [])
        : change === 'correspondence'
        ? profileAddressUpdate(
            'correspondence',
            address,
            values.account,
            accounts,
          )
        : change === 'education'
        ? { education: values.education }
        : change === 'family'
        ? {
            family: values.family,
            children: values.family === 'Famiglia con figli' ? children : [],
          }
        : change === 'plates'
        ? { plates }
        : change === 'portability'
        ? { portabilityRequested: true }
        : {
            photo: phase !== 'photo-delete',
            photoUpdated: phase !== 'photo-delete',
          };
    updateProfileData(patch);
    onChanged();
    setPhase('success');
  };
  if (change === 'questionnaire')
    return (
      <Questionnaire
        {...{ route, onBack: reset, onClose, onNavigate, onChanged }}
      />
    );
  if (change && phase === 'auth')
    return (
      <Authorize
        key="mobile-authorization"
        onBack={() => setPhase('edit')}
        onClose={onClose}
        onSuccess={() => (change === 'phone' ? setPhase('otp') : save())}
        onForgot={() =>
          onNavigate({ area: 'settings', id: 'forgot-mobile-code' })
        }
      />
    );
  if (change && phase === 'otp')
    return (
      <Authorize
        key="phone-otp"
        otp
        onBack={() => setPhase('auth')}
        onClose={onClose}
        onSuccess={save}
      />
    );
  if (change && phase === 'success')
    return (
      <Result
        title="I tuoi dati sono stati aggiornati"
        body={
          change === 'portability'
            ? 'La richiesta di portabilità dei dati è stata acquisita. Puoi controllare lo stato nelle comunicazioni.'
            : undefined
        }
        onClose={onClose}
        onContinue={reset}
      />
    );
  if (change === 'correspondence' && phase === 'addresses')
    return (
      <Page
        title="Indirizzi di corrispondenza"
        onBack={reset}
        onClose={onClose}
      >
        {accounts.map(account => {
          const address = data.correspondenceAddresses?.[account];
          return (
            <View key={account} style={s.stack}>
              <Copy strong>{account}</Copy>
              <Copy>
                {address
                  ? `${address.street}, ${address.number} — ${address.postal} ${address.city} (${address.province})`
                  : 'Via Milano, 1 — 20019 Milano (MI)'}
              </Copy>
              <Button
                secondary
                onPress={() => {
                  setValues(current => ({ ...current, ...address, account }));
                  setPhase('edit');
                }}
              >
                MODIFICA
              </Button>
            </View>
          );
        })}
      </Page>
    );
  if (change === 'photo' && phase === 'photo-delete')
    return (
      <Page
        title="Sei sicuro di voler cancellare l’immagine?"
        onBack={() => setPhase('photo')}
        onClose={onClose}
        footer={
          <>
            <Button onPress={save}>Elimina</Button>
            <Button secondary onPress={() => setPhase('photo')}>
              Annulla
            </Button>
          </>
        }
      >
        <Copy>L’immagine verrà rimossa dal tuo profilo.</Copy>
      </Page>
    );
  if (change === 'photo' && phase === 'photo')
    return (
      <Page title="Modifica immagine" onBack={reset} onClose={onClose}>
        <Button
          secondary
          onPress={() => {
            set('photoMethod', 'camera');
            setPhase('edit');
          }}
        >
          Scatta una foto
        </Button>
        <Copy>Scatta una foto dalla camera del tuo telefono</Copy>
        <Button
          secondary
          onPress={() => {
            set('photoMethod', 'gallery');
            setPhase('edit');
          }}
        >
          Scegli foto
        </Button>
        <Copy>Carica una foto dalla galleria del tuo telefono</Copy>
        {data.photo && (
          <DataLink
            label="Elimina foto"
            onPress={() => setPhase('photo-delete')}
          />
        )}
      </Page>
    );
  if (change === 'photo' && phase === 'photo-camera')
    return (
      <Page
        title="Fotocamera"
        onBack={() => setPhase('edit')}
        onClose={onClose}
        footer={
          <Button onPress={() => setPhase('photo-crop')}>Scatta foto</Button>
        }
      >
        <AssetGlyph asset={a.camera} width={343} height={400} fit="cover" />
      </Page>
    );
  if (change === 'photo' && phase === 'photo-crop')
    return (
      <Page
        title="Ritaglia immagine"
        onBack={() => setPhase('photo')}
        onClose={onClose}
        footer={
          <>
            <Button onPress={save}>Conferma</Button>
            <Button secondary onPress={() => setPhase('photo')}>
              Annulla
            </Button>
          </>
        }
      >
        <View style={personalStyles.crop}>
          <AssetGlyph asset={a.photo} width={343} height={343} fit="cover" />
          <View style={personalStyles.cropMask}>
            <AssetGlyph asset={a.cropMask} width={343} height={343} />
          </View>
        </View>
      </Page>
    );
  if (change) {
    const needsConsent = [
      'email',
      'phone',
      'plates',
      'correspondence',
    ].includes(change);
    const missingChoice =
      (change === 'education' && !values.education) ||
      (change === 'family' && !values.family);
    const submit = () => {
      const issue = validatePersonalChange(change, {
        ...values,
        plates,
        children,
      });
      if (issue) {
        setError(issue);
        return;
      }
      if (change === 'portability' && phase !== 'review') setPhase('review');
      else if (change === 'photo')
        setPhase(
          values.photoMethod === 'gallery' ? 'photo-crop' : 'photo-camera',
        );
      else setPhase('auth');
    };
    const field = (
      label: string,
      key: string,
      keyboardType:
        | 'default'
        | 'email-address'
        | 'phone-pad'
        | 'number-pad' = 'default',
    ) => (
      <Field
        label={label}
        value={values[key] ?? ''}
        onChange={value => set(key, value)}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
      />
    );
    return (
      <Page
        title={titles[change]}
        onBack={reset}
        onClose={onClose}
        footer={
          <Button
            disabled={
              !!missingChoice ||
              (needsConsent && !consent) ||
              (change === 'photo' && !photoConsents.every(Boolean))
            }
            onPress={submit}
          >
            {phase === 'review'
              ? 'Continua'
              : ['email', 'plates'].includes(change)
              ? 'Salva modifiche'
              : 'Conferma'}
          </Button>
        }
      >
        {change === 'email' && field('Email', 'email', 'email-address')}
        {change === 'phone' && (
          <>
            <Copy>
              Inserisci un numero di cellulare valido nei campi sottostanti e
              continua.
            </Copy>
            <Choice
              label="Prefisso"
              value={values.prefix ?? '+39'}
              options={['+39', '+40', '+420', '+49', '+33', '+34', '+44', '+1']}
              onChange={value => set('prefix', value)}
            />
            {field('Numero di cellulare', 'phone', 'phone-pad')}
            <Choice
              label="Operatore telefonico"
              value={values.provider ?? ''}
              options={providers}
              onChange={value => set('provider', value)}
            />
          </>
        )}
        {['residence', 'correspondence'].includes(change) && (
          <>
            {change === 'correspondence' && (
              <Choice
                label="Seleziona il rapporto"
                value={values.account}
                options={[...accounts, 'Tutti i rapporti']}
                onChange={value => set('account', value)}
              />
            )}
            <Copy>
              Inserisci un indirizzo valido nei campi sottostanti e continua.
            </Copy>
            {field('Indirizzo', 'street')}
            {field('Numero civico', 'number')}
            {field('Codice postale', 'postal', 'number-pad')}
            {field('Presso', 'careOf')}
            {field('Comune', 'city')}
            <Choice
              label="Provincia"
              value={values.province ?? ''}
              options={['MI', 'RM', 'TO', 'NA', 'BO', 'FI', 'VE', 'Altro']}
              onChange={value => set('province', value)}
            />
          </>
        )}
        {change === 'education' &&
          educationOptions.map(option => (
            <Check
              key={option}
              radio
              label={option}
              value={values.education === option}
              onChange={() => set('education', option)}
            />
          ))}
        {change === 'family' && (
          <>
            {familyOptions.map(option => (
              <Check
                key={option}
                radio
                label={option}
                value={values.family === option}
                onChange={() => set('family', option)}
              />
            ))}
            {values.family === 'Famiglia con figli' && (
              <>
                <Choice
                  label="Numero figli"
                  value={String(children.length || '')}
                  options={['1', '2', '3']}
                  onChange={value =>
                    setChildren(
                      Array.from(
                        { length: Number(value) },
                        (_, index) => children[index] ?? '',
                      ),
                    )
                  }
                />
                {children.map((date, index) => (
                  <Field
                    key={index}
                    label={`Data di nascita ${index + 1}° figlio`}
                    value={date}
                    onChange={value =>
                      setChildren(
                        children.map((current, i) =>
                          i === index ? value : current,
                        ),
                      )
                    }
                    placeholder="AAAA-MM-GG"
                  />
                ))}
              </>
            )}
          </>
        )}
        {change === 'plates' && (
          <>
            {plates.map((plate, index) => (
              <View key={index} style={s.stack}>
                <Field
                  label={`Targa ${index + 1}° veicolo`}
                  value={plate}
                  onChange={value =>
                    setPlates(
                      plates.map((current, i) =>
                        i === index
                          ? value.replace(/\s/g, '').toUpperCase()
                          : current,
                      ),
                    )
                  }
                  maxLength={8}
                />
                <Button
                  secondary
                  onPress={() =>
                    setPlates(plates.filter((_, i) => i !== index))
                  }
                >{`Elimina targa ${index + 1}`}</Button>
                <Copy muted>Massimo 8 caratteri alfanumerici</Copy>
              </View>
            ))}
            {plates.length < 3 && (
              <Button secondary onPress={() => setPlates([...plates, ''])}>
                Aggiungi targa veicolo
              </Button>
            )}
            <Copy>Proteggi il tuo veicolo con la giusta assicurazione</Copy>
          </>
        )}
        {change === 'portability' &&
          (phase === 'review' ? (
            <>
              <Copy>
                Gentile Cliente, la tua richiesta ci autorizza a utilizzare i
                tuoi recapiti per inviare le informazioni oggetto della tua
                richiesta.
              </Copy>
              <View style={s.card}>
                <Copy strong>FACSIMILE</Copy>
                <Copy>Diritto alla Portabilità — art. 20 Reg. EU 679/2016</Copy>
                <Copy>{`${data.firstName} ${data.lastName}`}</Copy>
                <Fact label="Email">{values.email}</Fact>
                <Fact label="Numero di cellulare">{values.phone}</Fact>
              </View>
            </>
          ) : (
            <>
              <Copy>
                Indica l’indirizzo email e il numero di cellulare ai quali
                inviare le comunicazioni e le informazioni richieste.
              </Copy>
              {field('Inserisci indirizzo email', 'email', 'email-address')}
              {field(
                'Reinserisci l’indirizzo email per conferma',
                'emailConfirm',
                'email-address',
              )}
              {field('Inserisci il numero di cellulare', 'phone', 'phone-pad')}
              {field(
                'Reinserisci il numero di cellulare per conferma',
                'phoneConfirm',
                'phone-pad',
              )}
            </>
          ))}
        {change === 'photo' && (
          <>
            <AssetGlyph
              asset={data.photoUpdated ? a.photo : a.imgAvatarCard}
              size={96}
            />
            <Copy>{photoPrivacyFull}</Copy>
            {photoConsentOptions.map((label, index) => (
              <Check
                key={label}
                label={label}
                value={photoConsents[index]}
                onChange={value =>
                  setPhotoConsents(current =>
                    current.map((checked, i) =>
                      i === index ? value : checked,
                    ),
                  )
                }
              />
            ))}
            <Copy muted>
              Il conferimento del dato e il consenso sono facoltativi.
            </Copy>
          </>
        )}
        {needsConsent && (
          <Check
            label={
              change === 'correspondence'
                ? correspondenceDisclaimer
                : 'Ho preso visione dell’informativa privacy e acconsento al trattamento dei dati.'
            }
            value={consent}
            onChange={setConsent}
          />
        )}
        <ErrorText error={error} />
      </Page>
    );
  }
  const personalRow = (label: string, value: string, next?: PersonalChange) => (
    <PersonalRow
      label={label}
      value={value}
      onEdit={next ? () => open(next) : undefined}
    />
  );
  return (
    <Page title="I tuoi dati" onBack={onBack} onClose={onClose}>
      <Title>Informazioni personali</Title>
      <DataGroup>
        <View style={personalStyles.imageRow}>
          {data.photo && (
            <AssetGlyph
              asset={data.photoUpdated ? a.photo : a.imgAvatarCard}
              size={40}
            />
          )}
          <DataLink label="MODIFICA IMMAGINE" onPress={() => open('photo')} />
        </View>
        {personalRow('Nominativo', `${data.firstName} ${data.lastName}`)}
        {personalRow('Cittadinanza', 'Italiana - Brasiliana - Americana')}
        {personalRow('Residenza fiscale', 'Italia')}
        {personalRow('Codice fiscale', 'RSSMRA90R10F205I')}
        {personalRow('Codice di adesione', '123456')}
        {personalRow('Nucleo familiare', data.family, 'family')}
        {personalRow('Titolo di studio', data.education, 'education')}
        {personalRow('Professione', '---')}
      </DataGroup>
      <Title>Contatti</Title>
      <DataGroup>
        {personalRow('Email', data.email, 'email')}
        <DataStatus>Verificato</DataStatus>
        {personalRow('Numero di cellulare', data.phone, 'phone')}
        <DataStatus>Verificato</DataStatus>
        {personalRow('Operatore telefonico', data.provider)}
        {personalRow('Indirizzo di residenza', data.residence, 'residence')}
        {personalRow(
          'Indirizzo di corrispondenza',
          data.correspondence,
          'correspondence',
        )}
      </DataGroup>
      <Title>Documenti caricati</Title>
      <DataGroup>
        <DocumentCards
          documents={documents}
          onSelect={document =>
            onNavigate({ area: 'identity', id: document.id })
          }
        />
        <DataLink
          label="GESTISCI DOCUMENTI"
          onPress={() => onNavigate({ area: 'identity' })}
        />
      </DataGroup>
      <Title>Adempimenti normativi</Title>
      <DataGroup>
        {personalRow(
          'Questionario di adeguata verifica',
          data.questionnaireUpdated ? 'Aggiornato' : '---',
          'questionnaire',
        )}
        {personalRow(
          'Diritto alla portabilità',
          data.portabilityRequested ? 'Richiesta acquisita' : '---',
          'portability',
        )}
      </DataGroup>
      <Title>Targa veicoli auto e moto</Title>
      <DataGroup>
        {data.plates.map((plate, index) => (
          <View key={index}>
            {personalRow(`Targa ${index + 1}° veicolo`, plate, 'plates')}
          </View>
        ))}
        <DataLink
          label="AGGIUNGI TARGA VEICOLO"
          onPress={() => open('plates')}
        />
      </DataGroup>
    </Page>
  );
}
const personalStyles = StyleSheet.create({
  imageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  crop: { width: 343, height: 343, overflow: 'hidden' },
  cropMask: { position: 'absolute', top: 0, left: 0 },
});
