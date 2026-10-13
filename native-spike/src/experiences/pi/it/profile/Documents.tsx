import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import {
  canDeleteServiceDocument,
  authorizeServiceSignature,
  canSignPractice,
  documentFilterError,
  filterServiceItems,
  profileServicesStore,
  updateServiceItems,
  type ServiceFilter,
  type ServiceItem,
} from '@/features/profile/mobileFirstProfileServices';
import {
  createProfilePdf,
  validProfileContact,
} from '@/features/profile/mobileFirstProfileSettings';
import {
  initialServiceDocuments,
  profileDocumentCategories,
} from '@/experiences/pi/it/mobile-first/profileServicesContent';
import { copyDemoText, shareDemoFile } from '../../../../platform/nativeFiles';
import { AssetGlyph } from '../../../../universal/AssetGlyph';
import { mobileFirstTokens as tokens } from '../../../../universal/tokens';
import { DataLink } from './DataElements';
import {
  ServiceAccountChoice,
  ServiceCard,
  ServicePaper,
} from './ServiceElements';
import { serviceAssets as a } from './serviceAssets';
import {
  Authorize,
  Button,
  Check,
  Choice,
  Copy,
  ErrorText,
  Fact,
  Field,
  DateInput,
  Page,
  Result,
  Row,
  Tabs,
  Title,
  s,
  type ScreenNavigation,
} from './Primitives';

const deliveryTypes = [
  'Conto corrente',
  'Deposito titoli',
  'Finanziamento',
  'Gestione patrimoniale',
  'Carta di credito',
  'Finanziamento aggiuntivo',
];
export default function Documents({
  route,
  onBack,
  onClose,
  onNavigate,
  onChanged,
  bankAdvisorKind = 'branch',
}: ScreenNavigation) {
  const snapshot = useSyncExternalStore(
    profileServicesStore.subscribe,
    profileServicesStore.getSnapshot,
  );
  const [view, setView] = useState(route.id ? 'preview' : 'list');
  const [selectedId, setSelectedId] = useState(route.id ?? '');
  const [generated, setGenerated] = useState<ServiceItem | null>(null);
  const [tab, setTab] = useState('In primo piano');
  const [category, setCategory] = useState('');
  const [query, setQuery] = useState('');
  const [archive, setArchive] = useState(false);
  const [filter, setFilter] = useState<ServiceFilter>({});
  const [draft, setDraft] = useState<ServiceFilter>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selection, setSelection] = useState(false);
  const [selectionMode, setSelectionMode] = useState<'read' | 'share'>('read');
  const [shareReturn, setShareReturn] = useState('list');
  const [period, setPeriod] = useState('6M');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [certificate, setCertificate] = useState('Attestazione ISEE');
  const [year, setYear] = useState('2024');
  const [certificateType, setCertificateType] = useState('Saldo');
  const [owners, setOwners] = useState(['Andrea Rossini']);
  const [delivery, setDelivery] = useState<Record<string, string>>(
    () =>
      snapshot.delivery ??
      Object.fromEntries(deliveryTypes.map(type => [type, 'Online'])),
  );
  const [deliveryEmail, setDeliveryEmail] = useState(
    snapshot.deliveryEmail ?? 'mic****ssi@email.it',
  );
  const [editEmail, setEditEmail] = useState(false);
  const [deliveryHistory, setDeliveryHistory] = useState('');
  const update = (ids: string[], action: 'read' | 'archive' | 'restore') => {
    profileServicesStore.update('documents', items =>
      updateServiceItems(items, ids, action),
    );
    onChanged();
  };
  useEffect(() => {
    if (
      route.id &&
      profileServicesStore
        .getSnapshot()
        .documents.some(item => item.id === route.id)
    )
      profileServicesStore.update('documents', items =>
        updateServiceItems(items, [route.id!], 'read'),
      );
  }, [route.id]);
  const selected =
    generated ?? snapshot.documents.find(item => item.id === selectedId);
  const open = (item: ServiceItem) => {
    setSelectedId(item.id);
    setGenerated(null);
    update([item.id], 'read');
    setView('preview');
    setNotice('');
  };
  const share = async (items: ServiceItem[]) => {
    if (!items.length) return;
    try {
      await shareDemoFile(
        'UniCredit-demo.pdf',
        'application/pdf',
        createProfilePdf(
          items.length === 1
            ? items[0].title
            : 'Documenti online e altri documenti',
          items
            .map(
              item =>
                `${item.title}\nIntestatario: ${
                  item.owner ?? 'Andrea Rossini'
                }\nRiferimento: ${item.reference ?? item.id}\n${
                  item.body ?? ''
                }`,
            )
            .join('\n\n'),
        ),
      );
      setNotice('PDF dimostrativo disponibile per la condivisione.');
    } catch (issue) {
      setError(
        issue instanceof Error
          ? issue.message
          : 'Condivisione non disponibile.',
      );
    }
  };
  const shareItems = generated
    ? [generated]
    : snapshot.documents.filter(item => selectedIds.includes(item.id));
  const generateCertificate = () => {
    setGenerated({
      id: `certificate-${Date.now()}`,
      title: certificate,
      category: 'Attestazioni',
      date: '2025-01-31',
      owner: owners.join(', '),
      reference:
        certificate === 'Attestazione ISEE'
          ? `${year} · ${certificateType}`
          : 'IT 123456789000000012',
      read: true,
      archived: false,
    });
    setView('generating');
  };
  if (view === 'share-confirm')
    return (
      <Page
        title="Attenzione"
        onBack={() => setView(shareReturn)}
        onClose={onClose}
        footer={
          <>
            <Button
              disabled={!shareItems.length}
              onPress={() => setView('share')}
            >
              Prosegui
            </Button>
            <Button secondary onPress={() => setView('list')}>
              Annulla
            </Button>
          </>
        }
      >
        <Copy>
          Stai per condividere l’informazione selezionata. Sei sicuro di voler
          proseguire?
        </Copy>
        <Copy>{`${selectedIds.length} documenti selezionati`}</Copy>
      </Page>
    );
  if (view === 'share')
    return (
      <Page title="Condividi" onBack={() => setView('list')} onClose={onClose}>
        <Fact label="Documento">UniCredit-demo.pdf</Fact>
        <Button
          onPress={() => {
            share(shareItems);
          }}
        >
          Scarica PDF
        </Button>
        <Row
          label="Copia riepilogo"
          onPress={() => {
            copyDemoText(shareItems.map(item => item.title).join('\n'))
              .then(() => setNotice('Riepilogo copiato.'))
              .catch(issue =>
                setError(
                  issue instanceof Error
                    ? issue.message
                    : 'Copia non disponibile.',
                ),
              );
          }}
        />
        <Copy>Scarica il documento o copia il riepilogo per condividerlo.</Copy>
        {notice && <Copy>{notice}</Copy>}
        <ErrorText error={error} />
      </Page>
    );
  if (view === 'saved')
    return (
      <Result
        title="Scelta effettuata correttamente"
        body="La modalità di ricezione è stata modificata."
        onClose={onClose}
        onContinue={() => setView('list')}
      />
    );
  if (view === 'auth')
    return (
      <Authorize
        key="document-delivery-authorization"
        authorization={code => authorizeServiceSignature(true, code)}
        canConfirm={code => canSignPractice(true, code)}
        allowBiometric={false}
        onBack={() => setView('delivery')}
        onClose={onClose}
        onSuccess={() => {
          profileServicesStore.update('delivery', () => delivery);
          profileServicesStore.update('deliveryEmail', () => deliveryEmail);
          onChanged();
          setView('saved');
        }}
        onForgot={() =>
          onNavigate({ area: 'settings', id: 'forgot-mobile-code' })
        }
      />
    );
  if (view === 'delivery')
    return (
      <Page
        title="Scelta modalità di recezione dei documenti"
        onBack={() => setView('list')}
        onClose={onClose}
        footer={
          <Button
            onPress={() => {
              if (editEmail && !validProfileContact('email', deliveryEmail)) {
                setError('Inserisci un indirizzo email valido.');
                return;
              }
              setError('');
              setView('auth');
            }}
          >
            Avanti
          </Button>
        }
      >
        <Copy>
          Le notifiche relative alla disponibilità di nuovi documenti ti saranno
          inviate via email all’indirizzo:
        </Copy>
        {editEmail ? (
          <Field
            label="Email"
            value={deliveryEmail}
            onChange={setDeliveryEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        ) : (
          <Row
            label="Email"
            value={deliveryEmail}
            detail="Verificato"
            onPress={() => setEditEmail(true)}
          />
        )}
        <Copy strong>
          Scegli la modalità di ricezione dei documenti per i rapporti elencati:
        </Copy>
        {deliveryTypes.map((type, index) => (
          <View key={type} style={d.deliverySection}>
            <View style={d.relationship}>
              <Copy muted>{`Tipo: ${type}`}</Copy>
              <Copy
                strong
              >{`Andrea Rossini - 30654 000010532399${index}`}</Copy>
              <Copy muted>Ultimo aggiornamento: 24/07/2018 03:18:35</Copy>
            </View>
            <View style={d.double}>
              {['Online', 'Cartaceo'].map(mode => (
                <View key={mode} style={d.grow}>
                  <Check
                    radio
                    label={mode}
                    accessibilityLabel={`${mode} ${type}`}
                    value={delivery[type] === mode}
                    onChange={() =>
                      setDelivery(current => ({ ...current, [type]: mode }))
                    }
                  />
                </View>
              ))}
            </View>
          </View>
        ))}
        {bankAdvisorKind === 'private' && (
          <Copy>
            Se vuoi accedere ai Documenti online e continuare a riceverli anche
            via posta devi rivolgerti al gestore per richiedere una deroga.
          </Copy>
        )}
        <Copy strong>Storico attivazione modalità di ricezione online</Copy>
        <Choice
          label="Seleziona il rapporto"
          value={deliveryHistory}
          options={['Andrea Rossini', 'Andrea Rossini e Sara Fumagalli']}
          onChange={setDeliveryHistory}
        />
        {deliveryHistory && (
          <>
            <Fact label="Aderito">1752098 - 06/03/2025 - 17:06:23</Fact>
            <Fact label="Non aderito">1752098 - 11/06/2023 - 08:42:19</Fact>
          </>
        )}
        <ErrorText error={error} />
      </Page>
    );
  if (view === 'filters')
    return (
      <Page
        title="Filtri di ricerca"
        onBack={() => setView('list')}
        onClose={onClose}
        footer={
          <>
            <Button
              secondary
              onPress={() => {
                setDraft({});
                setError('');
                setPeriod('6M');
              }}
            >
              Rimuovi Filtri
            </Button>
            <Button
              onPress={() => {
                const issue = documentFilterError({
                  ...draft,
                  category: draft.category || category || tab,
                });
                if (issue) setError(issue);
                else {
                  setFilter(draft);
                  setSelectedIds([]);
                  setSelection(false);
                  setView('list');
                  setError('');
                }
              }}
            >
              Applica
            </Button>
          </>
        }
      >
        <Title>Data</Title>
        <Copy>Seleziona periodo</Copy>
        <Tabs
          labels={['3M', '6M', '12M']}
          label="Periodo documenti"
          value={period}
          onChange={value => {
            setPeriod(value);
            const start = new Date('2025-01-31T12:00:00Z');
            start.setUTCMonth(start.getUTCMonth() - Number.parseInt(value, 10));
            setDraft(current => ({
              ...current,
              start: start.toISOString().slice(0, 10),
              end: '2025-01-31',
            }));
          }}
        />
        <DateInput
          label="Data di inizio"
          value={draft.start ?? ''}
          onChange={value =>
            setDraft(current => ({ ...current, start: value }))
          }
        />
        <DateInput
          label="Data di fine"
          value={draft.end ?? ''}
          onChange={value => setDraft(current => ({ ...current, end: value }))}
        />
        <Choice
          label="Seleziona categoria"
          value={draft.category ?? ''}
          options={['In primo piano', ...profileDocumentCategories]}
          onChange={value =>
            setDraft(current => ({ ...current, category: value, owner: '' }))
          }
        />
        {draft.category === 'Altri documenti e report' && (
          <>
            <Choice
              label="Tipologia di rapporto"
              value={draft.query ?? ''}
              options={['Avvisi effetti', 'Conto corrente', 'Deposito titoli']}
              onChange={value =>
                setDraft(current => ({ ...current, query: value }))
              }
            />
            <Choice
              label="Partita IVA"
              value="12345GDX4"
              options={['12345GDX4']}
              onChange={() => setNotice('Partita IVA selezionata: 12345GDX4')}
            />
          </>
        )}
        {draft.category === 'Caricati da te' && (
          <Choice
            label="Sottocategoria"
            value={draft.query ?? ''}
            options={['Repository 1', 'Repository 2', 'Repository 3']}
            onChange={value =>
              setDraft(current => ({ ...current, query: value }))
            }
          />
        )}
        <Title>Intestatario</Title>
        <Choice
          label="Seleziona intestatario"
          value={draft.owner ?? ''}
          options={['', 'Andrea Rossini', 'Andrea Rossini e Sara Fumagalli']}
          onChange={value =>
            setDraft(current => ({ ...current, owner: value }))
          }
        />
        <ErrorText error={error} />
      </Page>
    );
  if (view === 'certificate')
    return (
      <Page
        title={certificate}
        onBack={() => setView('list')}
        onClose={onClose}
        footer={
          <Button
            disabled={!owners.length}
            onPress={() =>
              certificate === 'Attestazione ISEE'
                ? setView('certificate-options')
                : generateCertificate()
            }
          >
            Conferma
          </Button>
        }
      >
        {certificate === 'Titolarità conto' ? (
          <Title>Seleziona il rapporto</Title>
        ) : (
          <Check
            label="Seleziona tutti"
            value={owners.length === 2}
            onChange={checked =>
              setOwners(
                checked
                  ? ['Andrea Rossini', 'Andrea Rossini e Sara Fumagalli']
                  : [],
              )
            }
          />
        )}
        {['Andrea Rossini', 'Andrea Rossini e Sara Fumagalli'].map(owner => (
          <ServiceAccountChoice
            key={owner}
            label={owner}
            detail="IT 123456789000000012"
            checked={owners.includes(owner)}
            radio={certificate === 'Titolarità conto'}
            icon={<AssetGlyph asset={a.document} size={24} />}
            onPress={() =>
              setOwners(current =>
                certificate === 'Titolarità conto'
                  ? [owner]
                  : current.includes(owner)
                  ? current.filter(item => item !== owner)
                  : [...current, owner],
              )
            }
          />
        ))}
      </Page>
    );
  if (view === 'certificate-options')
    return (
      <Page
        title="Attestazione ISEE"
        onBack={() => setView('certificate')}
        onClose={onClose}
        footer={<Button onPress={generateCertificate}>Conferma</Button>}
      >
        <Title>Tipo di attestazione</Title>
        {['Saldo', 'Giacenza media'].map(type => (
          <Check
            key={type}
            radio
            label={type}
            value={certificateType === type}
            onChange={() => setCertificateType(type)}
          />
        ))}
        <Title>Seleziona l’anno</Title>
        <Tabs
          labels={['2020', '2021', '2022', '2023', '2024']}
          label="Anno attestazione"
          value={year}
          onChange={setYear}
        />
      </Page>
    );
  if (view === 'generating')
    return (
      <Page
        title="Creazione in corso"
        onBack={() => setView('certificate')}
        onClose={onClose}
        footer={
          <Button onPress={() => setView('preview')}>
            Visualizza documento
          </Button>
        }
      >
        <Copy>Stiamo creando il documento richiesto</Copy>
        <View
          accessibilityRole="progressbar"
          accessibilityLabel="Creazione documento"
          accessibilityValue={{ min: 0, max: 100, now: 67 }}
          style={d.progress}
        >
          <Text style={d.progressText}>67%</Text>
        </View>
      </Page>
    );
  if (view === 'delete')
    return (
      <Page
        title="Elimina documento"
        onBack={() => setView('list')}
        onClose={onClose}
        footer={
          <>
            <Button
              disabled={!selected || !canDeleteServiceDocument(selected)}
              onPress={() => {
                if (!selected || !canDeleteServiceDocument(selected)) return;
                profileServicesStore.update('documents', items =>
                  items.filter(item => item.id !== selected.id),
                );
                onChanged();
                setView('list');
              }}
            >
              Conferma eliminazione
            </Button>
            <Button secondary onPress={() => setView('list')}>
              Annulla
            </Button>
          </>
        }
      >
        <Copy>{`Vuoi eliminare ${
          selected?.title ?? 'il documento'
        }? Verrà rimosso dai documenti caricati da te.`}</Copy>
      </Page>
    );
  if (view === 'preview')
    return selected ? (
      <Page
        title={selected.title}
        onBack={() => setView('list')}
        onClose={onClose}
        footer={
          <>
            <View style={d.double}>
              <View style={d.grow}>
                <Button
                  onPress={() => {
                    share([selected]);
                  }}
                >
                  Scarica PDF
                </Button>
              </View>
              <View style={d.grow}>
                <Button
                  secondary
                  onPress={() => {
                    setSelectedIds([selected.id]);
                    setShareReturn('preview');
                    setView('share-confirm');
                  }}
                >
                  Condividi PDF
                </Button>
              </View>
            </View>
            {!generated && (
              <DataLink
                label={selected.archived ? 'Ripristina' : 'Archivia'}
                onPress={() => {
                  update(
                    [selected.id],
                    selected.archived ? 'restore' : 'archive',
                  );
                  setView('list');
                }}
              />
            )}
            {notice && <Copy>{notice}</Copy>}
            <ErrorText error={error} />
          </>
        }
      >
        <ServicePaper
          title={selected.title}
          category={selected.category}
          reference={selected.reference}
        />
      </Page>
    ) : (
      <Page
        title="Documento non disponibile"
        onBack={() => setView('list')}
        onClose={onClose}
      >
        <Copy>Il documento selezionato non è disponibile.</Copy>
      </Page>
    );
  const visible = filterServiceItems(snapshot.documents, {
    ...filter,
    query: query || filter.query,
    archived: archive,
    category:
      filter.category === 'In primo piano'
        ? ''
        : filter.category ||
          category ||
          (tab === 'Conti' ? 'Conti correnti' : tab === 'Carte' ? 'Carte' : ''),
  }).filter(
    item =>
      tab !== 'In primo piano' ||
      archive ||
      category ||
      filter.category ||
      initialServiceDocuments.slice(0, 6).some(record => record.id === item.id),
  );
  return (
    <Page
      title={
        archive
          ? 'Archivio documenti'
          : Object.values(filter).some(Boolean)
          ? 'Risultati di ricerca'
          : 'Documenti'
      }
      onBack={onBack}
      onClose={onClose}
      contentGap={40}
      titleActions={
        <View style={d.toolbar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Impostazioni documenti"
            onPress={() => setView('delivery')}
            style={d.toolbarControl}
          >
            <AssetGlyph asset={a.settings} size={24} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Filtri documenti"
            onPress={() => {
              setDraft(filter);
              setError('');
              setView('filters');
            }}
            style={d.toolbarControl}
          >
            <AssetGlyph asset={a.filter} size={24} />
          </Pressable>
        </View>
      }
      footer={
        selection ? (
          <Button
            disabled={!selectedIds.length}
            onPress={() => {
              if (selectionMode === 'read') {
                update(selectedIds, 'read');
                setSelectedIds([]);
                setSelection(false);
                setNotice('Documenti selezionati segnati come letti.');
              } else {
                setShareReturn('list');
                setView('share-confirm');
              }
            }}
          >
            {selectionMode === 'read' ? 'Conferma' : 'Condividi PDF'}
          </Button>
        ) : undefined
      }
    >
      {!archive && (
        <View style={d.certificates}>
          {['Attestazione ISEE', 'Titolarità conto'].map((title, index) => (
            <Pressable
              key={title}
              accessibilityRole="button"
              accessibilityLabel={title}
              onPress={() => {
                setCertificate(title);
                setOwners(['Andrea Rossini']);
                setGenerated(null);
                setView('certificate');
              }}
              style={[d.certificate, index === 1 && d.secondCertificate]}
            >
              <Text style={d.certificateTitle}>{title}</Text>
              <Text style={d.request}>RICHIEDI ›</Text>
            </Pressable>
          ))}
        </View>
      )}
      <Tabs
        labels={['In primo piano', 'Recenti', 'Conti', 'Carte', 'Altro']}
        value={tab}
        onChange={value => {
          setTab(value);
          setCategory('');
          setSelectedIds([]);
          setQuery('');
          setFilter({});
          setSelection(false);
        }}
        label="Documenti"
      />
      {tab === 'Altro' && !category && !archive ? (
        profileDocumentCategories.map(value => (
          <Row key={value} label={value} onPress={() => setCategory(value)} />
        ))
      ) : (
        <>
          {category && <Title>{category}</Title>}
          {tab === 'In primo piano' && !archive && (
            <Text style={d.listDescription}>
              I documenti della sezione “In primo piano” sono quelli degli
              ultimi 6 mesi.
            </Text>
          )}
          {Object.values(filter).some(Boolean) && (
            <View style={s.stack}>
              <Copy strong>Filtri applicati:</Copy>
              {filter.start && (
                <Copy>{`Periodo: ${filter.start} - ${filter.end}`}</Copy>
              )}
              {filter.category && (
                <Copy>{`Categoria: ${filter.category}`}</Copy>
              )}
              {filter.owner && <Copy>{`Intestatario: ${filter.owner}`}</Copy>}
              <DataLink label="Rimuovi filtri" onPress={() => setFilter({})} />
            </View>
          )}
          {(archive || category || Object.values(filter).some(Boolean)) && (
            <Field
              label="Cerca documenti"
              value={query}
              onChange={setQuery}
              placeholder="Cerca per parola chiave..."
            />
          )}
          <View style={d.documentActions}>
            <View>
              <DataLink
                label="Segna tutto come letto"
                uppercase
                icon={a.tick}
                onPress={() => {
                  setSelection(true);
                  setSelectionMode('read');
                  setSelectedIds([]);
                }}
              />
            </View>
            <View>
              <DataLink
                label="Condividi"
                uppercase
                icon={a.share}
                onPress={() => {
                  setSelection(true);
                  setSelectionMode('share');
                  setSelectedIds([]);
                  setSelectedId('');
                  setGenerated(null);
                }}
              />
            </View>
          </View>
          {selection && (
            <Check
              label="Seleziona tutti i documenti"
              value={
                visible.length > 0 && selectedIds.length === visible.length
              }
              onChange={checked =>
                setSelectedIds(checked ? visible.map(item => item.id) : [])
              }
            />
          )}
          <View style={d.cardList}>
            {visible.map(item => (
              <View key={item.id}>
                <ServiceCard
                  item={item}
                  onPress={() =>
                    selection
                      ? setSelectedIds(current =>
                          current.includes(item.id)
                            ? current.filter(id => id !== item.id)
                            : [...current, item.id],
                        )
                      : open(item)
                  }
                  selected={selectedIds.includes(item.id)}
                  onSelect={
                    selection
                      ? () =>
                          setSelectedIds(current =>
                            current.includes(item.id)
                              ? current.filter(id => id !== item.id)
                              : [...current, item.id],
                          )
                      : undefined
                  }
                />
                {item.uploaded && !selection && (
                  <DataLink
                    label={`Elimina ${item.title}`}
                    onPress={() => {
                      setSelectedId(item.id);
                      setGenerated(null);
                      setView('delete');
                    }}
                  />
                )}
              </View>
            ))}
          </View>
          {!visible.length && <Copy>Nessun documento trovato</Copy>}
        </>
      )}
      <DataLink
        label={archive ? 'Torna ai documenti' : 'Archivio'}
        uppercase
        onPress={() => {
          setArchive(value => !value);
          setSelectedIds([]);
          setSelection(false);
          setTab('Recenti');
          setCategory('');
          setFilter({});
          setQuery('');
        }}
      />
      {notice && <Copy>{notice}</Copy>}
      <ErrorText error={error} />
    </Page>
  );
}
const d = StyleSheet.create({
  deliverySection: { gap: 16 },
  relationship: {
    padding: 16,
    gap: 8,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
  },
  progress: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 12,
    borderColor: '#e5e5e5',
    borderTopColor: '#007a91',
    borderRightColor: '#007a91',
    borderBottomColor: '#007a91',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  progressText: {
    fontFamily: tokens.strongFont,
    fontSize: 32,
    color: tokens.text,
  },
  double: { flexDirection: 'row', gap: 8 },
  grow: { flex: 1 },
  toolbar: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16 },
  toolbarControl: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  documentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: -16,
    marginBottom: -20,
  },
  listDescription: {
    fontFamily: tokens.font,
    fontSize: 16,
    lineHeight: 22,
    color: tokens.text,
    marginTop: -16,
  },
  cardList: { gap: 6, marginTop: -24 },
  certificates: { gap: 8 },
  certificate: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    gap: 8,
    borderRadius: 16,
    backgroundColor: tokens.accent,
  },
  secondCertificate: { backgroundColor: '#0d5870' },
  certificateTitle: {
    fontFamily: tokens.strongFont,
    fontSize: 18,
    lineHeight: 24,
    color: '#fff',
  },
  request: { fontFamily: tokens.strongFont, fontSize: 14, color: '#fff' },
});
