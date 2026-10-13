import { Text } from '../../../../universal/Typography';
import React, {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import {
  BackHandler,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  getInsuranceActions,
  getInsuranceFavorites,
  getInsuranceSnapshot,
  insurancePremiumCents,
  markInsuranceDocumentRead,
  moveInsuranceFavorite,
  normalizeInsuranceFavorites,
  saveInsuranceFavorites,
  selectHomepageInsurance,
  selectInsuranceFavorite,
  subscribeInsurance,
  type InsuranceDocument,
  type InsuranceModule,
} from '@/features/insurance/mobileFirstInsurance';
import {
  INSURANCE_CIVIL_LIABILITY_DETAIL as coverage,
  INSURANCE_MANAGEMENT_ACTIONS,
  ITALY_INSURANCE_POLICIES,
  insuranceDocuments,
} from '@/experiences/pi/it/mobile-first/insuranceContent';
import { insuranceAssets as a } from '@/experiences/pi/it/mobile-first/insuranceAssets';
import { ActionButton } from '../../../../universal/ActionButton';
import { ModalPanel } from '../../../../universal/ModalPanel';
import { ModalPortal } from '../../../../universal/ModalPortal';
import { AssetGlyph } from '../../../../universal/AssetGlyph';
import { mobileFirstTokens as tokens } from '../../../../universal/tokens';
import type { ItalyNativeScreenProps } from '../contracts';
import {
  CreditHeader,
  Field,
  Grid,
  ProductTabs,
  QuickAction,
  s,
} from '../loans/LoanPrimitives';
import {
  InsuranceAmount as Amount,
  InsuranceLink as Link,
} from './InsurancePrimitives';
import InsuranceDocuments, { insuranceDate } from './InsuranceDocuments';
import InsuranceHelp from './InsuranceHelp';
import InsuranceCatalogue from './InsuranceCatalogue';

type Page =
  | 'catalogue'
  | 'detail'
  | 'list'
  | 'inactive'
  | 'module'
  | 'coverage'
  | 'history'
  | 'manage'
  | 'quick-documents'
  | 'documents'
  | 'document'
  | 'help'
  | 'contact';
export default function InsuranceScreen({
  target,
  intent,
  amountsHidden,
  onBack,
  onProfile,
  onChanged,
  onAmountsToggle,
  isActive,
}: ItalyNativeScreenProps) {
  const snapshot = useSyncExternalStore(
    subscribeInsurance,
    getInsuranceSnapshot,
    getInsuranceSnapshot,
  );
  const [page, setPage] = useState<Page>(
    intent?.kind === 'insurance-action'
      ? 'catalogue'
      : target.kind === 'insurance'
      ? 'detail'
      : 'list',
  );
  const [policyId, setPolicyId] = useState(
    target.kind === 'insurance' ? target.policyId : '',
  );
  const [history, setHistory] = useState<{ page: Page; policyId: string }[]>(
    [],
  );
  const [module, setModule] = useState<InsuranceModule | null>(null);
  const [personIndex, setPersonIndex] = useState(0);
  const [document, setDocument] = useState<InsuranceDocument | undefined>();
  const [editing, setEditing] = useState<string[] | null>(null);
  const [confirmation, setConfirmation] = useState<'saved' | 'discard' | null>(
    null,
  );
  const [hidden, setHidden] = useState(amountsHidden);
  const [subject, setSubject] = useState('');
  const [compact, setCompact] = useState(false);
  const scroll = useRef<React.ElementRef<typeof ScrollView>>(null);
  const policies = ITALY_INSURANCE_POLICIES;
  const policy = policies.find(item => item.id === policyId);
  const detailVisible = page === 'detail' || page === 'quick-documents';
  const modalPage = ['module', 'coverage', 'history', 'manage'].includes(page);
  const active = policies.filter(item => item.status === 'active');
  const savedFavorites = selectHomepageInsurance(
    policies,
    getInsuranceFavorites(policies, snapshot),
  ).map(item => item.id);
  const favorites = editing ?? savedFavorites;
  const dirty =
    editing !== null &&
    JSON.stringify(editing) !== JSON.stringify(savedFavorites);
  const person = module?.people?.[personIndex];
  const actions = policy ? getInsuranceActions(policy) : [];
  const actionLabels = {
    'add-module': 'Aggiungi modulo',
    manage: 'Gestione polizza',
    documents: 'Documenti',
    contact: 'Contattaci',
  };
  const actionAssets = {
    'add-module': a.add,
    manage: a.settings,
    documents: a.folder,
    contact: a.contact,
  };
  useEffect(() => {
    setHidden(amountsHidden);
  }, [amountsHidden]);
  useEffect(() => {
    setPolicyId(target.kind === 'insurance' ? target.policyId : '');
    setPage(
      intent?.kind === 'insurance-action'
        ? 'catalogue'
        : target.kind === 'insurance'
        ? 'detail'
        : 'list',
    );
    setHistory([]);
    setEditing(null);
  }, [target, intent]);
  useEffect(() => {
    scroll.current?.scrollTo({ y: 0, animated: false });
    setCompact(false);
  }, [page, policyId]);
  const navigate = (next: Page) => {
    setHistory(previous => [...previous, { page, policyId }]);
    setPage(next);
  };
  const back = () => {
    if (confirmation) {
      setConfirmation(null);
      return;
    }
    if (editing && page === 'list') {
      if (dirty) setConfirmation('discard');
      else setEditing(null);
      return;
    }
    const previous = history.at(-1);
    if (previous) {
      setHistory(history.slice(0, -1));
      setPage(previous.page);
      setPolicyId(previous.policyId);
    } else onBack();
  };
  useEffect(() => {
    if (
      Platform.OS === 'web' ||
      isActive === false ||
      page === 'documents' ||
      page === 'document' ||
      page === 'help' ||
      page === 'contact'
    )
      return;
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        back();
        return true;
      },
    );
    return () => subscription.remove();
  });
  const contact = (label = '') => {
    setSubject(label);
    navigate('contact');
  };
  const openPolicy = (id: string) => {
    setPolicyId(id);
    navigate('detail');
  };
  const openDocument = (item: InsuranceDocument) => {
    setDocument(item);
    markInsuranceDocumentRead(item.id);
    onChanged();
    navigate('document');
  };
  if ((page === 'documents' || page === 'document') && policy)
    return (
      <InsuranceDocuments
        key={`${policy.id}-${page}`}
        policy={policy}
        hidden={hidden}
        onChanged={onChanged}
        isActive={isActive}
        onBack={back}
        initialDocument={page === 'document' ? document : undefined}
      />
    );
  if (page === 'help' || page === 'contact')
    return (
      <InsuranceHelp
        variant={page === 'contact' ? 'contact' : 'faq'}
        subject={page === 'contact' ? subject : undefined}
        isActive={isActive}
        onClose={back}
      />
    );
  if (page === 'catalogue')
    return <InsuranceCatalogue onBack={back} onDiscover={contact} />;
  const title =
    page === 'list'
      ? 'Tutte le polizze'
      : page === 'inactive'
      ? 'Tutte le polizze'
      : page === 'module'
      ? module?.name
      : page === 'coverage'
      ? coverage.title
      : page === 'history'
      ? 'Storico polizza'
      : page === 'manage'
      ? 'Gestione Polizza'
      : page === 'quick-documents'
      ? 'Documenti'
      : undefined;
  const tile = (item: (typeof policies)[number], index?: number) => (
    <View key={item.id} style={styles.policyCard}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Apri polizza ${item.name} ${
          hidden ? '••••' : item.number
        }`}
        accessibilityState={{ disabled: !!editing }}
        disabled={!!editing}
        onPress={() => openPolicy(item.id)}
        style={styles.policyOpen}
      >
        <Text style={styles.policyTitle}>{item.name}</Text>
        <Text style={s.small}>
          Numero polizza {hidden ? '••••' : item.number}
        </Text>
        {item.status === 'inactive' && (
          <Text style={styles.status}>Non attiva</Text>
        )}
      </Pressable>
      {editing && item.status === 'active' && (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${
              favorites.includes(item.id) ? 'Rimuovi' : 'Aggiungi'
            } preferito ${item.name} ${hidden ? '••••' : item.number}`}
            aria-pressed={favorites.includes(item.id)}
            accessibilityState={{ selected: favorites.includes(item.id) }}
            onPress={() =>
              setEditing(selectInsuranceFavorite(favorites, item.id, policies))
            }
            style={styles.favorite}
          >
            <AssetGlyph
              asset={favorites.includes(item.id) ? a.favorite : a.favoriteOff}
              size={24}
            />
          </Pressable>
          {index !== undefined && (
            <View style={styles.order}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Sposta su ${item.name} ${
                  hidden ? '••••' : item.number
                }`}
                accessibilityState={{ disabled: index === 0 }}
                disabled={index === 0}
                onPress={() =>
                  setEditing(moveInsuranceFavorite(favorites, index, -1))
                }
                style={styles.orderButton}
              >
                <AssetGlyph
                  asset={index === 0 ? a.upDisabled : a.up}
                  size={24}
                />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Sposta giù ${item.name} ${
                  hidden ? '••••' : item.number
                }`}
                accessibilityState={{
                  disabled: index === favorites.length - 1,
                }}
                disabled={index === favorites.length - 1}
                onPress={() =>
                  setEditing(moveInsuranceFavorite(favorites, index, 1))
                }
                style={styles.orderButton}
              >
                <AssetGlyph
                  asset={
                    index === favorites.length - 1 ? a.downDisabled : a.down
                  }
                  size={24}
                />
              </Pressable>
            </View>
          )}
        </>
      )}
    </View>
  );
  return (
    <View style={s.screen}>
      <CreditHeader
        onBack={modalPage ? undefined : back}
        onClose={modalPage ? back : undefined}
        onProfile={detailVisible ? onProfile : undefined}
        onPrivacy={
          detailVisible
            ? () => {
                setHidden(!hidden);
                onAmountsToggle?.();
              }
            : undefined
        }
        hidden={hidden}
        onHelp={
          ['detail', 'module', 'history', 'manage'].includes(page)
            ? () => navigate('help')
            : undefined
        }
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        ref={scroll}
        contentContainerStyle={s.content}
        scrollEventThrottle={16}
        onScroll={event => {
          if (detailVisible)
            setCompact(event.nativeEvent.contentOffset.y >= 330);
        }}
      >
        {detailVisible && policy ? (
          <>
            <ProductTabs
              insurance
              value={policyId}
              items={
                active.length === 2
                  ? active.map((item, index) => ({
                      value: item.id,
                      label: index === 0 ? 'Polizza' : 'Altra polizza',
                    }))
                  : [
                      { value: policyId, label: 'Polizza' },
                      {
                        value: 'list',
                        label: 'Tutte le polizze',
                        trailingAsset: a.forth,
                      },
                    ]
              }
              onChange={id => {
                if (id === 'list') navigate('list');
                else setPolicyId(id);
              }}
            />
            <Text style={s.detailTitle}>{policy.name}</Text>
            <Text style={s.subtitle}>
              Numero Polizza {hidden ? '••••' : policy.number}
            </Text>
            {policy.status === 'inactive' && (
              <Text style={s.small}>Non attiva</Text>
            )}
            <View style={styles.actions}>
              {actions.map(action => (
                <QuickAction
                  key={action}
                  label={actionLabels[action]}
                  asset={actionAssets[action]}
                  onPress={() => {
                    if (action === 'manage') navigate('manage');
                    else if (action === 'documents')
                      navigate('quick-documents');
                    else
                      contact(
                        action === 'add-module'
                          ? 'Aggiungi un modulo alla tua polizza'
                          : '',
                      );
                  }}
                />
              ))}
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>La mia polizza</Text>
              <Grid>
                <Field compact label="Compagnia">
                  {policy.company}
                </Field>
                <Field compact label="Numero polizza">
                  {hidden ? '••••' : policy.number}
                </Field>
                <Field compact label="Data decorrenza">
                  {insuranceDate(policy.start)}
                </Field>
                <Field compact label="Data scadenza">
                  {insuranceDate(policy.expiry)}
                </Field>
                <Field compact label="Premio">
                  <Amount
                    compact
                    value={insurancePremiumCents(policy) / 100}
                    hidden={hidden}
                  />
                </Field>
                <Field compact label="Tipo premio">
                  {policy.frequency}
                </Field>
                <Field compact label="Data prossimo pagamento">
                  {insuranceDate(policy.nextPayment)}
                </Field>
                <Field compact label="Importo prossimo pagamento">
                  <Amount
                    compact
                    value={insurancePremiumCents(policy) / 100}
                    hidden={hidden}
                  />
                </Field>
                <Field compact label="E-mail">
                  {policy.email}
                </Field>
              </Grid>
              <Link
                label="Storico polizza"
                onPress={() => navigate('history')}
              />
            </View>
            {policy.modules.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>I tuoi moduli</Text>
                <View style={styles.moduleList}>
                  {policy.modules.map(item => (
                    <Pressable
                      key={item.id}
                      accessibilityRole="button"
                      accessibilityLabel={`Apri modulo ${item.name}`}
                      onPress={() => {
                        setModule(item);
                        setPersonIndex(0);
                        navigate('module');
                      }}
                      style={styles.module}
                    >
                      <Text style={styles.moduleName}>{item.name}</Text>
                      <View>
                        <Amount value={item.premium} hidden={hidden} />
                        <Text style={s.small}>Premio</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : (
              policy.protection && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Dettaglio protezione</Text>
                  <Grid>
                    <Field compact label="Contraente">
                      {policy.protection.holder}
                    </Field>
                    <Field compact label="Assicurato">
                      {policy.protection.insured}
                    </Field>
                    {policy.protection.capital !== undefined && (
                      <Field compact label="Capitale assicurato">
                        <Amount
                          compact
                          value={policy.protection.capital}
                          hidden={hidden}
                        />
                      </Field>
                    )}
                    {policy.protection.beneficiary && (
                      <Field compact label="Beneficiario">
                        {policy.protection.beneficiary}
                      </Field>
                    )}
                    <Field compact label="Garanzie">
                      {policy.protection.guarantees.join(', ')}
                    </Field>
                  </Grid>
                </View>
              )
            )}
          </>
        ) : detailVisible ? (
          <>
            <Text style={s.title}>Polizza non disponibile</Text>
            <Text style={[s.body, s.mt16]}>
              La polizza selezionata non è presente nel tuo portafoglio.
            </Text>
            <Link label="Tutte le polizze" onPress={() => navigate('list')} />
          </>
        ) : null}
        {!detailVisible && <Text style={s.title}>{title}</Text>}
        {page === 'manage' && <Text style={s.subtitle}>{policy?.name}</Text>}
        {page === 'list' && (
          <>
            {editing && (
              <Text style={s.small}>
                Puoi spostare i tuoi preferiti per posizionarli secondo l'ordine
                desiderato.
              </Text>
            )}
            {
              <View style={s.section}>
                <Text style={s.sectionTitle}>Preferite</Text>
                {favorites
                  .map(id => active.find(item => item.id === id))
                  .filter(item => !!item)
                  .map((item, index) => tile(item, index))}
                {!favorites.length && (
                  <Text style={s.small}>
                    Seleziona le tue polizze preferite.
                  </Text>
                )}
              </View>
            }
            <View style={s.section}>
              <Text style={s.sectionTitle}>Tutte</Text>
              {active
                .filter(item => !favorites.includes(item.id))
                .sort((left, right) =>
                  left.name.localeCompare(right.name, 'it'),
                )
                .map(item => tile(item))}
            </View>
            {!editing && (
              <Link
                label="Polizze non attive"
                onPress={() => navigate('inactive')}
              />
            )}
          </>
        )}
        {page === 'inactive' && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Polizze non attive</Text>
            {policies
              .filter(item => item.status === 'inactive')
              .map(item => tile(item))}
          </View>
        )}
        {page === 'module' && module && (
          <>
            <Grid>
              <Field compact label="Data decorrenza">
                {insuranceDate(module.start)}
              </Field>
              <Field compact label="Data scadenza">
                {insuranceDate(module.expiry)}
              </Field>
              <Field compact label="Importo del premio">
                <Amount compact value={module.premium} hidden={hidden} />
              </Field>
            </Grid>
            <View style={styles.divider} />
            {module.addresses && (
              <>
                <Text style={s.body}>Abitazioni assicurate</Text>
                {module.addresses.map(address => (
                  <Text key={address} style={s.cardHeading}>
                    {address}
                  </Text>
                ))}
              </>
            )}
            {module.people && (
              <>
                <ProductTabs
                  compact
                  value={String(personIndex)}
                  items={module.people.map((insured, index) => ({
                    value: String(index),
                    label: `Assicurato ${index + 1}`,
                  }))}
                  onChange={id => setPersonIndex(Number(id))}
                />
                <Text style={s.body}>Cognome e nome</Text>
                <Text style={s.cardHeading}>{person?.name}</Text>
              </>
            )}
            <View style={s.section}>
              <Text style={s.body}>Garanzie</Text>
              {(person?.guarantees ?? module.guarantees).map(guarantee =>
                guarantee === coverage.title ? (
                  <Link
                    key={guarantee}
                    label={guarantee}
                    onPress={() => navigate('coverage')}
                  />
                ) : (
                  <Text key={guarantee} style={s.cardHeading}>
                    {guarantee}
                  </Text>
                ),
              )}
              {person?.beneficiary && (
                <View style={s.section}>
                  <Text style={s.body}>Beneficiario</Text>
                  <Text style={s.cardHeading}>{person.beneficiary}</Text>
                </View>
              )}
              {person?.contact && (
                <View style={s.section}>
                  <Text style={s.body}>Referente terzo</Text>
                  <Text style={s.cardHeading}>{person.contact}</Text>
                </View>
              )}
            </View>
          </>
        )}
        {page === 'coverage' && (
          <>
            <Text style={s.subtitle}>Modulo {module?.name}</Text>
            <View style={styles.coverageSection}>
              <Text style={styles.coverageTitle}>Cosa è assicurato</Text>
              <Text style={s.body}>{coverage.covered}</Text>
            </View>
            <View style={styles.coverageSection}>
              <Text style={styles.coverageTitle}>Principali esclusioni</Text>
              <Text style={s.body}>{coverage.excluded}</Text>
            </View>
          </>
        )}
        {page === 'history' && policy && (
          <>
            <Text style={[s.body, s.mt24]}>
              Di seguito sono elencati tutti i tuoi movimenti.
            </Text>
            {policy.history?.map(record => (
              <View style={styles.history} key={record.id}>
                <View style={styles.historyCopy}>
                  <Text style={styles.historyLabel}>{record.label}</Text>
                  <Text style={s.small}>
                    Scadenza il {insuranceDate(record.expiry)}
                  </Text>
                </View>
                <View style={styles.historyAmount}>
                  <Amount value={record.amount} hidden={hidden} />
                  <Text style={styles.collected}>
                    {record.status === 'collected' ? 'incassato' : 'in attesa'}
                  </Text>
                </View>
              </View>
            ))}
            {!policy.history?.length && (
              <Text style={s.body}>Nessun movimento disponibile.</Text>
            )}
          </>
        )}
        {page === 'manage' && policy && (
          <>
            <Text style={s.subtitle}>{policy.name}</Text>
            <View style={s.section}>
              {INSURANCE_MANAGEMENT_ACTIONS.map(action => (
                <Link
                  key={action.id}
                  label={action.label}
                  onPress={() => contact(action.label)}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>
      {detailVisible && compact && policy && (
        <View
          accessibilityLabel="Riepilogo polizza"
          style={styles.compactIdentity}
        >
          <Text numberOfLines={1} style={s.detailTitle}>
            {policy.name}
          </Text>
          <Text style={styles.compactNumber}>
            Numero polizza {hidden ? '••••' : policy.number}
          </Text>
        </View>
      )}
      {page === 'list' && (
        <View style={s.footer}>
          {editing ? (
            <ActionButton
              labelStyle={s.primaryLabel}
              tokens={tokens}
              label="Salva modifica"
              disabled={
                JSON.stringify(
                  normalizeInsuranceFavorites(editing, policies),
                ) ===
                JSON.stringify(
                  selectHomepageInsurance(
                    policies,
                    getInsuranceFavorites(policies, snapshot),
                  ).map(item => item.id),
                )
              }
              onPress={() => {
                saveInsuranceFavorites(editing, policies);
                setConfirmation('saved');
                onChanged();
              }}
            />
          ) : (
            <Link
              label="PERSONALIZZA VISTA"
              onPress={() => setEditing([...favorites])}
            />
          )}
        </View>
      )}
      {page === 'quick-documents' && policy && (
        <ModalPanel
          tokens={tokens}
          visible
          title="Documenti"
          closeLabel="Chiudi"
          onClose={back}
        >
          <View style={styles.quickDocuments}>
            {insuranceDocuments(policy.id)
              .filter(item => item.date === '2025-04-03')
              .map(item => (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.title} ${insuranceDate(
                    item.date,
                  )}`}
                  onPress={() => openDocument(item)}
                  style={styles.quickDocument}
                >
                  <AssetGlyph asset={a.document} size={24} />
                  <View style={styles.quickDocumentCopy}>
                    <Text style={s.cardHeading}>{item.title}</Text>
                    <Text style={s.small}>{insuranceDate(item.date)}</Text>
                  </View>
                </Pressable>
              ))}
          </View>
          <Link
            label="Vai a tutti i documenti"
            text="VAI A TUTTI I DOCUMENTI"
            onPress={() => setPage('documents')}
          />
        </ModalPanel>
      )}
      <ModalPortal
        visible={!!confirmation}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmation(null)}
      >
        <View style={styles.confirmationBackdrop}>
          <View style={styles.confirmation}>
            <Text style={styles.confirmationTitle}>
              {confirmation === 'saved' ? 'Modifiche salvate' : 'Attenzione'}
            </Text>
            <AssetGlyph
              asset={confirmation === 'saved' ? a.success : a.warning}
              size={40}
            />
            <Text style={s.body}>
              {confirmation === 'saved'
                ? 'Le modifiche di personalizzazione delle tue polizze sono avvenute con successo.'
                : 'Le modifiche non sono state salvate. Vuoi uscire senza salvare?'}
            </Text>
            <View style={styles.confirmationActions}>
              {confirmation === 'saved' ? (
                <ActionButton
                  tokens={tokens}
                  labelStyle={s.primaryLabel}
                  label="Chiudi"
                  onPress={() => {
                    setConfirmation(null);
                    setEditing(null);
                  }}
                />
              ) : (
                <>
                  <ActionButton
                    tokens={tokens}
                    labelStyle={s.primaryLabel}
                    label="Prosegui"
                    onPress={() => {
                      setEditing(null);
                      setConfirmation(null);
                    }}
                  />
                  <ActionButton
                    tokens={tokens}
                    labelStyle={[s.primaryLabel, styles.secondaryLabel]}
                    containerStyle={styles.secondaryButton}
                    label="Annulla"
                    secondary
                    onPress={() => setConfirmation(null)}
                  />
                </>
              )}
            </View>
          </View>
        </View>
      </ModalPortal>
    </View>
  );
}
const styles = StyleSheet.create({
  compactIdentity: {
    position: 'absolute',
    top: 64,
    left: 0,
    right: 0,
    zIndex: 18,
    minHeight: 90,
    padding: 16,
    gap: 4,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  compactNumber: {
    fontFamily: tokens.font,
    color: tokens.muted,
    fontSize: 16,
    lineHeight: 18,
  },
  policyCard: {
    minHeight: 160,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    marginBottom: 4,
  },
  policyOpen: { minHeight: 160, padding: 16, gap: 8, alignItems: 'flex-start' },
  policyTitle: {
    fontFamily: tokens.strongFont,
    color: tokens.text,
    fontSize: 24,
    lineHeight: 26,
    paddingRight: 40,
  },
  status: {
    marginTop: 'auto',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#cf3524',
    color: '#fff',
    fontFamily: tokens.font,
    fontSize: 14,
    lineHeight: 16,
  },
  favorite: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  order: { position: 'absolute', bottom: 8, right: 8 },
  orderButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmationBackdrop: {
    flex: 1,
    backgroundColor: '#00000040',
    justifyContent: 'center',
  },
  confirmation: {
    marginHorizontal: 32,
    padding: 24,
    borderRadius: 24,
    backgroundColor: '#fff',
    gap: 24,
  },
  confirmationTitle: {
    fontFamily: tokens.strongFont,
    color: tokens.text,
    fontSize: 24,
    lineHeight: 28,
  },
  confirmationActions: { gap: 16 },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#262626',
    backgroundColor: '#fff',
  },
  secondaryLabel: { color: '#262626' },
  quickDocuments: { gap: 24, marginVertical: 16 },
  quickDocument: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  quickDocumentCopy: { flex: 1, gap: 8 },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 32,
  },
  section: s.mt24,
  coverageSection: { marginTop: 24 },
  coverageTitle: {
    fontFamily: tokens.strongFont,
    color: tokens.text,
    fontSize: 24,
    lineHeight: 26,
    marginBottom: 16,
  },
  history: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 24,
  },
  historyCopy: { gap: 8, flex: 1 },
  historyLabel: {
    fontFamily: tokens.font,
    color: tokens.text,
    fontSize: 18,
    lineHeight: 20,
  },
  historyAmount: { gap: 8, alignItems: 'flex-end' },
  collected: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    color: '#fff',
    backgroundColor: '#3d7d43',
    fontFamily: tokens.font,
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    fontFamily: tokens.strongFont,
    color: tokens.text,
    fontSize: 28,
    lineHeight: 32,
  },
  module: {
    minHeight: 160,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 40,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
  },
  moduleList: { gap: 4, marginTop: 24 },
  moduleName: {
    fontFamily: tokens.strongFont,
    color: tokens.text,
    fontSize: 24,
    lineHeight: 26,
  },
  divider: { height: 1, backgroundColor: '#ccc', marginVertical: 32 },
});
