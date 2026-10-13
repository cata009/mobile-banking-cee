import React, { useState, useSyncExternalStore } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import { mobileFirstTokens as tokens } from '../../../../universal/tokens';
import { QuickAction } from './DataElements';
import { serviceAssets as a } from './serviceAssets';
import {
  appointmentErrors,
  bookServiceAppointment,
  cancelServiceAppointment,
  canManageServiceAppointment,
  dateLabel,
  profileServicesStore,
  serviceBranchAvailability,
  type AppointmentDraft,
  type ServiceAppointment,
} from '@/features/profile/mobileFirstProfileServices';
import { createProfilePdf } from '@/features/profile/mobileFirstProfileSettings';
import {
  appointmentCategories,
  appointmentDates,
  appointmentPurposes,
  appointmentSlots,
  profileBranches,
} from '@/experiences/pi/it/mobile-first/profileServicesContent';
import { shareDemoFile } from '../../../../platform/nativeFiles';
import {
  Button,
  Choice,
  Copy,
  ErrorText,
  Fact,
  Field,
  Page,
  Row,
  Tabs,
  Title,
  s,
  type ScreenNavigation,
} from './Primitives';
const blank: AppointmentDraft = {
  branch: '',
  category: '',
  purpose: '',
  date: '',
  time: '',
  notes: '',
};
export default function Bank({
  route,
  onBack,
  onClose,
  onChanged,
  bankAdvisorKind = 'branch',
}: ScreenNavigation) {
  const { appointments } = useSyncExternalStore(
    profileServicesStore.subscribe,
    profileServicesStore.getSnapshot,
  );
  const existing = appointments.find(item => item.id === route.id);
  const initialBranch = profileBranches.find(item => item.name === route.id);
  const [view, setView] = useState(
    existing
      ? 'appointment'
      : route.area === 'appointments'
      ? 'booking'
      : initialBranch
      ? 'branch'
      : 'home',
  );
  const [tab, setTab] = useState('Il tuo consulente');
  const [branchName, setBranchName] = useState<string>(
    initialBranch?.name ?? 'Milano Garibaldi',
  );
  const [draft, setDraft] = useState<AppointmentDraft>({
    ...blank,
    branch: initialBranch?.name ?? '',
  });
  const [selectedId, setSelectedId] = useState(existing?.id ?? '');
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [contactReturn, setContactReturn] = useState('branch');
  const [contact, setContact] = useState('');
  const [subject, setSubject] = useState('');
  const [mail, setMail] = useState('');
  const [chatText, setChatText] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [phone, setPhone] = useState('');
  const advisorName =
    bankAdvisorKind === 'cfe' ? 'Giulio Celentano' : 'Mario Bianchi';
  const advisorRole =
    bankAdvisorKind === 'cfe'
      ? 'Consulente patrimoniale'
      : bankAdvisorKind === 'private'
      ? 'Private Banker'
      : 'Consulente';
  const selected = appointments.find(item => item.id === selectedId);
  const branch =
    profileBranches.find(item => item.name === branchName) ??
    profileBranches[0];
  const update = (key: keyof AppointmentDraft, value: string) => {
    setError('');
    setDraft(current => ({
      ...current,
      [key]: value,
      ...(key === 'category'
        ? { purpose: '', date: '', time: '' }
        : key === 'purpose' || key === 'branch'
        ? { date: '', time: '' }
        : {}),
    }));
  };
  const start = (name = '') => {
    setDraft({ ...blank, branch: name });
    setEditing(false);
    setError('');
    setView('booking');
  };
  const home = () => {
    setView('home');
    setTab('Appuntamenti');
  };
  const facts = (item: ServiceAppointment) => (
    <>
      <Fact label="Stato">{item.status}</Fact>
      <Fact label="Filiale">{item.branch}</Fact>
      <Fact label="Indirizzo">
        {profileBranches.find(b => b.name === item.branch)?.address ??
          item.branch}
      </Fact>
      <Fact label="Data e ora">{`${dateLabel(item.date)} - ${item.time}`}</Fact>
      <Fact label="Scopo dell’appuntamento">{item.purpose}</Fact>
      {item.notes && <Fact label="Note">{item.notes}</Fact>}
    </>
  );
  const book = () => {
    const errors = appointmentErrors(draft);
    if (errors.length) {
      setError(errors.join(' '));
      return;
    }
    const id = editing ? selectedId : `appointment-${Date.now()}`;
    const item = bookServiceAppointment(draft, id);
    profileServicesStore.update('appointments', current =>
      editing
        ? current.map(value => (value.id === id ? item : value))
        : [item, ...current],
    );
    onChanged();
    setSelectedId(id);
    setView('booked');
  };
  if (view === 'notes')
    return (
      <Page
        title="Note"
        onBack={() => setView('booking')}
        onClose={onClose}
        footer={<Button onPress={() => setView('booking')}>Conferma</Button>}
      >
        <Field
          label="Scrivi qui una nota..."
          value={draft.notes}
          onChange={value => update('notes', value)}
          multiline
          maxLength={150}
        />
        <Copy muted>{`${150 - draft.notes.length} caratteri rimanenti`}</Copy>
      </Page>
    );
  if (view === 'booking')
    return (
      <Page
        title="Fissa un appuntamento"
        onBack={onBack}
        onClose={onClose}
        footer={
          <Button
            onPress={() => {
              const issues = appointmentErrors({
                ...draft,
                date: draft.date || appointmentDates[0][1],
                time: draft.time || appointmentSlots[0],
              });
              if (issues.length) setError(issues.join(' '));
              else if (!serviceBranchAvailability(draft.branch))
                setError(
                  'Non sono disponibili appuntamenti per la filiale selezionata. Scegli un’altra filiale.',
                );
              else setView('slots');
            }}
          >
            Continua
          </Button>
        }
      >
        <Choice
          label="Filiale"
          value={draft.branch}
          options={profileBranches.map(item => item.name)}
          onChange={value => update('branch', value)}
        />
        <Choice
          label="Categoria"
          value={draft.category}
          options={appointmentCategories}
          onChange={value => update('category', value)}
        />
        <Choice
          label="Scopo dell’appuntamento"
          value={draft.purpose}
          options={appointmentPurposes}
          onChange={value => update('purpose', value)}
        />
        <Field
          label="Note"
          value={draft.notes}
          onChange={value => update('notes', value)}
          multiline
          maxLength={150}
        />
        <Copy muted>{`${150 - draft.notes.length} caratteri rimanenti`}</Copy>
        <Button secondary onPress={() => setView('notes')}>
          Modifica nota
        </Button>
        <ErrorText error={error} />
      </Page>
    );
  if (view === 'slots')
    return (
      <Page
        title="Seleziona giorno e orario"
        onBack={() => setView('booking')}
        onClose={onClose}
        footer={<Button onPress={book}>Conferma appuntamento</Button>}
      >
        <Fact label="Filiale">{draft.branch}</Fact>
        <Choice
          label="Giorno"
          value={draft.date}
          options={appointmentDates.map(item => item[1])}
          onChange={value => update('date', value)}
        />
        <Choice
          label="Orario"
          value={draft.time}
          options={appointmentSlots}
          onChange={value => update('time', value)}
        />
        <ErrorText error={error} />
      </Page>
    );
  if (view === 'booked' && selected)
    return (
      <Page
        title="L’appuntamento è stato confermato"
        onBack={home}
        onClose={onClose}
        footer={
          <>
            <Button
              secondary
              onPress={() => {
                shareDemoFile(
                  'Riepilogo-appuntamento.pdf',
                  'application/pdf',
                  createProfilePdf(
                    'Riepilogo appuntamento',
                    `${selected.branch}\n${dateLabel(selected.date)} - ${
                      selected.time
                    }\n${selected.purpose}\n${selected.notes}`,
                  ),
                )
                  .then(() =>
                    setNotice('Riepilogo PDF disponibile per la condivisione.'),
                  )
                  .catch(issue => setError(String(issue)));
              }}
            >
              Condividi
            </Button>
            <Button secondary onPress={home}>
              Vedi appuntamenti
            </Button>
          </>
        }
      >
        <Copy>
          Riceverai anche una email all’indirizzo indicato. Conservala e
          mostrala in filiale in caso di necessità.
        </Copy>
        {facts(selected)}
        <Fact label="Indirizzo email">andrea.rossini@gmail.com</Fact>
        <Fact label="Cognome e nome">Andrea Rossini</Fact>
        {notice && <Copy>{notice}</Copy>}
        <ErrorText error={error} />
      </Page>
    );
  if (view === 'appointment' && selected)
    return (
      <Page
        title="Appuntamento in filiale"
        onBack={home}
        onClose={onClose}
        footer={
          canManageServiceAppointment(selected) && (
            <Button onPress={() => setView('manage')}>
              Modifica o cancella
            </Button>
          )
        }
      >
        {facts(selected)}
        {selected.status === 'Da eseguire' && (
          <>
            <Fact label="Riferimento">Enrico Laverenir</Fact>
            <Copy>
              Se vuoi modificare o cancellare l’appuntamento, seleziona il tasto
              “modifica o cancella” entro le 24 ore precedenti. ARN:
              SA-27125011. PNR: d531cbaff3.
            </Copy>
          </>
        )}
      </Page>
    );
  if (view === 'manage' && selected)
    return (
      <Page
        title="Modifica o cancella"
        onBack={() => setView('appointment')}
        onClose={onClose}
      >
        {facts(selected)}
        <Copy>
          Puoi modificare o cancellare l’appuntamento fino a 24 ore prima.
        </Copy>
        <Button
          onPress={() => {
            setDraft({ ...selected });
            setEditing(true);
            setView('booking');
          }}
        >
          Modifica appuntamento
        </Button>
        <Button secondary onPress={() => setView('cancel')}>
          Cancella appuntamento
        </Button>
      </Page>
    );
  if (view === 'cancel' && selected)
    return (
      <Page
        title="Cancella appuntamento"
        onBack={() => setView('manage')}
        onClose={onClose}
        footer={
          <>
            <Button
              onPress={() => {
                profileServicesStore.update('appointments', current =>
                  cancelServiceAppointment(current, selected.id),
                );
                onChanged();
                setView('appointment');
              }}
            >
              Conferma cancellazione
            </Button>
            <Button secondary onPress={() => setView('manage')}>
              Annulla
            </Button>
          </>
        }
      >
        <Copy>{`Vuoi cancellare il tuo appuntamento del ${dateLabel(
          selected.date,
        )} alle ${selected.time}?`}</Copy>
      </Page>
    );
  if (view === 'phone')
    return (
      <Page
        title="Chiama"
        onBack={() => setView(contactReturn)}
        onClose={onClose}
      >
        <Copy>Seleziona il numero da contattare</Copy>
        {(contactReturn === 'advisor' && bankAdvisorKind !== 'remote'
          ? ['+39 34517850372', '+02 4567878909']
          : [contact]
        ).map(number => (
          <Row key={number} label={number} onPress={() => setPhone(number)} />
        ))}
        {phone && (
          <View style={s.card}>
            <Copy strong>{phone}</Copy>
            <Copy>Numero da contattare</Copy>
            <Button secondary onPress={() => setPhone('')}>
              Termina
            </Button>
          </View>
        )}
      </Page>
    );
  if (view === 'email')
    return (
      <Page
        title="Scrivi una email"
        onBack={() => setView(contactReturn)}
        onClose={onClose}
        footer={
          <Button
            disabled={!subject.trim() || !mail.trim()}
            onPress={() => setNotice('Bozza salvata.')}
          >
            Salva bozza
          </Button>
        }
      >
        <Fact label="Da">andrea.rossini@gmail.com</Fact>
        <Fact label="A">{contact}</Fact>
        <Field label="Oggetto" value={subject} onChange={setSubject} />
        <Field label="Messaggio" value={mail} onChange={setMail} multiline />
        {notice && <Copy>{notice}</Copy>}
      </Page>
    );
  if (view === 'chat')
    return (
      <Page
        title="Il tuo advisor"
        onBack={() => setView('advisor')}
        onClose={onClose}
        footer={
          <>
            <Field
              label="Parla con il tuo advisor..."
              value={chatText}
              onChange={setChatText}
              maxLength={2000}
            />
            <Button
              disabled={!chatText.trim()}
              onPress={() => {
                setMessages(current => [
                  ...current,
                  chatText,
                  'Possiamo aiutarti a prenotare una consulenza. Seleziona Fissa un appuntamento per scegliere filiale, categoria e orario.',
                ]);
                setChatText('');
              }}
            >
              Invia
            </Button>
          </>
        }
      >
        <Copy>Oggi</Copy>
        <View style={b.chatBubble}>
          <Copy strong>Ciao Andrea!</Copy>
          <Copy>
            Sono il tuo buddy advisor dedicato alle consulenze patrimoniali,
            disponibile 24/7! Come posso esserti utile?
          </Copy>
        </View>
        {messages.map((message, index) => (
          <View
            key={index}
            style={[b.chatBubble, index % 2 === 0 && b.userBubble]}
          >
            <Copy>{message}</Copy>
          </View>
        ))}
        <Button secondary onPress={() => start()}>
          Fissa un appuntamento
        </Button>
      </Page>
    );
  if (view === 'advisor')
    return (
      <Page
        title="Il tuo consulente"
        onBack={() => setView('home')}
        onClose={onClose}
      >
        <View style={b.advisor}>
          <View style={b.initialCircle}>
            <Text style={b.initials}>
              {bankAdvisorKind === 'cfe' ? 'GC' : 'MB'}
            </Text>
          </View>
          <Title>{advisorName}</Title>
          <Copy>{advisorRole}</Copy>
        </View>
        <View style={b.quick}>
          <QuickAction
            variant="service"
            asset={a.phone}
            label={
              bankAdvisorKind === 'cfe' ? 'Chatta con il tuo advisor' : 'Chiama'
            }
            onPress={() => {
              if (bankAdvisorKind === 'cfe') setView('chat');
              else {
                setContactReturn('advisor');
                setContact(
                  bankAdvisorKind === 'remote'
                    ? '800575757'
                    : '+39 34517850372',
                );
                setPhone('');
                setView('phone');
              }
            }}
          />
          {bankAdvisorKind !== 'remote' && bankAdvisorKind !== 'cfe' && (
            <QuickAction
              variant="service"
              asset={a.email}
              label="Scrivi una email"
              onPress={() => {
                setContactReturn('advisor');
                setContact('mario.bianchi@unicredit.eu');
                setNotice('');
                setView('email');
              }}
            />
          )}
        </View>
        <Title>Oppure vieni a trovarci in filiale</Title>
        {profileBranches.slice(0, 2).map(item => (
          <Row
            key={item.name}
            label={item.name}
            detail={item.address}
            value="Scopri orari e contatti"
            onPress={() => {
              setBranchName(item.name);
              setView('branch');
            }}
          />
        ))}
      </Page>
    );
  if (view === 'branch')
    return (
      <Page
        title="La tua filiale"
        onBack={() => setView('home')}
        onClose={onClose}
      >
        <Choice
          label="Seleziona filiale"
          value={branchName}
          options={profileBranches.slice(0, 3).map(item => item.name)}
          onChange={setBranchName}
        />
        <Copy>{branch.address}</Copy>
        <View style={b.quick}>
          <QuickAction
            variant="service"
            asset={a.bankAppointment}
            label="Fissa un appuntamento"
            onPress={() => start(branchName)}
          />
          <QuickAction
            variant="service"
            asset={a.phone}
            label="Chiama la filiale"
            onPress={() => {
              setContactReturn('branch');
              setContact(branch.phone);
              setPhone('');
              setView('phone');
            }}
          />
          <QuickAction
            variant="service"
            asset={a.email}
            label="Scrivi una email"
            onPress={() => {
              setContactReturn('branch');
              setContact(branch.email);
              setNotice('');
              setView('email');
            }}
          />
        </View>
        <Title>Informazioni</Title>
        <View style={b.section}>
          <Copy strong>Orari filiale</Copy>
          {[
            'Lunedì',
            'Martedì',
            'Mercoledì',
            'Giovedì',
            'Venerdì',
            'Sabato',
            'Domenica',
          ].map((day, index) => (
            <Copy key={day}>{`${day}: ${
              index > 4
                ? 'Chiuso'
                : index === 4
                ? '08:20-13:20, 14:30-15:45'
                : '08:20-13:20, 14:30-16'
            }`}</Copy>
          ))}
        </View>
        <Copy strong>Recapiti filiale</Copy>
        <Fact label="Indirizzo">{branch.address}</Fact>
        <Fact
          label={bankAdvisorKind === 'private' ? 'Private Banker' : 'Direttore'}
        >
          {bankAdvisorKind === 'private' ? 'Mario Bianchi' : 'Michele Rossi'}
        </Fact>
        <Fact label="Numero di filiale">02 12344567789</Fact>
        <Fact label="Fax">02 12344567789</Fact>
        <Copy strong>Intestazione rapporti bancari</Copy>
        <Fact label="Intestazioni">Alessandro dell’Acqua</Fact>
        <Fact label="Rapporto">000000012345678</Fact>
        <Fact label="Intestazioni">Rossi Anna</Fact>
      </Page>
    );
  return (
    <Page title="La tua banca" onBack={onBack} onClose={onClose}>
      <Tabs
        labels={['Il tuo consulente', 'La tua filiale', 'Appuntamenti']}
        value={tab}
        onChange={setTab}
        label="La tua banca"
      />
      {tab === 'Il tuo consulente' ? (
        <View>
          <Row
            kind="bank"
            label={advisorName}
            detail={
              advisorRole +
              (bankAdvisorKind === 'cfe'
                ? ' (per investimenti, mutui e prestiti)'
                : '')
            }
            onPress={() => setView('advisor')}
          />
        </View>
      ) : tab === 'La tua filiale' ? (
        <>
          {profileBranches.slice(0, 3).map(item => (
            <Row
              kind="bank"
              key={item.name}
              label={item.name}
              detail={item.address}
              onPress={() => {
                setBranchName(item.name);
                setView('branch');
              }}
            />
          ))}
        </>
      ) : (
        <>
          <Copy>
            In questa sezione troverai l’elenco degli appuntamenti che hai preso
            con le relative informazioni. Nuovi appuntamenti o modifiche
            verranno aggiornate dopo circa 10 min.
          </Copy>
          {appointments
            .filter(item => item.status === 'Da eseguire')
            .map(item => (
              <Row
                kind="bank"
                key={item.id}
                label={item.purpose}
                detail={`${dateLabel(item.date)} - ${
                  item.time
                } · Appuntamento in filiale`}
                value={item.status}
                onPress={() => {
                  setSelectedId(item.id);
                  setView('appointment');
                }}
              />
            ))}
          <Copy strong>Appuntamenti conclusi ed annullati</Copy>
          {appointments
            .filter(item => item.status !== 'Da eseguire')
            .map(item => (
              <Row
                kind="bank"
                key={item.id}
                label={item.purpose}
                detail={dateLabel(item.date)}
                value={item.status}
                onPress={() => {
                  setSelectedId(item.id);
                  setView('appointment');
                }}
              />
            ))}
          <Button onPress={() => start()}>Fissa un appuntamento</Button>
          {!appointments.length && <Copy>Nessun appuntamento disponibile</Copy>}
        </>
      )}
    </Page>
  );
}
const b = StyleSheet.create({
  advisor: { padding: 24, gap: 8, alignItems: 'center' },
  initialCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: { fontFamily: tokens.font, fontSize: 28, color: tokens.accent },
  quick: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  section: { gap: 16 },
  chatBubble: {
    maxWidth: '90%',
    alignSelf: 'flex-start',
    padding: 16,
    gap: 8,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
  },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#dff1f4' },
});
