import React, { useState, useSyncExternalStore } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import {
  getContactsSnapshot,
  subscribeProfileData,
  saveContact,
  removeContact,
  setContactFavorite,
  mergeContacts,
  previewContactMerge,
  canAddContactRelationship,
  validateContact,
  type ProfileContact,
  type ContactRelationship,
} from '@/features/profile/mobileFirstProfileData';
import { providers } from '@/experiences/pi/it/mobile-first/profileDataContent';
import { profileDataAssets as assets } from '@/experiences/pi/it/mobile-first/profileDataAssets';
import { AssetGlyph } from '../../../../universal/AssetGlyph';
import { mobileFirstTokens as tokens } from '../../../../universal/tokens';
import { DataGroup, QuickAction } from './DataElements';
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

const blank = (): ProfileContact => ({
  id: `contact-${Date.now()}`,
  name: '',
  alias: '',
  address: '',
  postal: '',
  city: '',
  province: '',
  favorite: false,
  own: false,
  relationships: [],
});
const clone = (contact: ProfileContact) => ({
  ...contact,
  relationships: contact.relationships.map(item => ({ ...item })),
});
const relationshipName = (type: ContactRelationship['type']) =>
  type === 'account'
    ? 'Conto'
    : type === 'card'
    ? 'Carta prepagata'
    : 'Cellulare';
export default function Contacts({
  route,
  onBack,
  onClose,
  onNavigate,
  onChanged,
}: ScreenNavigation) {
  const contacts = useSyncExternalStore(
    subscribeProfileData,
    getContactsSnapshot,
  );
  const initial = contacts.find(item => item.id === route.id);
  const [phase, setPhase] = useState(
    initial ? 'detail' : route.id === 'new' ? 'edit' : 'list',
  );
  const [contact, setContact] = useState<ProfileContact>(() =>
    initial ? clone(initial) : blank(),
  );
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [relationshipType, setRelationshipType] = useState('');
  const [mergeIds, setMergeIds] = useState<string[]>([]);
  const [pending, setPending] = useState('save');
  const set = <K extends keyof ProfileContact>(
    key: K,
    value: ProfileContact[K],
  ) => {
    setContact(current => ({ ...current, [key]: value }));
    setError('');
  };
  const relationship = (
    index: number,
    key: keyof ContactRelationship,
    value: string,
  ) =>
    set(
      'relationships',
      contact.relationships.map((current, i) =>
        i === index ? { ...current, [key]: value } : current,
      ),
    );
  const list = () => {
    setPhase('list');
    setError('');
    setMergeIds([]);
  };
  const detail = () => {
    const saved = contacts.find(item => item.id === contact.id);
    if (saved) setContact(clone(saved));
    setPhase(saved ? 'detail' : 'list');
    setError('');
  };
  const authorize = (action: string) => {
    setPending(action);
    setPhase('auth');
  };
  const confirm = () => {
    try {
      if (pending === 'save') {
        const issue = saveContact(contact);
        if (issue) {
          setError(issue);
          setPhase('edit');
          return;
        }
      } else if (pending === 'quick')
        setContactFavorite(contact.id, !contact.favorite);
      else if (pending === 'merge')
        mergeContacts(mergeIds[0], mergeIds[1], contact);
      onChanged();
      setPhase('success');
    } catch (issue) {
      setError(
        issue instanceof Error
          ? issue.message
          : 'Controlla i dati del contatto.',
      );
      setPhase('merge-review');
    }
  };
  if (phase === 'auth')
    return (
      <Authorize
        onBack={() =>
          setPhase(
            pending === 'merge'
              ? 'merge-review'
              : pending === 'quick'
              ? 'quick'
              : 'edit',
          )
        }
        onClose={onClose}
        onSuccess={confirm}
        onForgot={() =>
          onNavigate({ area: 'settings', id: 'forgot-mobile-code' })
        }
      />
    );
  if (phase === 'success')
    return (
      <Result
        title={
          pending === 'merge'
            ? 'I contatti sono stati uniti'
            : pending === 'quick'
            ? `Operazioni veloci ${
                contact.favorite ? 'disattivate' : 'attivate'
              }`
            : pending === 'delete'
            ? 'Il contatto è stato eliminato'
            : 'Il contatto è stato salvato'
        }
        onClose={onClose}
        onContinue={list}
      />
    );
  if (phase === 'delete')
    return (
      <Page
        title="Sei sicuro di voler eliminare il contatto?"
        onBack={detail}
        onClose={onClose}
        footer={
          <>
            <Button
              onPress={() => {
                removeContact(contact.id);
                onChanged();
                setPending('delete');
                setPhase('success');
              }}
            >
              Conferma
            </Button>
            <Button secondary onPress={detail}>
              Annulla
            </Button>
          </>
        }
      >
        <Copy>{contact.name}</Copy>
      </Page>
    );
  if (phase === 'quick')
    return (
      <Page
        title={`Operazioni Veloci: ${
          contact.favorite ? 'Disabilitazione' : 'Abilitazione'
        } beneficiario`}
        onBack={detail}
        onClose={onClose}
        footer={<Button onPress={() => authorize('quick')}>Continua</Button>}
      >
        <Copy>{`Stai ${
          contact.favorite ? 'disabilitando' : 'abilitando'
        } le Operazioni Veloci verso il beneficiario: ${contact.name}`}</Copy>
        <Copy>
          Le operazioni verso questo beneficiario seguiranno le impostazioni del
          servizio Operazioni Veloci.
        </Copy>
      </Page>
    );
  if (phase === 'merge')
    return (
      <Page
        title="Unisci contatti"
        onBack={list}
        onClose={onClose}
        footer={
          <Button
            disabled={mergeIds.length !== 2}
            onPress={() => {
              try {
                setContact(previewContactMerge(mergeIds[0], mergeIds[1]));
                setPhase('merge-review');
              } catch (issue) {
                setError(String(issue));
              }
            }}
          >
            Continua
          </Button>
        }
      >
        <Copy>Seleziona due contatti da unire.</Copy>
        {contacts.map(item => (
          <Check
            key={item.id}
            label={item.name}
            value={mergeIds.includes(item.id)}
            onChange={checked => {
              setMergeIds(current =>
                checked
                  ? current.length < 2
                    ? [...current, item.id]
                    : current
                  : current.filter(id => id !== item.id),
              );
              setError('');
            }}
          />
        ))}
        <ErrorText error={error} />
      </Page>
    );
  if (phase === 'detail' || phase === 'merge-review')
    return (
      <Page
        title={
          phase === 'detail' ? contact.name : 'Riepilogo contatti da unire'
        }
        onBack={phase === 'merge-review' ? () => setPhase('merge') : list}
        onClose={onClose}
        footer={
          phase === 'merge-review' ? (
            <Button
              onPress={() => {
                const issue = validateContact(contact);
                if (issue) setError(issue);
                else authorize('merge');
              }}
            >
              Conferma unione
            </Button>
          ) : undefined
        }
      >
        {phase === 'detail' && (
          <View style={c.quick}>
            <QuickAction
              label="Modifica contatto"
              asset={assets.contactEdit}
              onPress={() => setPhase('edit')}
            />
            <QuickAction
              label={`${
                contact.favorite ? 'Disattiva' : 'Attiva'
              } operazioni veloci`}
              asset={assets.contactQuick}
              onPress={() => setPhase('quick')}
            />
            <QuickAction
              label="Elimina contatto"
              asset={assets.contactDelete}
              onPress={() => setPhase('delete')}
            />
          </View>
        )}
        <Title>Dati anagrafici</Title>
        <DataGroup>
          <Fact label="Nominativo">{contact.name}</Fact>
          <Fact label="Alias">{contact.alias || '---'}</Fact>
          {contact.address && (
            <Fact label="Indirizzo">{`${contact.address} ${contact.postal} ${contact.city} ${contact.province}`}</Fact>
          )}
        </DataGroup>
        <Title>Dati conto</Title>
        {contact.relationships.map((item, index) => (
          <DataGroup key={index}>
            <Fact label={relationshipName(item.type)}>{item.value}</Fact>
            {item.bic && <Fact label="BIC">{item.bic}</Fact>}
            {item.country && <Fact label="Paese">{item.country}</Fact>}
            {item.provider && <Fact label="Operatore">{item.provider}</Fact>}
          </DataGroup>
        ))}
        <ErrorText error={error} />
      </Page>
    );
  if (phase === 'edit')
    return (
      <Page
        title={
          contacts.some(item => item.id === contact.id)
            ? 'Modifica contatto'
            : 'Nuovo contatto'
        }
        onBack={detail}
        onClose={onClose}
        footer={
          <Button
            onPress={() => {
              const issue = validateContact(contact);
              if (issue) setError(issue);
              else if (contact.mergeSourceIds) setPhase('merge-review');
              else authorize('save');
            }}
          >
            Salva contatto
          </Button>
        }
      >
        <Field
          label="Nominativo"
          value={contact.name}
          onChange={value => set('name', value)}
        />
        <Field
          label="Alias"
          value={contact.alias}
          onChange={value => set('alias', value)}
        />
        <Field
          label="Indirizzo"
          value={contact.address}
          onChange={value => set('address', value)}
        />
        <Field
          label="Codice postale"
          value={contact.postal}
          onChange={value => set('postal', value)}
          keyboardType="number-pad"
        />
        <Field
          label="Comune"
          value={contact.city}
          onChange={value => set('city', value)}
        />
        <Field
          label="Provincia"
          value={contact.province}
          onChange={value => set('province', value)}
        />
        <Check
          label="Contatto personale"
          value={contact.own}
          onChange={value => set('own', value)}
        />
        <Title>Rapporti</Title>
        {contact.relationships.map((item, index) => (
          <View key={index} style={s.card}>
            <Title>{relationshipName(item.type)}</Title>
            <Field
              label={
                item.type === 'account'
                  ? `IBAN ${index + 1}`
                  : item.type === 'card'
                  ? `Numero carta ${index + 1}`
                  : `Numero di cellulare ${index + 1}`
              }
              value={item.value}
              onChange={value =>
                relationship(
                  index,
                  'value',
                  item.type === 'account'
                    ? value.toUpperCase()
                    : value.replace(/\D/g, ''),
                )
              }
              keyboardType={item.type === 'account' ? 'default' : 'number-pad'}
              autoCapitalize="characters"
            />
            {item.type === 'account' &&
              !!item.value &&
              !item.value.replace(/\s/g, '').toUpperCase().startsWith('IT') && (
                <>
                  <Field
                    label="BIC"
                    value={item.bic ?? ''}
                    onChange={value =>
                      relationship(index, 'bic', value.toUpperCase())
                    }
                    autoCapitalize="characters"
                  />
                  <Field
                    label="Paese"
                    value={item.country ?? ''}
                    onChange={value => relationship(index, 'country', value)}
                  />
                  <Field
                    label="Città"
                    value={item.city ?? ''}
                    onChange={value => relationship(index, 'city', value)}
                  />
                </>
              )}
            {item.type === 'card' && (
              <Choice
                label="Tipo carta"
                value={item.cardType ?? ''}
                options={[
                  'Genius Card',
                  'UniCreditCard Click',
                  'Altra carta prepagata',
                ]}
                onChange={value => relationship(index, 'cardType', value)}
              />
            )}
            {item.type === 'mobile' && (
              <Choice
                label="Operatore telefonico"
                value={item.provider ?? ''}
                options={providers}
                onChange={value => relationship(index, 'provider', value)}
              />
            )}
            <Button
              secondary
              onPress={() =>
                set(
                  'relationships',
                  contact.relationships.filter((_, i) => i !== index),
                )
              }
            >{`Elimina rapporto ${index + 1}`}</Button>
          </View>
        ))}
        <Choice
          label="Tipologia rapporto"
          value={relationshipType}
          options={['Conto', 'Carta prepagata', 'Cellulare']}
          onChange={setRelationshipType}
        />
        <Button
          secondary
          disabled={!relationshipType}
          onPress={() => {
            const type =
              relationshipType === 'Conto'
                ? 'account'
                : relationshipType === 'Carta prepagata'
                ? 'card'
                : 'mobile';
            if (!canAddContactRelationship(contact.relationships, type)) {
              setError(
                'È possibile associare solo IBAN italiani a rapporti di cellulare e/o carta prepagata.',
              );
              return;
            }
            set('relationships', [
              ...contact.relationships,
              { type, value: '' },
            ]);
            setRelationshipType('');
          }}
        >
          Aggiungi rapporto
        </Button>
        <ErrorText error={error} />
      </Page>
    );
  const visible = contacts.filter(item =>
    `${item.name} ${item.alias} ${item.relationships
      .map(r => r.value)
      .join(' ')}`
      .toLocaleLowerCase('it')
      .includes(query.toLocaleLowerCase('it')),
  );
  const card = (item: ProfileContact) => (
    <Pressable
      key={item.id}
      accessibilityRole="button"
      accessibilityLabel={item.name}
      onPress={() => {
        setContact(clone(item));
        setPhase('detail');
      }}
      style={c.contact}
    >
      <View style={c.avatar}>
        <Text style={c.initials}>
          {item.name
            .split(' ')
            .map(word => word[0])
            .slice(0, 2)
            .join('')}
        </Text>
      </View>
      <Text style={c.name}>{item.name}</Text>
      {item.favorite && (
        <AssetGlyph
          asset={assets.imgHomeBankingAndPaymentsFastPaymentsK10}
          size={24}
        />
      )}
    </Pressable>
  );
  return (
    <Page title="Rubrica" onBack={onBack} onClose={onClose}>
      <Field label="Cerca contatto" value={query} onChange={setQuery} />
      <View style={c.quick}>
        <QuickAction
          label="Nuovo contatto"
          asset={assets.imgNavigationAndActionAddK10}
          onPress={() => {
            setContact(blank());
            setPhase('edit');
          }}
        />
        <QuickAction
          label="Unisci contatti"
          asset={assets.imgNavigationAndActionMergeContactsK10}
          onPress={() => {
            setMergeIds([]);
            setPhase('merge');
          }}
        />
      </View>
      {visible.length > 0 && (
        <>
          <Title>I miei conti</Title>
          {visible.filter(item => item.own).map(card)}
          <Title>Beneficiari veloci</Title>
          {visible.filter(item => item.favorite).map(card)}
          <Title>Altri beneficiari</Title>
          {visible
            .filter(item => !item.favorite)
            .sort((a, b) => a.name.localeCompare(b.name, 'it'))
            .map((item, index, rows) => (
              <View key={item.id}>
                {(index === 0 || item.name[0] !== rows[index - 1]?.name[0]) && (
                  <Copy strong>{item.name[0]}</Copy>
                )}
                {card(item)}
              </View>
            ))}
        </>
      )}
      {!visible.length && <Copy>Nessun contatto trovato</Copy>}
    </Page>
  );
}
const c = StyleSheet.create({
  quick: { flexDirection: 'row', gap: 16, marginVertical: 24 },
  contact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    marginVertical: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#262626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { fontFamily: tokens.font, fontSize: 16, color: '#fff' },
  name: {
    flex: 1,
    fontFamily: tokens.strongFont,
    fontSize: 18,
    lineHeight: 24,
    color: tokens.text,
  },
});
