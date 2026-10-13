import { PageTitle } from './PageLayout';
import React, { useEffect, useState } from 'react';
import { Image, Linking, View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import {
  serviceDocuments,
  servicesAssets,
} from '@/experiences/pi/it/mobile-first/investmentsServicesContent';
import { validateInvestmentServiceMobileCode } from '@/features/investments/mobileFirstInvestmentServices';
import type { InvestmentDestination } from '@/experiences/pi/it/mobile-first/investmentsNavigation';
import type { ItalyNativeScreenProps } from '../contracts';
import { FormField } from '../../../../universal/FormField';
import {
  Button,
  Check,
  ServiceLink as Link,
  Money,
  Rows,
  Tabs,
  s,
  tokens,
} from './Primitives';
type Stage =
  | 'overview'
  | 'idea'
  | 'proposal'
  | 'generated'
  | 'contacts'
  | 'archive'
  | 'operations'
  | 'sign'
  | 'code'
  | 'success'
  | 'error';
export default function Advisory({
  destination,
  navigate,
  props,
  registerBack,
}: {
  destination: InvestmentDestination;
  navigate: (destination: InvestmentDestination) => void;
  props: ItalyNativeScreenProps;
  registerBack: (handler: null | (() => boolean)) => void;
}) {
  const [stage, setStage] = useState<Stage>(
    destination.action === 'sign'
      ? 'sign'
      : destination.action === 'idea'
        ? 'idea'
        : ['operations', 'authorize'].includes(destination.action ?? '')
          ? 'operations'
          : 'overview',
  );
  const [tab, setTab] = useState('Consulenze');
  const [consultancy, setConsultancy] = useState(
    destination.instrument ?? '2001000349374',
  );
  const [step, setStep] = useState(1);
  const [reviewed, setReviewed] = useState<Record<number, boolean>>({});
  const [accepted, setAccepted] = useState<Record<number, boolean>>({});
  const [generated, setGenerated] = useState(false);
  const [consent, setConsent] = useState(false);
  const [channel, setChannel] = useState('Telefono');
  const [contactConfirmed, setContactConfirmed] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const clearSignature = () => {
    setReviewed({});
    setAccepted({});
    setConsent(false);
    setStep(1);
    setCode('');
  };
  const openProposal = () => {
    clearSignature();
    setStage('proposal');
  };
  const back = () => {
    if (stage === 'overview') return false;
    if (stage === 'proposal') setStage('idea');
    else if (stage === 'sign' && step > 1) setStep(step - 1);
    else if (stage === 'code') {
      setStage('sign');
      setStep(6);
    } else setStage('overview');
    return true;
  };
  useEffect(() => {
    registerBack(back);
    return () => registerBack(null);
  });
  const hidden = props.amountsHidden;
  const empty = ['empty', 'empty-ideas', 'no-proposals'].includes(
    destination.action ?? '',
  );
  const signatureReady =
    [1, 3].every(value => reviewed[value]) &&
    [2, 4, 5].every(value => accepted[value]);
  const image = (asset: string | number) => (
    <Image
      source={typeof asset === 'number' ? asset : { uri: asset }}
      style={s.document}
      resizeMode="contain"
    />
  );
  const operations = [
    {
      id: '2001049726590',
      description:
        'Sottoscrizione Amundi Elite Multi Asset Flexible-Dis.Cl.A EUR/EUR (IT0005418741)',
      expiry: '29/04/2025 - 10:00',
      status:
        destination.action === 'operations' ? 'Da inserire' : 'Da firmare',
    },
    {
      id: '2001049726591',
      description: 'Acquisto Enel AZ Ord Raggruppate (IT0003153852)',
      expiry: '30/04/2025 - 15:00',
      status: 'Da inserire',
    },
  ];
  const operationCards = operations.map(item => (
    <View key={item.id} style={s.card}>
      <Text style={s.heading}>Operazione {item.id}</Text>
      <Rows
        rows={[
          { label: 'Scadenza', value: item.expiry },
          { label: 'Sottoscrizione', value: item.description },
          { label: 'Stato', value: item.status },
        ]}
      />
      {stage === 'operations' && item.status === 'Da inserire' && (
        <Link
          label={`Inserisci operazione ${item.id}`}
          onPress={() =>
            navigate(
              item.id === '2001049726590'
                ? {
                    area: 'funds',
                    view: 'operation',
                    action: 'subscribe',
                    instrument: 'IT0005418741',
                  }
                : {
                    area: 'securities',
                    view: 'transaction',
                    action: 'buy',
                    instrument: 'IT0003153852',
                  },
            )
          }
        />
      )}
    </View>
  ));
  if (
    destination.instrument &&
    !['2001000349374', '2601086209285'].includes(destination.instrument)
  )
    return (
      <>
        <PageTitle>Consulenza non disponibile</PageTitle>
        <Text style={s.body}>La consulenza richiesta non è presente.</Text>
      </>
    );
  return (
    <>
      <PageTitle>
        {stage === 'idea'
          ? 'Scopri l’idea di investimento'
          : stage === 'proposal'
            ? 'Idea di investimento'
            : stage === 'contacts'
              ? 'Informazioni'
              : stage === 'archive'
                ? 'Archivio consulenze'
                : stage === 'sign'
                  ? `Verbale esito consulenza 2401027334783 - Doc. ${
                      step < 3 ? '1' : '2'
                    }`
                  : stage === 'code'
                    ? 'Completa la sottoscrizione'
                    : 'Consulenza'}
      </PageTitle>
      {stage === 'overview' && (
        <>
          <Tabs
            items={['Consulenze', 'Idee di investimento']}
            value={tab}
            onChange={setTab}
          />
          {tab === 'Consulenze' ? (
            <>
              {empty ? (
                <Text style={s.body}>
                  La consulenza in materia di investimenti prestata dalla Banca
                  consiste nel fornire al Cliente raccomandazioni
                  personalizzate, con riferimento ad una o più operazioni
                  relative a strumenti finanziari, a prodotti finanziari emessi
                  da banche ed a prodotti di investimento assicurativi.
                </Text>
              ) : (
                <>
                  <Text style={s.strong}>Seleziona la consulenza</Text>
                  <Tabs
                    items={['2001000349374', '2601086209285']}
                    value={consultancy}
                    onChange={value => {
                      clearSignature();
                      setConsultancy(value);
                    }}
                  />
                  <View style={s.card}>
                    <Text style={s.heading}>Consulenza {consultancy}</Text>
                    <Text style={s.body}>Da firmare</Text>
                    <Rows
                      rows={[
                        { label: 'Cliente', value: 'Trentini Crescenzo' },
                        { label: 'Scadenza', value: '18/11/2020 - 23:59' },
                      ]}
                    />
                    <Text style={s.heading}>Operazioni</Text>
                    {operationCards}
                    <Button
                      label="Visualizza e firma"
                      onPress={() => {
                        setStep(1);
                        setStage('sign');
                      }}
                    />
                    <Link
                      label="Visualizza operazioni da inserire"
                      onPress={() => setStage('operations')}
                    />
                    <Link
                      label="Riprendi consulenza online"
                      onPress={() => setStage('operations')}
                    />
                  </View>
                </>
              )}
              <View style={s.card}>
                <Text style={s.heading}>Informazioni</Text>
                <Text style={s.strong}>Eugenio Lodovico</Text>
                <Link
                  label="Vai ai contatti"
                  onPress={() => setStage('contacts')}
                />
                <Link
                  label="Archivio consulenze"
                  onPress={() => setStage('archive')}
                />
              </View>
            </>
          ) : (
            <>
              <Text style={s.body}>
                In questa sezione sono disponibili alcune idee di investimento
                formulate alla luce dell’attuale contesto macroeconomico e
                finanziario
              </Text>
              <Rows
                rows={[
                  {
                    label: 'Idee di investimento per:',
                    value: 'Andrea Rossini Bianchi',
                  },
                ]}
              />
              {empty || generated ? (
                <>
                  <Text style={s.heading}>
                    Non hai nuove idee di investimento
                  </Text>
                  <Text style={s.body}>
                    Troverai nuove idee di investimento non appena saranno
                    disponibili. Ti ricordiamo che potrai sempre contattare il
                    tuo consulente al nostro numero verde 800.57.57.57.
                  </Text>
                  <Link
                    label="Scopri se hai consulenze online"
                    onPress={() => setTab('Consulenze')}
                  />
                </>
              ) : (
                <>
                  {image(servicesAssets.imgMobileTemporaryCardNew)}
                  <Text style={s.heading}>BTP Futura</Text>
                  <Text style={s.body}>
                    Scopri la nostra idea di consulenza sul BTP Futura
                  </Text>
                  <Link
                    label="apri BTP Futura"
                    onPress={() => {
                      clearSignature();
                      setStage('idea');
                    }}
                  />
                </>
              )}
            </>
          )}
        </>
      )}
      {stage === 'idea' && (
        <>
          {image(servicesAssets.imgHeroBannerMobile)}
          <Text style={s.heading}>BTP Futura</Text>
          <Text style={s.body}>
            Scopri la nostra idea di consulenza sul BTP Futura
          </Text>
          <Link label="Soluzioni di investimento" onPress={openProposal} />
          <Button label="Conferma" onPress={openProposal} />
        </>
      )}
      {stage === 'proposal' && (
        <>
          <Text style={s.heading}>Dettagli idea di investimento</Text>
          {[
            {
              name: 'BGF GLOBAL CONSERVATIVE INCOME-ACC.CLE EUR/EUR',
              isin: 'LU1845137493',
              amount: 2536,
            },
            {
              name: 'ONEMARKETS AMUNDI FLEXIBLE INCOME ACC.CLC EUR/EUR',
              isin: 'LU2503839321',
              amount: 10139,
            },
          ]
            .slice(0, destination.action === 'pac' ? 1 : 2)
            .map((item, itemIndex) => (
              <View key={item.isin} style={s.card}>
                <Text style={s.heading}>{item.name}</Text>
                <Rows
                  rows={[
                    { label: 'ISIN', value: item.isin },
                    ...(destination.action === 'pac'
                      ? [
                          { label: 'Tipologia', value: 'PAC' },
                          { label: 'N. totale rate', value: '74' },
                          { label: 'Periodicità rata', value: 'Mensile' },
                          {
                            label: 'Importo rata',
                            value: <Money cents={10000} hidden={hidden} />,
                          },
                          {
                            label: 'Versamento iniziale',
                            value: <Money cents={120000} hidden={hidden} />,
                          },
                          {
                            label: 'Importo totale del piano',
                            value: <Money cents={860000} hidden={hidden} />,
                          },
                        ]
                      : [
                          {
                            label: 'Controvalore',
                            value: (
                              <Money
                                cents={item.amount * 100}
                                hidden={hidden}
                              />
                            ),
                          },
                        ]),
                  ]}
                />
                <Check
                  label={`Key information document (KID) ${item.name}`}
                  value={reviewed[-itemIndex - 1] ?? false}
                  onPress={() =>
                    setReviewed({
                      ...reviewed,
                      [-itemIndex - 1]: !reviewed[-itemIndex - 1],
                    })
                  }
                />
              </View>
            ))}
          <Text style={s.body}>
            Ti segnaliamo che generando il verbale di consulenza non potrai più
            accedere alle altre idee di investimento visualizzate nelle
            schermate precedenti.
          </Text>
          <Text style={s.body}>
            Ti ricordiamo che nel caso in cui il tuo deposito titoli sia
            collegato alla Banca via Internet esclusivamente in modalità
            informativa, per poter dar seguito alla proposta di investimento è
            necessario passare alla modalità dispositiva.
          </Text>
          <Link
            label="Approfondisci con un consulente"
            onPress={() => setStage('contacts')}
          />
          <Check
            label="Confermo l’idea di investimento"
            value={consent}
            onPress={() => setConsent(!consent)}
          />
          <Button
            label="Genera verbale consulenza"
            disabled={
              !consent ||
              !reviewed[-1] ||
              (destination.action !== 'pac' && !reviewed[-2])
            }
            onPress={() => {
              if (destination.action === 'error') {
                setStage('error');
                return;
              }
              setGenerated(true);
              setStage('generated');
            }}
          />
        </>
      )}
      {stage === 'generated' && (
        <>
          <Text style={s.heading}>
            Il verbale di esito consulenza è stato generato
          </Text>
          <Button
            label="Vai alle consulenze"
            onPress={() => {
              setTab('Consulenze');
              setStage('overview');
            }}
          />
        </>
      )}
      {stage === 'operations' && (
        <>
          <Text style={s.heading}>Operazioni da inserire</Text>
          {operationCards}
          <Button
            label="Visualizza e firma"
            onPress={() => {
              setStep(1);
              setStage('sign');
            }}
          />
        </>
      )}
      {stage === 'contacts' && (
        <>
          <Text style={s.heading}>Eugenio Lodovico</Text>
          <Text style={s.body}>Il tuo consulente UniCredit</Text>
          <Link
            label="800.57.57.57"
            onPress={() => {
              Linking.openURL('tel:800575757').catch(reason =>
                setError(
                  reason instanceof Error
                    ? reason.message
                    : 'Contatto non disponibile',
                ),
              );
            }}
          />
          <Text style={s.strong}>Canale di contatto</Text>
          <Tabs
            items={['Telefono', 'Appuntamento in filiale']}
            value={channel}
            onChange={setChannel}
          />
          <Button
            label="Seleziona contatto"
            onPress={() => setContactConfirmed(true)}
          />
          {contactConfirmed && (
            <Text style={s.body}>
              Canale selezionato: {channel}. Contatta il servizio clienti per
              parlare con il tuo consulente.
            </Text>
          )}
        </>
      )}
      {stage === 'archive' && (
        <>
          <Text style={s.body}>
            Puoi consultare la documentazione nell’archivio Consulenze.
          </Text>
          <Text style={s.heading}>Consulenza {consultancy}</Text>
          <Rows
            rows={[
              {
                label: 'Stato',
                value: generated ? 'Completata' : 'Da firmare',
              },
            ]}
          />
          {image(serviceDocuments.advisoryDocument1)}
        </>
      )}
      {stage === 'sign' && (
        <>
          <Text style={s.small}>{step}/6</Text>
          {step === 1 || step === 3 ? (
            <>
              <Text style={s.body}>
                Ti raccomandiamo di prendere visione della documentazione qui
                esposta e delle eventuali avvertenze in essa contenute. Con il
                click sul tasto “Continua” confermi la presa visione della
                stessa e avvii il processo di relativa sottoscrizione.
              </Text>
              {image(
                step === 1
                  ? serviceDocuments.advisoryDocument1
                  : serviceDocuments.advisoryDocument2,
              )}
              <Check
                label={`Ho preso visione del documento ${step === 1 ? 1 : 2}`}
                value={reviewed[step] ?? false}
                onPress={() =>
                  setReviewed({ ...reviewed, [step]: !reviewed[step] })
                }
              />
              <Button
                label="Continua"
                disabled={!reviewed[step]}
                onPress={() => setStep(step + 1)}
              />
            </>
          ) : step < 6 ? (
            <>
              <Text style={s.body}>
                Per conferma dei contenuti della sezione “Dichiarazioni del
                cliente” di cui al verbale di esito consulenza
              </Text>
              {image(
                step === 2
                  ? serviceDocuments.advisoryDocument1
                  : serviceDocuments.advisoryDocument2,
              )}
              <Text style={s.body}>
                Punto firma {step === 5 ? '2/2' : step === 4 ? '1/2' : '1/1'}
              </Text>
              <Check
                label="Accetto il punto firma"
                value={accepted[step] ?? false}
                onPress={() =>
                  setAccepted({ ...accepted, [step]: !accepted[step] })
                }
              />
              <Button
                label="Continua"
                disabled={!accepted[step]}
                onPress={() => setStep(step + 1)}
              />
            </>
          ) : (
            <>
              <Text style={s.heading}>Completa la sottoscrizione</Text>
              <Text style={s.body}>
                Premendo il tasto “Continua” ed inserito poi il sistema di
                autenticazione richiesto, si completa la sottoscrizione
                elettronica in corrispondenza dei punti firma finora accettati.
              </Text>
              <Button
                label="Continua"
                disabled={!signatureReady}
                onPress={() => setStage('code')}
              />
            </>
          )}
        </>
      )}
      {stage === 'code' && (
        <>
          <FormField
            tokens={tokens}
            label="Mobile Code"
            value={code}
            onChange={setCode}
            inputProps={{
              keyboardType: 'number-pad',
              secureTextEntry: true,
              maxLength: 5,
            }}
          />
          <Button
            label="Conferma sottoscrizione"
            onPress={() => {
              const issue = validateInvestmentServiceMobileCode(code);
              if (issue) {
                setError(issue);
                return;
              }
              if (signatureReady)
                setStage(
                  destination.action === 'signature-error'
                    ? 'error'
                    : 'success',
                );
            }}
          />
        </>
      )}
      {stage === 'success' && (
        <>
          <Text style={s.heading}>
            La sottoscrizione si è conclusa correttamente
          </Text>
          <Text style={s.body}>
            Puoi consultare la documentazione nell’archivio Consulenze.
          </Text>
          <Link
            label="Vai all’archivio"
            onPress={() => {
              setGenerated(true);
              setStage('archive');
            }}
          />
        </>
      )}
      {stage === 'error' && (
        <>
          <Text style={s.heading}>Operazione non completata</Text>
          <Text style={s.body}>
            {destination.action === 'signature-error'
              ? 'La sottoscrizione non si è conclusa correttamente.'
              : 'Non è stato possibile generare il verbale di consulenza.'}
          </Text>
          <Button label="Chiudi" onPress={() => setStage('overview')} />
        </>
      )}
      {!!error && (
        <Text accessibilityRole="alert" style={s.error}>
          {error}
        </Text>
      )}
    </>
  );
}
