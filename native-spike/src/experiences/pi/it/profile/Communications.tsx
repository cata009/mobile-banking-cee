import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { StyleSheet, View } from 'react-native';
import {
  authorizeServicePracticeSignature,
  canSignPractice,
  filterServiceItems,
  profileServicesStore,
  servicePracticeSignatureError,
  servicePracticeInteraction,
  updateServiceItems,
  type ServiceFilter,
  type ServiceItem,
} from '@/features/profile/mobileFirstProfileServices';
import { profileSettingsStore } from '@/features/profile/mobileFirstProfileSettings';
import { pickLocalDocument } from '../../../../platform/filePicker';
import {
  Button,
  Check,
  Choice,
  Copy,
  ErrorText,
  Fact,
  Field,
  DateInput,
  Page,
  ProfileActive,
  Result,
  Row,
  Tabs,
  Title,
  s,
  type ScreenNavigation,
} from './Primitives';
import { ServiceCard, ServicePaper } from './ServiceElements';
import { DataLink } from './DataElements';
import { serviceAssets as a } from './serviceAssets';
export default function Communications({
  route,
  onBack,
  onClose,
  onNavigate,
  onChanged,
}: ScreenNavigation) {
  const snapshot = useSyncExternalStore(
    profileServicesStore.subscribe,
    profileServicesStore.getSnapshot,
  );
  const settings = useSyncExternalStore(
    profileSettingsStore.subscribe,
    profileSettingsStore.getSnapshot,
  );
  const initialTab =
    route.tab ??
    (snapshot.practices.some(item => item.id === route.id)
      ? 'Pratiche'
      : snapshot.messages.some(item => item.id === route.id)
      ? 'Messaggi'
      : 'Notifiche');
  const [tab, setTab] = useState(initialTab);
  const [practiceTab, setPracticeTab] = useState('Incomplete');
  const [view, setView] = useState(route.id ? 'detail' : 'list');
  const [selectedId, setSelectedId] = useState(route.id ?? '');
  const [query, setQuery] = useState('');
  const [archive, setArchive] = useState(false);
  const [filter, setFilter] = useState<ServiceFilter>({});
  const [draft, setDraft] = useState<ServiceFilter>({});
  const [selection, setSelection] = useState<string[] | null>(null);
  const [viewed, setViewed] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [period, setPeriod] = useState('6M');
  const [uploads, setUploads] = useState<Record<string, string>>({});
  const [uploadLabel, setUploadLabel] = useState('Busta paga');
  const [uploadName, setUploadName] = useState('busta-paga-demo.pdf');
  const [pickerUnavailable, setPickerUnavailable] = useState(false);
  const active = useContext(ProfileActive);
  const pickerPending = useRef(false);
  const pickerContext = useRef({ active, view, selectedId });
  useEffect(() => {
    pickerContext.current = { active, view, selectedId };
    return () => {
      pickerContext.current.active = false;
    };
  }, [active, view, selectedId]);
  const collection =
    tab === 'Notifiche'
      ? 'notices'
      : tab === 'Messaggi'
      ? 'messages'
      : 'practices';
  const items = snapshot[collection];
  const selected = items.find(item => item.id === selectedId);
  const interaction = selected
    ? servicePracticeInteraction(selected)
    : 'readonly';
  const signingError = servicePracticeSignatureError(settings);
  const chooseDocument = async (label: string) => {
    if (pickerPending.current || interaction !== 'overdraft-upload') return;
    const practiceId = selectedId;
    const eligible = () => {
      const context = pickerContext.current;
      const practice = profileServicesStore
        .getSnapshot()
        .practices.find(item => item.id === practiceId);
      return (
        context.active &&
        context.view === 'detail' &&
        context.selectedId === practiceId &&
        practice &&
        servicePracticeInteraction(practice) === 'overdraft-upload'
      );
    };
    if (!eligible()) return;
    pickerPending.current = true;
    setError('');
    try {
      const file = await pickLocalDocument(false);
      if (!eligible() || !file) return;
      if (!file.uri || !/\.(pdf|png|jpe?g)$/i.test(file.name)) {
        setError('Seleziona un file PDF, PNG o JPEG.');
        return;
      }
      setUploads(current => ({ ...current, [label]: file.name }));
      setNotice(
        `${label}: ${file.name} selezionato. La pratica rimane incompleta fino alla presa in carico.`,
      );
      setPickerUnavailable(false);
    } catch (issue) {
      if (!eligible()) return;
      const message =
        issue instanceof Error
          ? issue.message
          : 'Selezione documenti non riuscita.';
      setError(message);
      setPickerUnavailable(message === 'Selezione documenti non disponibile');
    } finally {
      pickerPending.current = false;
    }
  };
  useEffect(() => {
    if (!route.id) return;
    const key =
      initialTab === 'Notifiche'
        ? 'notices'
        : initialTab === 'Messaggi'
        ? 'messages'
        : 'practices';
    if (
      profileServicesStore.getSnapshot()[key].some(item => item.id === route.id)
    )
      profileServicesStore.update(key, current =>
        updateServiceItems(current, [route.id!], 'read'),
      );
  }, [route.id, initialTab]);
  const update = (ids: string[], action: 'read' | 'archive' | 'restore') => {
    profileServicesStore.update(collection, current =>
      updateServiceItems(current, ids, action),
    );
    onChanged();
  };
  const changeStatus = (status: string) => {
    profileServicesStore.update('practices', current =>
      current.map(item =>
        item.id === selectedId ? { ...item, status } : item,
      ),
    );
    onChanged();
  };
  const open = (item: ServiceItem) => {
    update([item.id], 'read');
    if (tab === 'Notifiche') {
      onNavigate({ area: 'notification', id: item.id });
      return;
    }
    setSelectedId(item.id);
    setViewed(false);
    setCode('');
    setError('');
    setView('detail');
  };
  if (view === 'success')
    return (
      <Result
        title={notice}
        onClose={onClose}
        onContinue={() => {
          setView('list');
          setPracticeTab('Chiuse');
        }}
      />
    );
  if (view === 'document')
    return (
      <Page
        title={
          selected?.id === 'mifid'
            ? 'Intervista di adeguatezza'
            : selected?.title ?? 'Documentazione'
        }
        onBack={() => setView('detail')}
        onClose={onClose}
        footer={
          <Button
            onPress={() => {
              setViewed(true);
              setView('detail');
            }}
          >
            Continua
          </Button>
        }
      >
        <ServicePaper
          title="Intervista di adeguatezza"
          category="Questionari"
          reference="Intervista MIFID"
        />
      </Page>
    );
  if (view === 'signature')
    return (
      <Page
        title="Inserisci il tuo Mobile Code"
        onBack={() => setView('detail')}
        onClose={onClose}
        footer={
          <Button
            disabled={
              interaction !== 'mifid-signature' ||
              !canSignPractice(viewed, code) ||
              !!signingError
            }
            onPress={() => {
              if (interaction !== 'mifid-signature') return;
              const result = authorizeServicePracticeSignature(viewed, code);
              if (!result.valid) {
                setError(result.error ?? 'Autorizzazione non riuscita.');
                return;
              }
              changeStatus('Completata');
              if (selected?.id === 'mifid')
                profileServicesStore.update('documents', current => [
                  {
                    id: `interview-${Date.now()}`,
                    title: 'Intervista di adeguatezza',
                    category: 'Questionari',
                    date: '2025-01-31',
                    reference: 'Intervista MIFID',
                    owner: 'Andrea Rossini',
                    read: true,
                    archived: false,
                  },
                  ...current,
                ]);
              setNotice(
                selected?.id === 'mifid'
                  ? 'Aggiornamento intervista completato'
                  : 'Pratica completata',
              );
              setView('success');
            }}
          >
            Conferma
          </Button>
        }
      >
        <Field
          label="Mobile Code"
          value={code}
          onChange={value => setCode(value.replace(/\D/g, ''))}
          secureTextEntry
          keyboardType="number-pad"
          maxLength={10}
        />
        <Copy>Inserisci il tuo Mobile Code.</Copy>
        <ErrorText error={signingError || error} />
        {signingError && (
          <Button
            secondary
            onPress={() =>
              onNavigate({ area: 'settings', id: 'digital-signature' })
            }
          >
            Gestisci firma digitale
          </Button>
        )}
        <Button
          secondary
          onPress={() =>
            onNavigate({ area: 'settings', id: 'forgot-mobile-code' })
          }
        >
          Ho dimenticato il Mobile Code
        </Button>
      </Page>
    );
  if (view === 'cancel')
    return (
      <Page
        title={
          selected?.id === 'mifid'
            ? 'Stai annullando la tua intervista MIFID'
            : 'Annulla la pratica'
        }
        onBack={() => setView('detail')}
        onClose={onClose}
        footer={
          <>
            <Button
              onPress={() => {
                changeStatus('Annullata');
                setNotice(
                  selected?.id === 'mifid'
                    ? 'Intervista annullata correttamente'
                    : 'Pratica annullata correttamente',
                );
                setView('success');
              }}
            >
              Conferma
            </Button>
            <Button secondary onPress={() => setView('detail')}>
              Annulla
            </Button>
          </>
        }
      >
        <Copy>
          {selected?.id === 'mifid'
            ? 'Cliccando su “Conferma” non confermerai la tua intervista e la stessa si intenderà non rilasciata.'
            : `Vuoi annullare la pratica ${selected?.title ?? ''}?`}
        </Copy>
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
                setPeriod('6M');
              }}
            >
              Rimuovi Filtri
            </Button>
            <Button
              onPress={() => {
                if (draft.start && draft.end && draft.start > draft.end) {
                  setError(
                    'La data di fine deve essere successiva alla data di inizio.',
                  );
                  return;
                }
                setFilter(draft);
                setSelection(null);
                setError('');
                setView('list');
              }}
            >
              Applica
            </Button>
          </>
        }
      >
        <Title>Ricerca per Tag</Title>
        <Field
          label="Parola chiave o tag"
          value={draft.query ?? ''}
          onChange={value =>
            setDraft(current => ({ ...current, query: value }))
          }
          placeholder="Scrivi la parola chiave o il tag..."
        />
        <Tabs
          labels={
            tab === 'Notifiche'
              ? ['Sicurezza', 'Accesso']
              : ['Pagamento', 'Informazioni', 'Accesso']
          }
          label="Tag"
          value={draft.query ?? ''}
          onChange={value =>
            setDraft(current => ({ ...current, query: value }))
          }
        />
        <Title>Data</Title>
        <Copy>Seleziona periodo</Copy>
        <Tabs
          labels={['3M', '6M', '12M']}
          label="Periodo comunicazioni"
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
          label="Stato lettura"
          value={draft.unread ? 'Non letti' : 'Tutti'}
          options={['Tutti', 'Non letti']}
          onChange={value =>
            setDraft(current => ({ ...current, unread: value === 'Non letti' }))
          }
        />
        <ErrorText error={error} />
      </Page>
    );
  if (view === 'demo-upload')
    return (
      <Page
        title={`Carica ${uploadLabel}`}
        onBack={() => setView('detail')}
        onClose={onClose}
        footer={
          <Button
            onPress={() => {
              if (interaction !== 'overdraft-upload') return;
              if (!/\.(pdf|png|jpe?g)$/i.test(uploadName)) {
                setError('Seleziona un file PDF, PNG o JPEG.');
                return;
              }
              setUploads(current => ({
                ...current,
                [uploadLabel]: uploadName,
              }));
              setNotice(
                `${uploadLabel}: ${uploadName} selezionato nella demo. La pratica rimane incompleta fino alla presa in carico.`,
              );
              setError('');
              setView('detail');
            }}
          >
            Seleziona file dimostrativo
          </Button>
        }
      >
        <Copy>
          Questa selezione usa un file dimostrativo. Nessun documento viene
          caricato o inviato alla banca.
        </Copy>
        <Field
          label="Nome file dimostrativo"
          value={uploadName}
          onChange={setUploadName}
          autoCapitalize="none"
        />
        <ErrorText error={error} />
      </Page>
    );
  if (view === 'detail' && selected && tab === 'Pratiche')
    return (
      <Page
        title={selected.title}
        onBack={() => setView('list')}
        onClose={onClose}
        footer={
          interaction === 'mifid-signature' ? (
            <>
              <Button
                disabled={!viewed || !!signingError}
                onPress={() => {
                  if (
                    interaction === 'mifid-signature' &&
                    viewed &&
                    !signingError
                  ) {
                    setError('');
                    setView('signature');
                  }
                }}
              >
                Prosegui alla firma
              </Button>
              <Button secondary onPress={() => setView('cancel')}>
                Annulla intervista
              </Button>
            </>
          ) : ['Incompleta', 'In lavorazione'].includes(
              selected.status ?? '',
            ) ? (
            <Button secondary onPress={() => setView('cancel')}>
              Annulla la pratica
            </Button>
          ) : undefined
        }
      >
        {interaction === 'mifid-signature' ? (
          <>
            <Copy>Per avere maggiori informazioni può contattare:</Copy>
            <Fact label="Nominativo">Giacomo Verdi</Fact>
            <Fact label="Filiale">Legnago</Fact>
            <Fact label="Telefono">02 95364457</Fact>
            <Fact label="Email">giacomo.verdi@unicredit.com</Fact>
            <Title>Documenti da visualizzare</Title>
            <Copy>
              Per cliccare su “Prosegui alla firma” è obbligatoria la presa
              visione della documentazione di seguito riportata e la verifica
              delle risposte fornite nell’esito intervista/e.
            </Copy>
            <Row
              label="Intervista di adeguatezza"
              icon={a.document}
              value={viewed ? 'Visualizzato' : 'VISUALIZZA'}
              onPress={() => setView('document')}
            />
            <ErrorText error={signingError} />
            {signingError && (
              <Button
                secondary
                onPress={() =>
                  onNavigate({ area: 'settings', id: 'digital-signature' })
                }
              >
                Gestisci firma digitale
              </Button>
            )}
          </>
        ) : (
          <>
            <Fact label="Data pratica">{selected.date}</Fact>
            <Fact label="Stato pratica">{selected.status}</Fact>
            {interaction === 'overdraft-upload' ? (
              <>
                <Copy>
                  Il contratto è stato firmato. Eventuali altre attività
                  necessarie a completare la richiesta sono elencate in questa
                  pagina. Dopo aver caricato la documentazione richiesta non
                  effettuare altre operazioni. La pratica rimarrà incompleta
                  fino alla presa in carico da parte nostra.
                </Copy>
                <Title>Documenti da caricare</Title>
                {['Busta paga', 'Documentazione facoltativa'].map(label => (
                  <View key={label} style={s.card}>
                    <Copy strong>{label}</Copy>
                    <Copy>
                      {uploads[label] ??
                        'Per consentire la valutazione della richiesta è necessario fornire il seguente documento'}
                    </Copy>
                    <DataLink
                      label={`Carica ${label}`}
                      uppercase
                      onPress={() => chooseDocument(label)}
                    />
                    {pickerUnavailable && (
                      <DataLink
                        label={`Usa file dimostrativo ${label}`}
                        onPress={() => {
                          if (interaction !== 'overdraft-upload') return;
                          setUploadLabel(label);
                          setUploadName(
                            label === 'Busta paga'
                              ? 'busta-paga-demo.pdf'
                              : 'documentazione-demo.pdf',
                          );
                          setView('demo-upload');
                        }}
                      />
                    )}
                  </View>
                ))}
              </>
            ) : interaction === 'mifid-link' ? (
              <>
                <Copy>
                  La tua richiesta è incompleta. Per procedere è necessario
                  selezionare “Completa la pratica”.
                </Copy>
                <Button
                  onPress={() => {
                    setSelectedId('mifid');
                    setViewed(false);
                    setCode('');
                  }}
                >
                  Completa la pratica
                </Button>
              </>
            ) : (
              <Copy>
                {selected.body ??
                  (selected.status === 'Completata'
                    ? 'La tua richiesta è stata completata.'
                    : selected.status === 'Annullata'
                    ? 'La tua richiesta è stata annullata.'
                    : 'Consulta lo stato della tua richiesta.')}
              </Copy>
            )}
            {['Incompleta', 'In lavorazione'].includes(
              selected.status ?? '',
            ) && (
              <Copy>
                Se si desidera è possibile procedere con l’annullamento della
                pratica.
              </Copy>
            )}
          </>
        )}
        {notice && <Copy>{notice}</Copy>}
        <ErrorText error={error} />
      </Page>
    );
  if (view === 'detail')
    return selected ? (
      <Page title={tab} onBack={() => setView('list')} onClose={onClose}>
        <Title>{selected.title}</Title>
        <Copy>{selected.body}</Copy>
        <Fact label="Data">{selected.date}</Fact>
        <Fact label="Categoria">{selected.category}</Fact>
        {selected.status && <Fact label="Stato">{selected.status}</Fact>}
        <Button
          secondary
          onPress={() => {
            update([selected.id], selected.archived ? 'restore' : 'archive');
            setView('list');
          }}
        >
          {selected.archived ? 'Ripristina' : 'Archivia'}
        </Button>
      </Page>
    ) : (
      <Page
        title="Comunicazione non disponibile"
        onBack={() => setView('list')}
        onClose={onClose}
      >
        <Copy>La comunicazione selezionata non è disponibile.</Copy>
      </Page>
    );
  const visible = filterServiceItems(items, {
    ...filter,
    query: query || filter.query,
    archived: archive,
  }).filter(
    item =>
      tab !== 'Pratiche' ||
      (practiceTab === 'Incomplete'
        ? item.status === 'Incompleta'
        : practiceTab === 'In lavorazione'
        ? item.status === 'In lavorazione'
        : ['Completata', 'Annullata', 'Rifiutata'].includes(item.status ?? '')),
  );
  return (
    <Page
      title={
        archive
          ? `Archivio ${tab.toLocaleLowerCase('it')}`
          : Object.values(filter).some(Boolean)
          ? 'Risultati di ricerca'
          : tab
      }
      onBack={onBack}
      onClose={onClose}
      footer={
        selection && (
          <Button
            disabled={!selection.length}
            onPress={() => {
              update(selection, 'read');
              setSelection(null);
              setNotice('Comunicazioni selezionate segnate come lette.');
            }}
          >
            Conferma
          </Button>
        )
      }
    >
      <Tabs
        labels={['Notifiche', 'Messaggi', 'Pratiche']}
        value={tab}
        onChange={value => {
          setTab(value);
          setSelection(null);
          setFilter({});
          setQuery('');
          setArchive(false);
        }}
        label="Comunicazioni"
      />
      {tab === 'Pratiche' && (
        <Tabs
          labels={['Incomplete', 'In lavorazione', 'Chiuse']}
          value={practiceTab}
          onChange={setPracticeTab}
          label="Stato pratiche"
        />
      )}
      {tab !== 'Pratiche' && (
        <View style={c.actions}>
          <DataLink
            label="Segna come letti"
            icon={a.tick}
            onPress={() => setSelection([])}
          />
          <DataLink
            label="Filtri"
            icon={a.filter}
            onPress={() => {
              setDraft(filter);
              setView('filters');
              setNotice('');
            }}
          />
        </View>
      )}
      <Field
        label={`Cerca ${tab.toLocaleLowerCase('it')}`}
        value={query}
        onChange={setQuery}
        placeholder="Cerca..."
      />
      {Object.values(filter).some(Boolean) && (
        <View>
          <Copy strong>Filtri applicati:</Copy>
          <Copy>{`Periodo: ${filter.start ?? 'Tutti'} - ${
            filter.end ?? ''
          }`}</Copy>
          <Copy>{`Tag: ${filter.query ?? 'Tutti'}`}</Copy>
          <DataLink label="Rimuovi filtri" onPress={() => setFilter({})} />
        </View>
      )}
      {selection && (
        <Check
          label="Seleziona tutti"
          value={visible.length > 0 && selection.length === visible.length}
          onChange={checked =>
            setSelection(checked ? visible.map(item => item.id) : [])
          }
        />
      )}
      <View style={c.cards}>
        {visible.map(item => {
          const toggle = () =>
            setSelection(current =>
              current?.includes(item.id)
                ? current.filter(id => id !== item.id)
                : [...(current ?? []), item.id],
            );
          return (
            <ServiceCard
              key={item.id}
              item={item}
              selected={selection?.includes(item.id)}
              onPress={selection ? toggle : () => open(item)}
              onSelect={selection ? toggle : undefined}
            />
          );
        })}
      </View>
      {!visible.length && <Copy>Nessun risultato trovato</Copy>}
      {tab === 'Pratiche' && (
        <>
          <Title>La tua pratica non è presente?</Title>
          <Copy>Contatta il nostro servizio Clienti.</Copy>
          <DataLink
            label="Chatta con noi"
            onPress={() => onNavigate({ area: 'support' })}
          />
        </>
      )}
      <DataLink
        label={archive ? 'Torna alle comunicazioni' : 'Archivio'}
        onPress={() => {
          setArchive(!archive);
          setFilter({});
          setQuery('');
        }}
      />
      {notice && <Copy>{notice}</Copy>}
    </Page>
  );
}
const c = StyleSheet.create({
  actions: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  cards: { gap: 6 },
});
