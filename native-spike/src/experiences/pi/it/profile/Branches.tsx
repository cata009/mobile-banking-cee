import React, { useState } from 'react';
import { Linking } from 'react-native';
import { filterProfileBranches } from '@/features/profile/mobileFirstProfile';
import {
  PROFILE_BRANCHES,
  PROFILE_BRANCH_ROUTE,
  PROFILE_BRANCH_SERVICES,
} from '@/experiences/pi/it/mobile-first/profileContent';
import { profileAssets as a } from '@/experiences/pi/it/mobile-first/profileAssets';
import { AssetGlyph } from '../../../../universal/AssetGlyph';
import {
  Button,
  Check,
  Choice,
  Copy,
  ErrorText,
  Fact,
  Field,
  Page,
  Row,
  Tabs,
  Title,
  type ScreenNavigation,
} from './Primitives';
export default function Branches({
  route,
  onBack,
  onClose,
  onNavigate,
}: ScreenNavigation) {
  const initial = PROFILE_BRANCHES.find(item => item.id === route.id);
  const [view, setView] = useState(initial ? 'detail' : 'map');
  const [branchId, setBranchId] = useState<string>(initial?.id ?? 'certosa');
  const [tab, setTab] = useState('Informazioni');
  const [travel, setTravel] = useState('In auto');
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [services, setServices] = useState<string[]>([]);
  const [draftType, setDraftType] = useState('');
  const [draftServices, setDraftServices] = useState<string[]>([]);
  const [error, setError] = useState('');
  const branch = PROFILE_BRANCHES.find(item => item.id === branchId)!;
  const rows = filterProfileBranches(PROFILE_BRANCHES, query, type, services);
  if (view === 'filters')
    return (
      <Page
        title="Filtri di ricerca"
        onBack={() => setView('map')}
        onClose={onClose}
        footer={
          <>
            <Button
              secondary
              onPress={() => {
                setDraftType('');
                setDraftServices([]);
              }}
            >
              Rimuovi Filtri
            </Button>
            <Button
              onPress={() => {
                setType(draftType);
                setServices(draftServices);
                setView('map');
              }}
            >
              Applica
            </Button>
          </>
        }
      >
        <Title>Tipologia struttura</Title>
        <Choice
          label="Seleziona tipologia di struttura"
          value={draftType}
          options={[
            '',
            'Filiale',
            'ATM Sportelli Automatici',
            'Filiale Private Banking',
            'Centri Imprese',
            'Negozi myAgents',
          ]}
          onChange={setDraftType}
        />
        <Title>Servizi di filiale</Title>
        {PROFILE_BRANCH_SERVICES.map(item => (
          <Check
            key={item.value}
            label={item.label}
            value={draftServices.includes(item.value)}
            onChange={checked =>
              setDraftServices(current =>
                checked
                  ? [...current, item.value]
                  : current.filter(value => value !== item.value),
              )
            }
          />
        ))}
      </Page>
    );
  if (view === 'phone')
    return (
      <Page title="Chiama" onBack={() => setView('detail')} onClose={onClose}>
        <Copy>{branch.name}</Copy>
        <Button
          onPress={() => {
            Linking.openURL('tel:0281681311').catch(() =>
              setError('Chiamata non disponibile.'),
            );
          }}
        >
          02 81681311
        </Button>
        <ErrorText error={error} />
      </Page>
    );
  if (view === 'detail')
    return (
      <Page
        title={branch.name}
        onBack={() => setView('map')}
        onClose={onClose}
        footer={
          <Button
            onPress={() =>
              onNavigate({ area: 'appointments', id: branch.name })
            }
          >
            Fissa un appuntamento
          </Button>
        }
      >
        <Copy>{`${branch.address}  ${branch.distance}`}</Copy>
        <Tabs
          labels={['Informazioni', 'ATM', 'Percorso']}
          value={tab}
          onChange={setTab}
          label="Dettagli filiale"
        />
        {tab === 'Informazioni' ? (
          <>
            <Title>Orari</Title>
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
            <Title>Servizio di cassa</Title>
            <Title>Agenzia</Title>
            {[
              ['ABI', '02008'],
              ['CAB', '01636'],
              ['Indirizzo', branch.address],
              ['Comune', 'Milano'],
              ['CAP', '20151'],
            ].map(([label, value]) => (
              <Fact key={label} label={label}>
                {value}
              </Fact>
            ))}
            <Row
              label="Telefono"
              value="02 81681311"
              onPress={() => setView('phone')}
            />
            <Fact label="Fax">02 81681311</Fact>
            <Fact label="Email">Agooo236-Italia@unicredit-eu</Fact>
            <Title>Servizi</Title>
            <Copy>{branch.services.join(', ')}</Copy>
          </>
        ) : tab === 'ATM' ? (
          <>
            <Title>Sportello Bancomat N°1</Title>
            {[
              [
                'Prelievi',
                'Prelievo contante, anticipo contante con carta di credito, prelievo smart5',
              ],
              [
                'Versamenti',
                'Versamento assegni, Versamento contante, Versamento contante ed assegni 24 ore su 24',
              ],
              [
                'Informazioni',
                'Saldo e movimenti conto corrente, Saldo movimenti deposito titoli, Saldo movimenti carta, Stampa e invio IBAN',
              ],
              [
                'Servizi',
                'Rateizzazione acquisti Carta Flexia, Cambio PIN, Biglietteria ed eventi, PostoClick Trenitalia',
              ],
              [
                'Ricariche',
                'Ricariche carte prepagate, Ricarica con carta di credito, Ricarica CoopVoce, Ricarica Fastweb, Ricarica TIM, Ricarica Vodafone, Ricarica WIND',
              ],
              [
                'Pagamenti',
                'Bollette IREN, Bollettini con lettura codice a barre, Bonifici, Donazioni, Pagamenti CBILL e PagoPA, Pagamento MAV',
              ],
            ].map(([label, body]) => (
              <Fact key={label} label={label}>
                {body}
              </Fact>
            ))}
          </>
        ) : (
          <>
            <Tabs
              labels={['In auto', 'A piedi']}
              value={travel}
              onChange={setTravel}
              label="Mezzo di trasporto"
            />
            <Fact label="Distanza">4,1 km</Fact>
            <Fact label="Tempo di percorrenza">
              {travel === 'In auto' ? '13min' : '50min'}
            </Fact>
            {PROFILE_BRANCH_ROUTE.map((step, index) => (
              <Copy key={step}>{`${index + 1}. ${step}`}</Copy>
            ))}
            <Button
              secondary
              onPress={() => {
                Linking.openURL(
                  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                    `${branch.address} Milano Italia`,
                  )}&travelmode=${
                    travel === 'In auto' ? 'driving' : 'walking'
                  }`,
                ).catch(() => setError('Google Maps non disponibile.'));
              }}
            >
              Vai a Google Maps
            </Button>
          </>
        )}
        <ErrorText error={error} />
      </Page>
    );
  return (
    <Page
      title={view === 'list' ? 'Elenco filiali' : 'Filiali / ATM'}
      onBack={view === 'list' ? () => setView('map') : onBack}
      onClose={onClose}
    >
      {view === 'map' && (
        <>
          <Copy>
            Seleziona i servizi che ti interessano e indica dove ti trovi per
            effettuare la ricerca. Potrai calcolare anche il percorso più rapido
            per raggiungere la Filiale selezionata.
          </Copy>
          <Copy strong>
            Per effettuare le operazioni di cassa puoi recarti direttamente in
            Filiale, senza necessità di prendere appuntamento con UBook
          </Copy>
          <AssetGlyph
            asset={a.branches.imgFrame1000002929}
            width={343}
            height={230}
            fit="cover"
          />
        </>
      )}
      <Field label="Cerca filiali" value={query} onChange={setQuery} />
      <Button
        secondary
        onPress={() => {
          setDraftType(type);
          setDraftServices(services);
          setView('filters');
        }}
      >
        Filtri
      </Button>
      <Button
        secondary
        onPress={() => setView(view === 'list' ? 'map' : 'list')}
      >
        {view === 'list' ? 'Mostra mappa' : 'Mostra elenco'}
      </Button>
      {rows.map(item => (
        <Row
          key={item.id}
          label={item.name}
          detail={item.address}
          value={item.distance}
          onPress={() => {
            setBranchId(item.id);
            setTab('Informazioni');
            setView('detail');
          }}
        />
      ))}
      {!rows.length && <Copy>Nessuna filiale trovata</Copy>}
    </Page>
  );
}
