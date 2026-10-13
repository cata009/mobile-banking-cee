import { Text, TextInput } from '../../../../universal/Typography';
import React, { useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import {
  buildLoanPortfolio,
  createCreditDemoPdf,
  loanInstallments,
  moveLoanFavorite,
  validateLoanName,
  type LoanPreferences,
  type MortgageSimulation,
} from '@/features/credit/mobileFirstLoans';
import {
  LOAN_DEBT_DISCLAIMER,
  LOAN_VARIABLE_DISCLAIMER,
} from '@/experiences/pi/it/mobile-first/loansContent';
import { loansAssets as a } from '@/experiences/pi/it/mobile-first/loansAssets';
import { ActionButton } from '../../../../universal/ActionButton';

import { ModalPanel } from '../../../../universal/ModalPanel';
import { mobileFirstTokens as tokens } from '../../../../universal/tokens';
import { shareDemoFile } from '../../../../platform/nativeFiles';
import { strToU8 } from 'fflate';
import MortgageSimulator from './MortgageSimulator';
import SimulationDetail, { formatSimulationDate } from './SimulationDetail';
import LoanPortfolio, { LoanAlphabet } from './LoanPortfolio';
import forwardTeal from '@/assets/mobile-first/it/imgNavigationAndActionForthT2.svg';
import { AssetGlyph } from '../../../../universal/AssetGlyph';
import type { ItalyNativeScreenProps } from '../contracts';
import {
  Amount,
  CreditHeader,
  Field,
  Grid,
  Link,
  ProductTabs,
  YearStrip,
  QuickAction,
  s,
} from './LoanPrimitives';
import {
  readNativeLoanPreferences,
  readNativeMortgageSimulations,
  saveNativeLoanPreferences,
  saveNativeMortgageSimulation,
} from './session';

type Page =
  | 'detail'
  | 'list'
  | 'info'
  | 'installment'
  | 'rename'
  | 'document'
  | 'help'
  | 'simulations'
  | 'calculator'
  | 'simulation-detail';
type Installment = ReturnType<typeof loanInstallments>[number];
export default function LoanScreen(props: ItalyNativeScreenProps) {
  const { target, productCounts, amountsHidden, onBack, onProfile, onChanged } =
    props;
  const portfolio = buildLoanPortfolio(productCounts);
  const [selectedId, setSelectedId] = useState(
    target.kind === 'loan' ? target.loanId : '',
  );
  const [page, setPage] = useState<Page>(
    target.kind === 'loan' ? 'detail' : 'list',
  );
  const [history, setHistory] = useState<Page[]>([]);
  const [preferences, setPreferences] = useState(() =>
    readNativeLoanPreferences(portfolio),
  );
  const [editing, setEditing] = useState<LoanPreferences | null>(null);
  const [year, setYear] = useState('2025');
  const [installment, setInstallment] = useState<Installment | null>(null);
  const [name, setName] = useState('');
  const [renameId, setRenameId] = useState('');
  const [simulations, setSimulations] = useState(readNativeMortgageSimulations);
  const [simulation, setSimulation] = useState<MortgageSimulation | null>(null);
  const [documentTitle, setDocumentTitle] = useState('Attestazione interessi');
  const [documentContent, setDocumentContent] = useState<string[] | null>(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sheet, setSheet] = useState<'chat' | 'contact' | null>(null);
  const [privacy, setPrivacy] = useState(amountsHidden);
  const scroll = useRef<React.ElementRef<typeof ScrollView>>(null);
  const letterY = useRef<Record<string, number>>({});
  const effective = editing ?? preferences;
  const loans = portfolio.map(item => ({
    ...item,
    name: effective.names[item.id] ?? item.name,
  }));
  const loan = loans.find(item => item.id === selectedId);
  const renameTarget = loans.find(item => item.id === renameId);
  useEffect(() => {
    setPrivacy(amountsHidden);
  }, [amountsHidden]);
  useEffect(() => {
    setSelectedId(target.kind === 'loan' ? target.loanId : '');
    setPage(target.kind === 'loan' ? 'detail' : 'list');
    setHistory([]);
    setEditing(null);
  }, [target]);
  useEffect(() => {
    if (props.intent?.kind === 'loan-action') {
      setSelectedId(
        props.intent.loanId ?? (target.kind === 'loan' ? target.loanId : ''),
      );
      setPage(
        props.intent.view === 'simulations'
          ? 'simulations'
          : props.intent.view === 'list'
          ? 'list'
          : 'detail',
      );
      setHistory([]);
    }
  }, [props.intent, target]);
  useEffect(() => {
    scroll.current?.scrollTo({ y: 0, animated: false });
    letterY.current = {};
  }, [page, selectedId]);
  const navigate = (next: Page) => {
    setHistory(previous => [...previous, page]);
    setPage(next);
    setError(null);
    setNotice('');
  };
  const back = () => {
    if (sheet) {
      setSheet(null);
      return;
    }
    if (editing && page === 'list') {
      setEditing(null);
      return;
    }
    const previous = history.at(-1);
    if (previous) {
      setPage(previous);
      setHistory(history.slice(0, -1));
      setError(null);
      setNotice('');
    } else onBack();
  };
  useEffect(() => {
    if (
      Platform.OS === 'web' ||
      props.isActive === false ||
      page === 'calculator'
    )
      return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      back();
      return true;
    });
    return () => sub.remove();
  });
  const persist = (next: LoanPreferences) => {
    try {
      saveNativeLoanPreferences(next);
      setPreferences(next);
      onChanged();
      return true;
    } catch {
      setError('Non è stato possibile salvare le modifiche. Riprova.');
      return false;
    }
  };
  const openLoan = (id: string) => {
    setSelectedId(id);
    setYear('2025');
    navigate('detail');
  };
  const openRename = (id: string) => {
    setRenameId(id);
    setName(effective.names[id] ?? '');
    navigate('rename');
  };
  const startSimulation = () => {
    navigate('calculator');
  };
  const title =
    page === 'info'
      ? loan?.name
      : page === 'installment'
      ? `Rata N° ${installment?.number ?? ''}`
      : page === 'rename'
      ? `Modifica nome del ${
          renameTarget?.kind.toLowerCase() ?? 'finanziamento'
        }`
      : page === 'document'
      ? documentTitle
      : page === 'help'
      ? `${history.at(-1) === 'info' ? 'Info' : 'Dettaglio Rata'} ${
          loan?.kind ?? 'Mutuo'
        }`
      : page === 'list'
      ? 'Tutti i mutui e prestiti'
      : page === 'simulations'
      ? 'Simulazioni mutuo'
      : page === 'calculator'
      ? 'Simulazione mutuo'
      : simulation?.name;
  const tabs =
    loans.length <= 2
      ? loans.map((item, index) => ({
          value: item.id,
          label:
            index === 1 && loans[0]?.kind === item.kind
              ? `Altro ${item.kind.toLowerCase()}`
              : item.kind,
        }))
      : [
          {
            value: selectedId || loans[0]?.id || '',
            label: loan?.kind ?? loans[0]?.kind ?? 'Mutuo',
          },
          {
            value: 'list',
            label: 'Tutti i mutui e prestiti',
            trailingAsset: a.imgNavigationAndActionForthK10,
          },
        ];
  const documentLines = privacy
    ? ['Importi e identificativi nascosti']
    : documentContent ??
      (loan
        ? [
            loan.name,
            `${loan.kind} ${loan.number}`,
            'Anno 2025',
            `Quota interessi ${(
              loanInstallments(2025, loan).reduce(
                (sum, row) => sum + Math.round(row.interest * 100),
                0,
              ) / 100
            ).toLocaleString('it-IT', { minimumFractionDigits: 2 })} EUR`,
          ]
        : []);
  const progressStyle: ViewStyle = {
    width:
      privacy || !loan
        ? '50%'
        : `${(loan.repaid / (loan.repaid + loan.outstanding)) * 100}%`,
  };
  const installmentRow = (row: Installment, next = false) => (
    <Pressable
      key={row.number}
      accessibilityRole="button"
      accessibilityLabel={`${next ? 'Prossima rata' : 'Rata'} N°${row.number}`}
      onPress={() => {
        setInstallment(row);
        navigate('installment');
      }}
      style={[s.row, s.installment, next && s.next]}
    >
      <View style={s.rowCopy}>
        <Text style={s.body}>Rata N°{row.number}</Text>
        <Text style={s.small}>Scadenza il {row.date}</Text>
      </View>
      <Amount value={row.amount} hidden={privacy} />
    </Pressable>
  );
  let footer: React.ReactNode = null;
  if (page === 'rename')
    footer = (
      <>
        <ActionButton
          labelStyle={s.primaryLabel}
          tokens={tokens}
          label="Salva modifica"
          disabled={!renameTarget || !!validateLoanName(name)}
          onPress={() => {
            if (!renameTarget || validateLoanName(name)) return;
            const next = {
              ...effective,
              names: { ...effective.names, [renameId]: name.trim() },
            };
            if (editing) setEditing(next);
            else if (!persist(next)) return;
            back();
          }}
        />
        <ActionButton
          labelStyle={s.primaryLabel}
          tokens={tokens}
          label="Annulla"
          secondary
          onPress={back}
        />
      </>
    );
  if (page === 'list')
    footer = editing ? (
      <ActionButton
        containerStyle={l.listSave}
        labelStyle={s.primaryLabel}
        tokens={tokens}
        label="Salva modifica"
        disabled={JSON.stringify(editing) === JSON.stringify(preferences)}
        onPress={() => {
          if (persist(editing)) setEditing(null);
        }}
      />
    ) : (
      <Link
        label="PERSONALIZZA VISTA"
        asset={a.imgNavigationAndActionEditT2}
        onPress={() =>
          setEditing({
            names: { ...preferences.names },
            favorites: [...preferences.favorites],
          })
        }
      />
    );
  if (page === 'simulations')
    footer = (
      <ActionButton
        labelStyle={s.primaryLabel}
        tokens={tokens}
        label="Nuova simulazione"
        onPress={startSimulation}
      />
    );
  if (page === 'document')
    footer = (
      <ActionButton
        labelStyle={s.primaryLabel}
        tokens={tokens}
        label="Condividi PDF"
        onPress={() =>
          shareDemoFile(
            `${
              documentTitle.replace(/[^\p{L}\p{N} -]/gu, '').trim() ||
              'Documento'
            }.pdf`,
            'application/pdf',
            strToU8(createCreditDemoPdf(documentTitle, documentLines)),
          ).catch(() =>
            setError(
              'Non è stato possibile condividere il documento. Riprova.',
            ),
          )
        }
      />
    );
  if (page === 'calculator')
    return (
      <MortgageSimulator
        hidden={privacy}
        isActive={props.isActive}
        onClose={back}
        onSave={saved => {
          try {
            saveNativeMortgageSimulation(saved);
            setSimulations(readNativeMortgageSimulations());
            onChanged();
            return true;
          } catch {
            return false;
          }
        }}
      />
    );
  if (page === 'simulation-detail' && simulation)
    return (
      <SimulationDetail
        simulation={simulation}
        hidden={privacy}
        onBack={back}
        onNew={startSimulation}
        onDocument={(nextTitle, lines) => {
          setDocumentTitle(nextTitle);
          setDocumentContent(lines);
          navigate('document');
        }}
      />
    );
  return (
    <KeyboardAvoidingView
      style={s.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <CreditHeader
        onBack={
          ['info', 'installment', 'help'].includes(page) ? undefined : back
        }
        onClose={
          ['info', 'installment', 'rename', 'document', 'help'].includes(page)
            ? back
            : undefined
        }
        closeLabel="Chiudi dettaglio"
        onProfile={
          page === 'detail' || page === 'simulations' ? onProfile : undefined
        }
        onPrivacy={
          page === 'detail' || page === 'simulations'
            ? () => {
                setPrivacy(!privacy);
                props.onAmountsToggle?.();
              }
            : undefined
        }
        hidden={privacy}
        onHelp={
          ['info', 'installment', 'document'].includes(page)
            ? () => navigate('help')
            : undefined
        }
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        ref={scroll}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={s.content}
        stickyHeaderIndices={
          page === 'detail' ? undefined : page === 'simulations' ? [1] : [0]
        }
      >
        {page === 'detail' && loan ? (
          <>
            <ProductTabs
              value={selectedId}
              items={[
                ...tabs,
                { value: 'simulations', label: 'Simulazioni mutuo' },
              ]}
              onChange={id => {
                if (id === 'list' || id === 'simulations') navigate(id);
                else {
                  setSelectedId(id);
                  setYear('2025');
                }
              }}
            />
            <Text style={s.detailTitle}>{loan.name}</Text>
            <Text style={s.subtitle}>
              {loan.kind} - {privacy ? '••••' : loan.number}
            </Text>
            <View style={s.balances}>
              <View style={s.balance}>
                <Text style={s.balanceLabel}>Capitale residuo</Text>
                <Amount value={loan.outstanding} hidden={privacy} />
                <Text style={s.small}>Aggiornato al 23/05/2024</Text>
              </View>
              <View style={s.balance}>
                <Text style={s.balanceLabel}>Capitale rimborsato</Text>
                <Amount value={loan.repaid} hidden={privacy} />
              </View>
            </View>
            <View style={s.actions}>
              <QuickAction
                label={`Info ${loan.kind.toLowerCase()}`}
                asset={a.imgNavigationAndActionInfoSmallK10}
                onPress={() => navigate('info')}
              />
              {loan.kind === 'Mutuo' && (
                <QuickAction
                  label="Attestazione interessi"
                  asset={a.imgNavigationAndActionDocumentK10}
                  width={90}
                  onPress={() => {
                    setDocumentTitle('Attestazione interessi');
                    setDocumentContent(null);
                    navigate('document');
                  }}
                />
              )}
            </View>
            <View style={s.section}>
              <Text style={s.sectionTitle}>Prossima rata</Text>
              {loanInstallments(2025, loan)[0] &&
                installmentRow(loanInstallments(2025, loan)[0]!, true)}
            </View>
            <View style={s.section}>
              <Text style={s.sectionTitle}>Rate annuali</Text>
              <YearStrip year={year} onChange={setYear} />
              {loanInstallments(Number(year), loan).map(row =>
                installmentRow(row),
              )}
              {!loanInstallments(Number(year), loan).length && (
                <Text style={s.body}>
                  Nessuna rata disponibile per l’anno selezionato.
                </Text>
              )}
            </View>
          </>
        ) : page === 'detail' ? (
          <>
            <Text style={s.title}>Finanziamento non disponibile</Text>
            <Text style={[s.body, s.mt16]}>
              Il mutuo o prestito selezionato non è presente nel tuo
              portafoglio.
            </Text>
            <Link
              label="Tutti i mutui e prestiti"
              onPress={() => navigate('list')}
            />
          </>
        ) : null}
        {page === 'simulations' && (
          <ProductTabs
            value="simulations"
            items={[
              ...tabs,
              { value: 'simulations', label: 'Simulazioni mutuo' },
            ]}
            onChange={id => {
              if (id === 'list') navigate('list');
              else if (id !== 'simulations') openLoan(id);
            }}
          />
        )}
        {page !== 'detail' && (
          <View style={l.stickyHeading}>
            <View pointerEvents="none" style={l.headingBefore} />
            <Text accessibilityRole="header" style={s.title}>
              {title}
            </Text>
            <View pointerEvents="none" style={l.headingAfter} />
          </View>
        )}
        {page === 'list' && (
          <LoanPortfolio
            loans={loans}
            favorites={effective.favorites}
            editing={!!editing}
            hidden={privacy}
            onOpen={openLoan}
            onRename={openRename}
            onFavorite={id =>
              setEditing(
                previous =>
                  previous && {
                    ...previous,
                    favorites: previous.favorites.includes(id)
                      ? previous.favorites.filter(item => item !== id)
                      : [...previous.favorites, id],
                  },
              )
            }
            onMove={(id, direction) =>
              setEditing(
                previous =>
                  previous && {
                    ...previous,
                    favorites: moveLoanFavorite(
                      previous.favorites,
                      id,
                      direction,
                    ),
                  },
              )
            }
            onSimulation={() => navigate('simulations')}
            onLetterLayout={(letter, y) => {
              letterY.current[letter] = y;
            }}
          />
        )}
        {page === 'info' && loan && (
          <>
            <Text style={s.subtitle}>{privacy ? '••••' : loan.number}</Text>
            <Link
              label="MODIFICA NOME"
              asset={a.imgNavigationAndActionEditT2}
              onPress={() => openRename(loan.id)}
            />
            <View style={s.section}>
              <Text style={s.cardHeading}>Capitale erogato</Text>
              <Amount value={loan.outstanding + loan.repaid} hidden={privacy} />
              <View
                accessibilityLabel={
                  privacy ? 'Capitale nascosto' : 'Capitale estinto e residuo'
                }
                style={s.progress}
              >
                <View style={[s.progressFill, progressStyle]} />
              </View>
              <View style={s.balances}>
                <Field label="Capitale estinto">
                  <Amount value={loan.repaid} hidden={privacy} small />
                </Field>
                <Field label="Capitale residuo">
                  <Amount value={loan.outstanding} hidden={privacy} small />
                </Field>
              </View>
            </View>
            <Grid>
              <Field label="Valuta">Eur</Field>
              <Field label="Capitale residuo">
                <Amount value={loan.outstanding} hidden={privacy} small />
              </Field>
              <Field label="Capitale rimborsato">
                <Amount value={loan.repaid} hidden={privacy} small />
              </Field>
              <Field label="Data di erogazione">06/11/2007</Field>
              <Field label="Numero rate residue">
                {
                  Array.from({ length: 16 }, (_, i) =>
                    loanInstallments(2025 + i, loan),
                  ).flat().length
                }
              </Field>
              <Field label="Periodicità rate">Mensile</Field>
            </Grid>
            <Text style={s.disclaimer}>{LOAN_VARIABLE_DISCLAIMER}</Text>
            <Text style={s.disclaimer}>{LOAN_DEBT_DISCLAIMER}</Text>
          </>
        )}
        {page === 'installment' && loan && installment && (
          <>
            <Text style={s.subtitle}>{loan.name}</Text>
            <Grid>
              <Field label="Scadenza">{installment.date}</Field>
              {(
                [
                  ['Quota capitale', installment.capital],
                  ['Quota interessi', installment.interest],
                  ['Altre voci', installment.other],
                  ['Totale rata', installment.amount],
                  ['Capitale residuo', installment.outstanding],
                ] as const
              ).map(([label, value]) => (
                <Field key={label} label={label}>
                  <Amount value={value} hidden={privacy} small />
                </Field>
              ))}
            </Grid>
          </>
        )}
        {page === 'rename' && renameTarget && (
          <>
            <Text style={l.renameLabel}>Nome {renameTarget.kind}</Text>
            <TextInput
              accessibilityLabel={`Nome ${renameTarget.kind}`}
              value={name}
              onChangeText={setName}
              autoFocus
              maxLength={20}
              placeholder="Inserisci nome"
              style={l.renameInput}
            />
            <Text style={[s.small, l.renameHint]}>
              Massimo 20 caratteri alfanumerici
            </Text>
            <View style={s.mt16}>
              <Link
                label="Ripristina nome di default"
                asset={null}
                onPress={() =>
                  setName(
                    portfolio.find(item => item.id === renameId)?.name ?? '',
                  )
                }
              />
            </View>
          </>
        )}
        {page === 'document' && (
          <>
            <View style={s.document}>
              <Text style={s.title}>UniCredit</Text>
              <Text style={s.cardHeading}>{documentTitle}</Text>
              <Text style={s.body}>Documento dimostrativo - PI Italy</Text>
              {documentLines.map((line, index) => (
                <Text key={index} style={s.body}>
                  {line}
                </Text>
              ))}
            </View>
          </>
        )}
        {page === 'help' && (
          <>
            <Text style={l.helpIntro}>
              Puoi visualizzare, di ciascuna rata del tuo{' '}
              {loan?.kind.toLowerCase() ?? 'finanziamento'}:
            </Text>
            <View style={l.helpList}>
              {[
                'Scadenza',
                'Quota capitale',
                'Quota interessi',
                'Altre voci',
                'Totale rata',
                'Capitale residuo',
              ].map(label => (
                <Text key={label} style={l.helpListItem}>
                  • {label}
                </Text>
              ))}
            </View>
            <View style={s.section}>
              <Text style={[s.sectionTitle, l.helpSectionTitle]}>
                Potrebbe interessarti
              </Text>
              {['Dettaglio Rata Prestito', 'Info Mutuo', 'Info Prestito'].map(
                label => (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={label}
                    style={l.helpRow}
                    key={label}
                    onPress={() => {
                      const kind = label.includes('Prestito')
                        ? 'Prestito'
                        : 'Mutuo';
                      const next =
                        loan?.kind === kind
                          ? loan
                          : loans.find(item => item.kind === kind);
                      if (!next) {
                        setSheet('contact');
                        return;
                      }
                      setSelectedId(next.id);
                      if (next.id !== loan?.id) {
                        setInstallment(loanInstallments(2025, next)[0] ?? null);
                        setYear('2025');
                      } else if (!installment) {
                        setInstallment(loanInstallments(2025, next)[0] ?? null);
                      }
                      setHistory(previous =>
                        previous.filter(
                          item =>
                            item !== 'help' &&
                            item !== 'info' &&
                            item !== 'installment',
                        ),
                      );
                      setPage(
                        label.startsWith('Info') ? 'info' : 'installment',
                      );
                    }}
                  >
                    <Text style={l.helpRowLabel}>{label}</Text>
                    <AssetGlyph
                      asset={forwardTeal}
                      width={16}
                      height={27}
                      fit="stretch"
                    />
                  </Pressable>
                ),
              )}
            </View>
            <View style={s.mt24}>
              <Link
                label="VEDI TUTTE LE FAQ"
                onPress={() => setSheet('contact')}
              />
            </View>
            <View style={l.support}>
              <QuickAction
                label="Avvia Chat"
                asset={a.imgNavigationAndActionChat}
                onPress={() => setSheet('chat')}
              />
              <QuickAction
                label="Parla con noi"
                asset={a.imgBankTouchpointAndCustomerCareAgency}
                onPress={() => setSheet('contact')}
              />
            </View>
          </>
        )}
        {page === 'simulations' && (
          <>
            <Text style={[s.body, s.mt16]}>
              Da questa pagina è possibile visualizzare l’elenco delle tue
              simulazioni. Il limite massimo è di 70 visualizzazioni.
            </Text>
            {simulations.map(item => (
              <View key={item.id} style={s.row}>
                <View style={s.rowCopy}>
                  <Text style={s.body}>{item.name}</Text>
                  <Text style={s.cardHeading}>
                    {formatSimulationDate(item.createdAt)}
                  </Text>
                  <Text style={s.small}>{item.draft.years} anni</Text>
                  <Amount value={item.draft.principal} hidden={privacy} small />
                </View>
                <Link
                  label={`Dettaglio ${item.name}`}
                  asset={a.imgNavigationAndActionEditT2}
                  text="DETTAGLIO"
                  onPress={() => {
                    setSimulation(item);
                    navigate('simulation-detail');
                  }}
                />
              </View>
            ))}
            {!simulations.length && (
              <Text style={s.body}>
                Non ci sono simulazioni da visualizzare.
              </Text>
            )}
          </>
        )}
        {error && (
          <Text accessibilityRole="alert" style={s.error}>
            {error}
          </Text>
        )}
        {notice && (
          <Text accessibilityLiveRegion="polite" style={s.notice}>
            {notice}
          </Text>
        )}
      </ScrollView>
      {page === 'list' &&
        loans.some(item => !effective.favorites.includes(item.id)) && (
          <LoanAlphabet
            letters={loans
              .filter(item => !effective.favorites.includes(item.id))
              .map(item => item.name[0]?.toLocaleUpperCase('it') ?? '')}
            onSelect={letter => {
              const y = letterY.current[letter];
              if (y !== undefined)
                scroll.current?.scrollTo({ y, animated: true });
            }}
          />
        )}
      {footer && (
        <View style={[s.footer, page === 'list' && l.listFooter]}>
          {footer}
        </View>
      )}
      <ModalPanel
        tokens={tokens}
        visible={!!sheet}
        title={sheet === 'chat' ? 'Avvia Chat' : 'Parla con noi'}
        closeLabel="Chiudi"
        onClose={() => setSheet(null)}
      >
        <Text style={s.body}>
          {sheet === 'chat'
            ? 'Come possiamo aiutarti con il tuo mutuo o prestito?'
            : 'Per informazioni sul tuo finanziamento contatta la tua filiale UniCredit.'}
        </Text>
        <Text style={s.body}>Andrea Rossini · UniCredit</Text>
        <Link label="Torna al finanziamento" onPress={() => setSheet(null)} />
      </ModalPanel>
    </KeyboardAvoidingView>
  );
}
const l = StyleSheet.create({
  renameLabel: {
    marginTop: 24,
    marginBottom: 4,
    fontFamily: tokens.font,
    color: tokens.text,
    fontSize: 18,
    lineHeight: 24,
  },
  renameHint: { marginTop: 4 },
  renameInput: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: '#909090',
    borderRadius: 16,
    padding: 16,
    fontFamily: tokens.font,
    color: tokens.text,
    fontSize: 18,
    lineHeight: 24,
  },
  listFooter: { minHeight: 72, alignItems: 'center', justifyContent: 'center' },
  listSave: { alignSelf: 'stretch' },
  stickyHeading: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    zIndex: 10,
  },
  headingBefore: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: -24,
    height: 24,
    backgroundColor: '#fff',
  },
  headingAfter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -24,
    height: 24,
    backgroundColor: '#fff',
  },
  helpList: { marginTop: 24, marginBottom: 0, paddingLeft: 24 },
  helpIntro: {
    fontFamily: tokens.font,
    color: tokens.text,
    fontSize: 16,
    lineHeight: 24,
  },
  helpSectionTitle: { marginBottom: 0 },
  helpRowLabel: {
    fontFamily: tokens.font,
    color: tokens.text,
    fontSize: 18,
    lineHeight: 27,
  },
  helpListItem: {
    fontFamily: tokens.font,
    color: tokens.text,
    fontSize: 18,
    lineHeight: 28,
  },
  helpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  support: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 48,
    marginTop: 40,
  },
});
