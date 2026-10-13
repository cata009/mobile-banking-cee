import React, { useState, useRef } from 'react';
import { Pressable, StyleSheet, View, ScrollView } from 'react-native';
import { Text } from '../../../../universal/Typography';
import {
  accountNameError,
  saveAccountFavorites,
  saveAccountName,
  saveImportedAccount,
  selectAccountFavorite,
  type MobileFirstAccountRecord,
} from '@/features/accounts-payments/mobileFirstAccounts';
import { Select } from '../../../../universal/Select';
import { AssetGlyph } from '../../../../universal/AssetGlyph';
import { mobileFirstTokens as tokens } from '../../../../universal/tokens';
import favorite from '@/assets/mobile-first/it/account/favorite.svg';
import favoriteOff from '@/assets/mobile-first/it/account/favorite-off.svg';
import importIcon from '@/assets/mobile-first/it/account/import.svg';
import { Button, Copy, Input, Page, Title } from './Primitives';
import AccountAmount from './AccountAmount';
import { shareAccountContract } from './accountExports';

export default function AccountList({
  accounts,
  favorites,
  hidden,
  initialPersonalize,
  onBack,
  onSelect,
  onChanged,
  onProfile,
}: {
  accounts: readonly MobileFirstAccountRecord[];
  favorites: readonly string[];
  hidden: boolean;
  initialPersonalize: boolean;
  onBack: () => void;
  onSelect: (id: string) => void;
  onChanged: () => void;
  onProfile: () => void;
}) {
  const [personalize, setPersonalize] = useState(initialPersonalize),
    [draft, setDraft] = useState([...favorites]),
    [names, setNames] = useState<Record<string, string>>({}),
    [editing, setEditing] = useState<string | null>(null),
    [name, setName] = useState(''),
    [error, setError] = useState<string | null>(null),
    [discard, setDiscard] = useState(false),
    [importStep, setImportStep] = useState(0),
    [bank, setBank] = useState('FINECO'),
    [consent, setConsent] = useState(false),
    [contract, setContract] = useState(false);
  const scroll = useRef<React.ElementRef<typeof ScrollView>>(null),
    letterPositions = useRef<Record<string, number>>({});
  const internal = accounts.filter(account => !account.imported),
    imported = accounts.filter(account => account.imported),
    preferred = draft
      .map(number => internal.find(account => account.number === number))
      .filter((account): account is MobileFirstAccountRecord => !!account),
    others = internal
      .filter(account => !draft.includes(account.number))
      .sort((a, b) => a.name.localeCompare(b.name, 'it'));
  const dirty =
    JSON.stringify(draft) !== JSON.stringify(favorites) ||
    Object.keys(names).length > 0;
  const back = () => {
    if (editing) {
      setEditing(null);
      return;
    }
    if (importStep) {
      setImportStep(importStep > 1 && importStep < 4 ? importStep - 1 : 0);
      return;
    }
    if (personalize) {
      if (dirty) setDiscard(true);
      else if (initialPersonalize) onBack();
      else setPersonalize(false);
    } else onBack();
  };
  const move = (index: number, delta: number) => {
    const next = [...draft],
      other = index + delta;
    if (other < 0 || other >= next.length) return;
    [next[index], next[other]] = [next[other], next[index]];
    setDraft(next);
  };
  if (contract)
    return (
      <Page
        title="Integrazione contrattuale"
        onBack={() => setContract(false)}
        onProfile={onProfile}
        footer={
          <Button
            onPress={() => {
              shareAccountContract().catch(() =>
                setError('Condivisione non completata.'),
              );
            }}
          >
            Visualizza il documento in PDF
          </Button>
        }
      >
        <Title>FACSIMILE</Title>
        <Copy>Tutti i conti e carte con IBAN in un unico ambiente</Copy>
        <Copy>
          Hai scelto di aggiungere un conto o una carta con IBAN che hai su
          altre banche.
        </Copy>
        <Copy>
          Il documento resta a tua disposizione nel Communication Hub.
        </Copy>
        <Copy>Ricordati di rinnovare il consenso alla scadenza.</Copy>
        {error && (
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
        )}
      </Page>
    );
  if (discard)
    return (
      <Page
        title="Attenzione"
        onBack={() => setDiscard(false)}
        onProfile={onProfile}
        footer={
          <>
            <Button
              onPress={() => {
                setDraft([...favorites]);
                setNames({});
                setDiscard(false);
                if (initialPersonalize) onBack();
                else setPersonalize(false);
              }}
            >
              Esci senza salvare
            </Button>
            <Button secondary onPress={() => setDiscard(false)}>
              Continua a modificare
            </Button>
          </>
        }
      >
        <Copy>
          Le modifiche non sono state salvate. Vuoi uscire senza salvare?
        </Copy>
      </Page>
    );
  if (editing)
    return (
      <Page
        title="Modifica nome del conto"
        onBack={() => setEditing(null)}
        onProfile={onProfile}
        footer={
          <>
            <Button
              onPress={() => {
                const problem = accountNameError(name);
                setError(problem);
                if (!problem) {
                  setNames({ ...names, [editing]: name.trim() });
                  setEditing(null);
                }
              }}
            >
              Salva modifica
            </Button>
            <Button secondary onPress={() => setEditing(null)}>
              Annulla
            </Button>
          </>
        }
      >
        <Input
          label="Nome Conto"
          value={name}
          maxLength={20}
          onChangeText={setName}
          placeholder="Inserisci nome"
        />
        <Copy muted>Massimo 20 caratteri alfanumerici</Copy>
        {error && (
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
        )}
      </Page>
    );
  if (importStep)
    return (
      <Page
        title={
          [
            '',
            'Da quale banca vuoi importare un conto o una carta IBAN?',
            'Tutti i conti e carte con IBAN in un unico ambiente',
            'Firma del contratto',
            'Fatto! Operazione completata con successo',
          ][importStep]
        }
        onBack={back}
        onProfile={onProfile}
        footer={
          <Button
            disabled={importStep === 3 && !consent}
            onPress={() => {
              if (importStep === 3) {
                saveImportedAccount({
                  name: 'Andrea Rossini',
                  number: `000011${225 + imported.length}`,
                  balance: 0,
                  bank,
                  imported: true,
                  iban: 'IT60X0542811101000000123458',
                });
                onChanged();
                setImportStep(4);
              } else setImportStep(importStep === 4 ? 0 : importStep + 1);
            }}
          >
            {importStep === 3
              ? 'Firma'
              : importStep === 4
              ? 'Chiudi'
              : 'Prosegui'}
          </Button>
        }
      >
        {importStep === 1 && (
          <>
            <Select
              tokens={tokens}
              label="Paese"
              value="Italia"
              items={[{ value: 'Italia', label: 'Italia' }]}
              onChange={() => {}}
            />
            <Select
              tokens={tokens}
              label="Banca"
              value={bank}
              items={['FINECO', 'Intesa Sanpaolo', 'BNL'].map(x => ({
                value: x,
                label: x,
              }))}
              onChange={setBank}
            />
          </>
        )}
        {importStep === 2 && (
          <>
            <Title>Tutto a portata di mano</Title>
            <Copy>
              Grazie alla PSD2 potrai visualizzare, da Banca via Internet o da
              App Mobile Banking, il saldo e i movimenti dei tuoi conti e delle
              tue carte con IBAN, non solo UniCredit, ma anche di altre Banche.
              Potrai anche effettuare pagamenti da uno dei conti o carte con
              IBAN aggregati, in modo facile e veloce.
            </Copy>
            <Button secondary onPress={() => setContract(true)}>
              Visualizza integrazione contrattuale
            </Button>
          </>
        )}
        {importStep === 3 && (
          <>
            <Copy>
              Hai scelto di aggiungere un conto o una carta con IBAN che hai su
              altre banche. Qui sotto trovi l’integrazione contrattuale.
            </Copy>
            <Title>FACSIMILE</Title>
            <Copy>
              Per proseguire è necessario selezionare tutte le voci sottostanti:
            </Copy>
            <Pressable
              accessibilityRole="checkbox"
              accessibilityLabel="Consenso aggregazione conto"
              accessibilityState={{ checked: consent }}
              onPress={() => setConsent(!consent)}
            >
              <Copy>
                {consent ? '✓' : '○'} Confermo di aver letto l’integrazione
                contrattuale e autorizzo l’aggregazione del conto.
              </Copy>
            </Pressable>
          </>
        )}
        {importStep === 4 && (
          <Copy>
            Il consenso è ora attivo e da oggi puoi consultare i rapporti
            importati nella Banca via internet e sull’APP Mobile Banking
            UniCredit. Ricordati di rinnovare il consenso alla scadenza.
          </Copy>
        )}
      </Page>
    );
  const card = (account: MobileFirstAccountRecord, index?: number) => (
    <View key={account.number} style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${account.name} ${
          hidden ? 'conto nascosto' : account.number
        }`}
        disabled={personalize}
        onPress={() => onSelect(account.number)}
        style={styles.cardMain}
      >
        <Copy strong>{names[account.number] ?? account.name}</Copy>
        <Copy muted>
          {hidden ? '•••••••••' : account.number} -{' '}
          {account.bank ?? 'UniCredit'}
        </Copy>
        <View style={styles.listBalance}>
          <AccountAmount
            value={account.balance}
            hidden={hidden}
            size={24}
            decimalsSize={16}
          />
        </View>
        <Copy muted>Saldo disponibile</Copy>
      </Pressable>
      {personalize && (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Modifica nome ${account.name}`}
            onPress={() => {
              setEditing(account.number);
              setName(
                names[account.number] ??
                  (account.name.length <= 20 ? account.name : ''),
              );
              setError(null);
            }}
            style={styles.edit}
          >
            <Text style={styles.action}>Modifica</Text>
          </Pressable>
          {!account.imported && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Preferito ${account.name}`}
              accessibilityState={{ selected: draft.includes(account.number) }}
              onPress={() =>
                setDraft(selectAccountFavorite(draft, account.number, false))
              }
              style={styles.favorite}
            >
              <AssetGlyph
                asset={draft.includes(account.number) ? favorite : favoriteOff}
                size={24}
              />
            </Pressable>
          )}
          {index !== undefined && (
            <View style={styles.reorder}>
              <Button
                secondary
                disabled={index === 0}
                onPress={() => move(index, -1)}
              >
                Sposta su
              </Button>
              <Button
                secondary
                disabled={index === preferred.length - 1}
                onPress={() => move(index, 1)}
              >
                Sposta giù
              </Button>
            </View>
          )}
        </>
      )}
    </View>
  );
  return (
    <Page
      title="Tutti i conti"
      onBack={back}
      onProfile={onProfile}
      scrollRef={scroll}
      floating={
        <View accessibilityLabel="Indice alfabetico" style={styles.alphabet}>
          {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => (
            <Pressable
              key={letter}
              accessibilityRole="button"
              accessibilityLabel={`Vai alla lettera ${letter}`}
              onPress={() => {
                const y = letterPositions.current[letter];
                if (y !== undefined)
                  scroll.current?.scrollTo({ y, animated: true });
              }}
              style={styles.letterButton}
            >
              <Text style={styles.letterText}>{letter}</Text>
            </Pressable>
          ))}
        </View>
      }
      footer={
        personalize ? (
          <Button
            onPress={() => {
              saveAccountFavorites(draft);
              Object.entries(names).forEach(([id, newName]) =>
                saveAccountName(id, newName),
              );
              onChanged();
              if (initialPersonalize) onBack();
              else {
                setPersonalize(false);
                setNames({});
              }
            }}
          >
            Salva
          </Button>
        ) : (
          <Button onPress={() => setPersonalize(true)}>Personalizza</Button>
        )
      }
    >
      <Title>Preferiti</Title>
      <Copy muted>
        {personalize
          ? 'Puoi scegliere fino a 2 conti preferiti.'
          : 'Mostra i conti che usi più spesso.'}
      </Copy>
      {preferred.map((account, index) =>
        card(account, personalize ? index : undefined),
      )}
      <Title>Tutti i conti UniCredit</Title>
      {others.map((account, index) => (
        <View
          key={account.number}
          onLayout={event => {
            if (index === 0 || account.name[0] !== others[index - 1].name[0])
              letterPositions.current[account.name[0]] =
                event.nativeEvent.layout.y;
          }}
        >
          {(index === 0 || account.name[0] !== others[index - 1].name[0]) && (
            <Text style={styles.groupLetter}>{account.name[0]}</Text>
          )}
          {card(account)}
        </View>
      ))}
      {!!imported.length && (
        <>
          <Title>Conti importati</Title>
          {imported.map(account => card(account))}
        </>
      )}
      {!personalize && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Importa conto"
          onPress={() => setImportStep(1)}
          style={styles.import}
        >
          <AssetGlyph asset={importIcon} size={32} />
          <Copy strong>Importa un conto o una carta IBAN</Copy>
        </Pressable>
      )}
    </Page>
  );
}
const styles = StyleSheet.create({
  card: { backgroundColor: '#f5f5f5', borderRadius: 16, padding: 16, gap: 12 },
  cardMain: { gap: 4, minHeight: 128 },
  listBalance: { marginTop: 'auto', paddingTop: 24 },
  alphabet: {
    position: 'absolute',
    top: 80,
    right: 1,
    width: 13,
    alignItems: 'center',
  },
  letterButton: {
    width: 13,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterText: {
    fontFamily: tokens.font,
    fontSize: 10,
    lineHeight: 12,
    color: '#262626',
  },
  groupLetter: {
    fontFamily: tokens.strongFont,
    fontSize: 18,
    lineHeight: 24,
    color: '#666',
    marginBottom: 8,
  },
  action: { fontFamily: tokens.strongFont, color: tokens.accent },
  edit: { position: 'absolute', top: 16, right: 16 },
  favorite: { position: 'absolute', bottom: 16, right: 16 },
  reorder: { flexDirection: 'row', gap: 8 },
  import: {
    minHeight: 80,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  error: { color: '#b40000', fontFamily: tokens.font },
});
