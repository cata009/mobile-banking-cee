import { Text } from '../../../../universal/Typography';
import React, { useEffect, useState, useSyncExternalStore } from 'react';
import {
  BackHandler,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  filterInsuranceDocuments,
  getInsuranceSnapshot,
  insurancePeriod,
  markInsuranceDocumentRead,
  recordInsuranceRequest,
  saveInsuranceDocumentFilter,
  subscribeInsurance,
  validInsuranceCertificateYear,
  validateInsuranceDocumentFilter,
  type InsuranceDocument,
  type InsuranceDocumentFilter,
  type InsurancePolicy,
} from '@/features/insurance/mobileFirstInsurance';
import {
  DEFAULT_INSURANCE_DOCUMENT_FILTER,
  INSURANCE_DOCUMENT_CATEGORIES,
  INSURANCE_REFERENCE_DATE,
  INSURANCE_REFERENCE_YEAR,
  insuranceDocuments,
} from '@/experiences/pi/it/mobile-first/insuranceContent';
import { Select } from '../../../../universal/Select';
import { mobileFirstTokens as tokens } from '../../../../universal/tokens';
import { CreditHeader, s } from '../loans/LoanPrimitives';
import {
  InsuranceLink as Link,
  InsuranceButton as ActionButton,
} from './InsurancePrimitives';
import { createInsuranceExport } from '@/features/insurance/mobileFirstInsuranceExports';
import { shareDemoFile } from '../../../../platform/nativeFiles';
import { DateField, CalendarPanel } from '../../../../universal/DateField';
import { AssetGlyph } from '../../../../universal/AssetGlyph';
import { insuranceAssets as a } from '@/experiences/pi/it/mobile-first/insuranceAssets';
import InsuranceHelp from './InsuranceHelp';

export function insuranceDate(value: string) {
  return value.split('-').reverse().join('/');
}
type Page =
  | 'list'
  | 'filters'
  | 'dates'
  | 'category'
  | 'document'
  | 'request'
  | 'share';
export default function InsuranceDocuments({
  policy,
  hidden,
  onBack,
  onChanged,
  initialDocument,
  isActive,
}: {
  policy: InsurancePolicy;
  hidden: boolean;
  onBack: () => void;
  onChanged: () => void;
  initialDocument?: InsuranceDocument;
  isActive?: boolean;
}) {
  const snapshot = useSyncExternalStore(
    subscribeInsurance,
    getInsuranceSnapshot,
    getInsuranceSnapshot,
  );
  const [page, setPage] = useState<Page>(initialDocument ? 'document' : 'list');
  const [document, setDocument] = useState<InsuranceDocument | null>(
    initialDocument ?? null,
  );
  const [filters, setFilters] = useState<InsuranceDocumentFilter>(
    snapshot.documentFilters[policy.id] ?? DEFAULT_INSURANCE_DOCUMENT_FILTER,
  );
  const [draft, setDraft] = useState<InsuranceDocumentFilter>(filters);
  const [selected, setSelected] = useState<string[]>([]);
  const [request, setRequest] = useState<
    'Attestazione ISEE' | 'Titolarità conto'
  >('Attestazione ISEE');
  const [year, setYear] = useState('');
  const [period, setPeriod] = useState<number | null>(6);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const results = filterInsuranceDocuments(
    insuranceDocuments(policy.id),
    filters,
  );
  const selectedDocuments = results.filter(item => selected.includes(item.id));
  const goBack = () => {
    if (page === 'list' || initialDocument) onBack();
    else {
      setPage(page === 'dates' || page === 'category' ? 'filters' : 'list');
      setNotice('');
      setError(null);
    }
  };
  useEffect(() => {
    if (Platform.OS === 'web' || isActive === false || helpOpen) return;
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        goBack();
        return true;
      },
    );
    return () => subscription.remove();
  });
  const share = (
    items: readonly InsuranceDocument[],
    format: 'pdf' | 'xlsx',
  ) => {
    if (hidden || !items.length) return;
    shareDemoFile(
      `documenti-polizza-${policy.number}.${format}`,
      format === 'pdf'
        ? 'application/pdf'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      createInsuranceExport(policy, items, format),
    )
      .then(() => setNotice('Documento scaricato.'))
      .catch(() => setError('Il documento non è disponibile. Riprova.'));
  };
  const openDocument = (item: InsuranceDocument) => {
    setDocument(item);
    markInsuranceDocumentRead(item.id);
    onChanged();
    setPage('document');
  };
  const openRequest = (kind: typeof request) => {
    setRequest(kind);
    setYear('');
    setNotice('');
    setPage('request');
  };
  let footer: React.ReactNode = null;
  const choiceTokens = {
    ...tokens,
    radius: 16,
    border: '#909090',
    controlHeight: 56,
  };
  if (page === 'dates')
    footer = (
      <ActionButton
        tokens={tokens}
        labelStyle={s.primaryLabel}
        label="Salva"
        onPress={() => {
          const problem = validateInsuranceDocumentFilter(draft);
          setError(problem);
          if (!problem) setPage('filters');
        }}
      />
    );
  if (page === 'category')
    footer = (
      <ActionButton
        tokens={tokens}
        labelStyle={s.primaryLabel}
        label="Conferma"
        onPress={() => setPage('filters')}
      />
    );
  if (page === 'filters')
    footer = (
      <>
        <ActionButton
          tokens={tokens}
          label="Rimuovi Filtri"
          containerStyle={[d.flex, d.secondaryButton]}
          labelStyle={[s.primaryLabel, d.secondaryLabel]}
          secondary
          onPress={() => {
            const next = { from: '', to: '', category: '' };
            setFilters(next);
            setDraft(next);
            saveInsuranceDocumentFilter(policy.id, next);
            setSelected([]);
            onChanged();
            setPage('list');
          }}
        />
        <ActionButton
          labelStyle={s.primaryLabel}
          tokens={tokens}
          label="Applica"
          containerStyle={d.flex}
          onPress={() => {
            const problem = validateInsuranceDocumentFilter(draft);
            setError(problem);
            if (problem) return;
            setFilters(draft);
            saveInsuranceDocumentFilter(policy.id, draft);
            setSelected([]);
            onChanged();
            setPage('list');
          }}
        />
      </>
    );
  if (page === 'request')
    footer = (
      <ActionButton
        labelStyle={s.primaryLabel}
        tokens={tokens}
        label="Richiedi"
        disabled={
          !!notice ||
          (request === 'Attestazione ISEE' &&
            !validInsuranceCertificateYear(year, INSURANCE_REFERENCE_YEAR))
        }
        onPress={() => {
          if (
            notice ||
            (request === 'Attestazione ISEE' &&
              !validInsuranceCertificateYear(year, INSURANCE_REFERENCE_YEAR))
          )
            return;
          recordInsuranceRequest(policy.id, request, year || undefined);
          onChanged();
          setNotice(
            'Richiesta registrata. Il documento sarà disponibile nella sezione Documenti.',
          );
        }}
      />
    );
  if (page === 'share')
    footer = (
      <>
        {(['xlsx', 'pdf'] as const).map(format => (
          <ActionButton
            labelStyle={s.primaryLabel}
            key={format}
            containerStyle={d.flex}
            tokens={tokens}
            label={format === 'xlsx' ? 'Condividi Excel' : 'Condividi PDF'}
            disabled={!selectedDocuments.length || hidden}
            onPress={() => share(selectedDocuments, format)}
          />
        ))}
      </>
    );
  if (page === 'document' && document)
    footer = (
      <ActionButton
        labelStyle={s.primaryLabel}
        tokens={tokens}
        label="Condividi PDF"
        disabled={hidden}
        onPress={() => share([document], 'pdf')}
      />
    );
  if (helpOpen)
    return (
      <InsuranceHelp isActive={isActive} onClose={() => setHelpOpen(false)} />
    );
  return (
    <View style={s.screen}>
      <CreditHeader
        onClose={goBack}
        onHelp={page === 'filters' ? () => setHelpOpen(true) : undefined}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={s.content}
      >
        <View style={[d.heading, page === 'list' && d.documentHeading]}>
          <Text accessibilityRole="header" style={s.title}>
            {page === 'list'
              ? 'Documenti'
              : page === 'filters'
              ? 'Filtri di ricerca'
              : page === 'dates'
              ? 'Data'
              : page === 'category'
              ? 'Seleziona la categoria'
              : page === 'request'
              ? request
              : page === 'share'
              ? 'Condividi documenti'
              : document?.title}
          </Text>
          {page === 'list' && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Filtri di ricerca"
              onPress={() => {
                setDraft(filters);
                setError(null);
                setPage('filters');
              }}
              style={d.filterButton}
            >
              <AssetGlyph asset={a.filter} size={48} />
            </Pressable>
          )}
        </View>
        {page === 'list' && (
          <>
            <View style={d.applied}>
              <Text style={s.body}>Filtri applicati:</Text>
              {(filters.from || filters.to) && (
                <Text style={d.body}>
                  Periodo:{' '}
                  <Text style={d.appliedValue}>
                    {filters.from
                      ? insuranceDate(filters.from)
                      : 'Qualsiasi data'}{' '}
                    -{' '}
                    {filters.to ? insuranceDate(filters.to) : 'Qualsiasi data'}
                  </Text>
                </Text>
              )}
              {filters.category && (
                <Text style={d.body}>
                  Documento:{' '}
                  <Text style={d.appliedValue}>{filters.category}</Text>
                </Text>
              )}
            </View>
            <View style={d.requests}>
              {(['Attestazione ISEE', 'Titolarità conto'] as const).map(
                kind => (
                  <Pressable
                    key={kind}
                    accessibilityRole="button"
                    accessibilityLabel={`${kind} Richiedi`}
                    onPress={() => openRequest(kind)}
                    style={[
                      d.requestCard,
                      kind === 'Titolarità conto' && d.accountRequest,
                    ]}
                  >
                    <Text style={d.requestTitle}>
                      {kind.replace(' ', '\n')}
                    </Text>
                    <View style={d.requestLink}>
                      <Text style={d.requestLinkLabel}>RICHIEDI</Text>
                      <AssetGlyph asset={a.forthWhite} size={16} />
                    </View>
                  </Pressable>
                ),
              )}
            </View>
            <View style={d.share}>
              <Link
                label="Condividi"
                asset={a.share}
                glyphSize={14}
                disabled={!results.length || hidden}
                onPress={() => {
                  setSelected([]);
                  setPage('share');
                }}
              />
            </View>
            {results.map(item => (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityLabel={`Apri documento ${
                  item.title
                } ${insuranceDate(item.date)}`}
                onPress={() => openDocument(item)}
                style={[
                  d.documentRow,
                  (item.read || snapshot.readDocuments.includes(item.id)) &&
                    d.readDocument,
                ]}
              >
                <View style={d.documentDate}>
                  <Text style={s.title}>{item.date.slice(8)}</Text>
                  <Text style={d.documentMonth}>
                    {`${new Date(`${item.date}T12:00:00Z`)
                      .toLocaleDateString('it-IT', {
                        month: 'short',
                        timeZone: 'UTC',
                      })
                      .replace('.', '')
                      .toLocaleUpperCase('it')} ${item.date.slice(2, 4)}`}
                  </Text>
                </View>
                <View style={d.documentCopy}>
                  <Text style={s.small}>{item.category}</Text>
                  <Text
                    style={[
                      d.documentTitle,
                      (item.read ||
                        snapshot.readDocuments.includes(item.id)) && {
                        fontFamily: tokens.font,
                      },
                    ]}
                  >
                    {item.title}
                  </Text>
                  <Text style={d.documentReference}>
                    Riferimento: {hidden ? '••••' : item.reference}
                  </Text>
                </View>
              </Pressable>
            ))}
            {!results.length && (
              <View style={s.section}>
                <Text style={s.sectionTitle}>Nessun documento trovato</Text>
                <Text style={s.body}>
                  Modifica i filtri di ricerca per visualizzare altri documenti.
                </Text>
              </View>
            )}
          </>
        )}
        {page === 'filters' && (
          <>
            <View style={d.filterSection}>
              <Text style={d.filterHeading}>Data</Text>
              <View style={d.periods}>
                {[3, 6, 12].map(months => (
                  <Pressable
                    key={months}
                    accessibilityRole="button"
                    accessibilityLabel={`${months}M`}
                    accessibilityState={{ selected: period === months }}
                    onPress={() => {
                      setPeriod(months);
                      setDraft({
                        ...draft,
                        ...insurancePeriod(months, INSURANCE_REFERENCE_DATE),
                      });
                    }}
                    style={[d.period, period === months && d.selectedPeriod]}
                  >
                    {period === months && (
                      <AssetGlyph asset={a.tick} size={16} />
                    )}
                    <Text
                      style={[
                        d.periodLabel,
                        period === months && d.selectedPeriodLabel,
                      ]}
                    >
                      {months}M
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Text style={d.filterLabel}>Personalizza periodo</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Personalizza periodo"
                onPress={() => {
                  setError(null);
                  setPage('dates');
                }}
                style={d.select}
              >
                <Text style={[d.label, d.flex]}>
                  {draft.from ? insuranceDate(draft.from) : 'gg/mm/aaaa'} -{' '}
                  {draft.to ? insuranceDate(draft.to) : 'gg/mm/aaaa'}
                </Text>
                <AssetGlyph asset={a.calendar} size={24} />
              </Pressable>
            </View>
            <View style={d.filterSection}>
              <Text style={d.filterHeading}>Documento</Text>
              <Text style={d.filterLabel}>Seleziona documento</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Seleziona documento"
                onPress={() => setPage('category')}
                style={d.select}
              >
                <Text style={[d.label, d.flex]}>
                  {draft.category || 'Scegli il documento'}
                </Text>
                <View style={d.dropdown}>
                  <AssetGlyph asset={a.dropdown} size={24.0034} />
                </View>
              </Pressable>
            </View>
          </>
        )}
        {page === 'dates' && (
          <>
            <View style={d.dateFields}>
              {(['from', 'to'] as const).map(key => (
                <View style={d.flex} key={key}>
                  <DateField
                    tokens={choiceTokens}
                    label={key === 'from' ? 'Data iniziale' : 'Data finale'}
                    value={draft[key]}
                    onChange={value => {
                      setDraft({ ...draft, [key]: value });
                      setPeriod(null);
                    }}
                    containerStyle={d.dateField}
                    labelStyle={d.label}
                    inputProps={{ style: d.dateInput }}
                    calendarButtonStyle={d.calendarButton}
                    calendarIcon={<AssetGlyph asset={a.calendar} size={24} />}
                  />
                </View>
              ))}
            </View>
            {(['from', 'to'] as const).map(key => (
              <View style={d.calendar} key={key}>
                <CalendarPanel
                  compact
                  tokens={tokens}
                  value={draft[key] || INSURANCE_REFERENCE_DATE}
                  onSelect={value => {
                    setDraft({ ...draft, [key]: value });
                    setPeriod(null);
                  }}
                  onMonthChange={value => {
                    setDraft({ ...draft, [key]: value });
                    setPeriod(null);
                  }}
                  onClose={() => setPage('filters')}
                  previousIcon={<AssetGlyph asset={a.calendarBack} size={24} />}
                  nextIcon={
                    <View style={d.rotate}>
                      <AssetGlyph asset={a.calendarBack} size={24} />
                    </View>
                  }
                />
              </View>
            ))}
          </>
        )}
        {page === 'category' && (
          <>
            {INSURANCE_DOCUMENT_CATEGORIES.map(group => (
              <View key={group.heading} style={d.categoryGroup}>
                <Text style={d.categoryHeading}>{group.heading}</Text>
                {group.values.map(value => (
                  <Pressable
                    key={value}
                    accessibilityRole="button"
                    accessibilityLabel={value}
                    accessibilityState={{ selected: draft.category === value }}
                    onPress={() => setDraft({ ...draft, category: value })}
                    style={d.categoryRow}
                  >
                    <Text
                      style={[
                        d.categoryLabel,
                        draft.category === value && d.selectedPeriodLabel,
                      ]}
                    >
                      {value}
                    </Text>
                    {draft.category === value && (
                      <Text style={d.selectedPeriodLabel}>✓</Text>
                    )}
                  </Pressable>
                ))}
              </View>
            ))}
          </>
        )}
        {page === 'request' && (
          <>
            <Text style={s.subtitle}>{policy.name}</Text>
            {request === 'Attestazione ISEE' ? (
              <>
                <Text style={d.requestLabel}>Anno di riferimento</Text>
                <Select
                  tokens={choiceTokens}
                  label="Anno di riferimento"
                  closeLabel="Chiudi"
                  value={year}
                  items={[
                    { value: '', label: 'Seleziona anno' },
                    ...[2024, 2023, 2022, 2021, 2020].map(value => ({
                      value: String(value),
                      label: String(value),
                    })),
                  ]}
                  onChange={setYear}
                />
              </>
            ) : (
              <Text style={[s.body, s.mt24]}>
                Richiedi il documento di titolarità del conto associato alla
                polizza.
              </Text>
            )}
          </>
        )}
        {page === 'document' && document && (
          <>
            <View style={s.document}>
              <Text style={s.title}>UniCredit</Text>
              <Text style={s.cardHeading}>FACSIMILE</Text>
              <Text style={s.body}>{policy.name}</Text>
              {hidden ? (
                <Text style={s.body}>Importi e identificativi nascosti</Text>
              ) : (
                <>
                  <Text style={s.body}>Numero polizza {policy.number}</Text>
                  <Text style={s.body}>{document.title}</Text>
                  <Text style={s.body}>{insuranceDate(document.date)}</Text>
                  <Text style={s.body}>Riferimento: {document.reference}</Text>
                </>
              )}
            </View>
          </>
        )}
        {page === 'share' && (
          <>
            <Pressable
              accessibilityRole="checkbox"
              accessibilityLabel="Seleziona tutti i documenti"
              accessibilityState={{
                checked:
                  results.length > 0 &&
                  selectedDocuments.length === results.length,
              }}
              onPress={() =>
                setSelected(
                  selectedDocuments.length === results.length
                    ? []
                    : results.map(item => item.id),
                )
              }
              style={s.row}
            >
              <Text style={s.cardHeading}>Seleziona tutti i documenti</Text>
              <Text style={s.body}>
                {selectedDocuments.length === results.length ? '✓' : '○'}
              </Text>
            </Pressable>
            {results.map(item => (
              <Pressable
                key={item.id}
                accessibilityRole="checkbox"
                accessibilityLabel={`Seleziona ${item.title} ${insuranceDate(
                  item.date,
                )}`}
                accessibilityState={{ checked: selected.includes(item.id) }}
                onPress={() =>
                  setSelected(
                    selected.includes(item.id)
                      ? selected.filter(id => id !== item.id)
                      : [...selected, item.id],
                  )
                }
                style={s.row}
              >
                <Text style={s.body}>
                  {selected.includes(item.id) ? '✓' : '○'}
                </Text>
                <View style={s.rowCopy}>
                  <Text style={s.cardHeading}>{item.title}</Text>
                  <Text style={s.small}>{insuranceDate(item.date)}</Text>
                  <Text style={s.small}>
                    Riferimento: {hidden ? '••••' : item.reference}
                  </Text>
                </View>
              </Pressable>
            ))}
          </>
        )}
        {notice && (
          <Text accessibilityLiveRegion="polite" style={s.notice}>
            {notice}
          </Text>
        )}
        {error && (
          <Text accessibilityRole="alert" style={s.error}>
            {error}
          </Text>
        )}
      </ScrollView>
      {footer && (
        <View
          style={[
            d.footer,
            (page === 'filters' || page === 'share') && d.footerRow,
          ]}
        >
          {footer}
        </View>
      )}
    </View>
  );
}
const d = StyleSheet.create({
  heading: { position: 'relative' },
  documentHeading: { marginHorizontal: -16, paddingHorizontal: 16 },
  filterButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applied: { gap: 12, marginVertical: 40 },
  appliedValue: { fontFamily: tokens.strongFont },
  requests: { flexDirection: 'row', gap: 16, marginBottom: 40 },
  requestCard: {
    flex: 1,
    minHeight: 128,
    padding: 24,
    gap: 16,
    borderRadius: 16,
    backgroundColor: '#007a91',
    alignItems: 'flex-start',
  },
  accountRequest: { backgroundColor: '#005568' },
  requestTitle: {
    fontFamily: tokens.strongFont,
    color: '#fff',
    fontSize: 18,
    lineHeight: 24,
  },
  requestLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  requestLinkLabel: {
    fontFamily: tokens.strongFont,
    color: '#fff',
    fontSize: 14,
    lineHeight: 16,
  },
  share: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 16 },
  documentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
    marginBottom: 4,
  },
  readDocument: { backgroundColor: '#fff', borderColor: '#ccc' },
  documentDate: { width: 42, paddingTop: 8, gap: 8, alignItems: 'center' },
  documentMonth: {
    fontFamily: tokens.font,
    color: tokens.text,
    fontSize: 12,
    lineHeight: 14,
  },
  documentCopy: { flex: 1, gap: 8 },
  documentTitle: {
    fontFamily: tokens.strongFont,
    color: tokens.text,
    fontSize: 18,
    lineHeight: 20,
  },
  documentReference: {
    fontFamily: tokens.font,
    color: tokens.text,
    fontSize: 18,
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#ffffffF2',
  },
  flex: { flex: 1 },
  body: {
    fontFamily: tokens.font,
    color: tokens.text,
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 0,
  },
  label: {
    fontFamily: tokens.font,
    color: tokens.text,
    fontSize: 18,
    lineHeight: 24,
  },
  periods: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  period: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 42,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#666',
    borderRadius: 48,
  },
  selectedPeriod: {
    borderWidth: 3,
    borderColor: '#007a91',
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  periodLabel: {
    fontFamily: tokens.font,
    color: '#666',
    fontSize: 16,
    lineHeight: 20,
  },
  selectedPeriodLabel: { fontFamily: tokens.strongFont, color: '#007a91' },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    minHeight: 56,
    borderWidth: 1,
    borderColor: '#909090',
    borderRadius: 16,
    padding: 16,
  },
  dropdown: { transform: [{ scaleY: -1 }] },
  dateFields: { flexDirection: 'row', gap: 16, marginTop: 24 },
  dateField: { marginBottom: 0, gap: 4 },
  dateInput: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: '#909090',
    borderRadius: 16,
    padding: 16,
    paddingRight: 48,
  },
  calendarButton: {
    position: 'absolute',
    right: 4,
    bottom: 0,
    width: 40,
    height: 56,
  },
  calendar: { marginTop: 24 },
  rotate: { transform: [{ rotate: '180deg' }] },
  categoryGroup: { marginTop: 32 },
  categoryHeading: {
    fontFamily: tokens.strongFont,
    color: tokens.text,
    fontSize: 20,
    lineHeight: 24,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  categoryLabel: {
    fontFamily: tokens.strongFont,
    color: tokens.text,
    fontSize: 16,
    lineHeight: 18,
  },
  requestLabel: {
    fontFamily: tokens.font,
    color: tokens.text,
    fontSize: 18,
    lineHeight: 24,
    marginTop: 24,
    marginBottom: 4,
  },
  footerRow: { flexDirection: 'row', gap: 8 },
  filterSection: { marginTop: 24 },
  filterHeading: {
    fontFamily: tokens.strongFont,
    color: tokens.text,
    fontSize: 24,
    lineHeight: 26,
    marginBottom: 16,
  },
  filterLabel: {
    fontFamily: tokens.font,
    color: tokens.text,
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 4,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderColor: '#262626',
    borderWidth: 1,
  },
  secondaryLabel: { color: '#262626' },
});
