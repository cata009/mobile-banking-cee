import { PageTitle } from './PageLayout';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import {
  isNonProfessionalMarketSubscriber,
  readInvestmentServicePreferences,
  saveInvestmentServicePreferences,
} from '@/features/investments/mobileFirstInvestmentServices';
import {
  servicePackages,
  marketSubscriberQuestions,
  servicesAssets,
} from '@/experiences/pi/it/mobile-first/investmentsServicesContent';
import { securityMaximumCommissionCents } from '@/features/investments/mobileFirstSecurities';
import { FormField } from '../../../../universal/FormField';
import {
  AssetGlyph,
  Button,
  Check,
  ServiceLink as Link,
  Money,
  Rows,
  s,
  tokens,
} from './Primitives';
import { ServiceDocument, ServiceMobileCode } from './ServiceForms';
import { InvestmentFooter } from './PageLayout';
type Stage =
  | 'package'
  | 'company'
  | 'market'
  | 'document'
  | 'accept'
  | 'sign'
  | 'code'
  | 'revoke'
  | 'success';
export default function ServicePackages({
  selected,
  hidden,
  onChanged,
  onPreferences,
  onDone,
  registerBack,
}: {
  selected: (typeof servicePackages)[number];
  hidden: boolean;
  onChanged: () => void;
  onPreferences: () => void;
  onDone: () => void;
  registerBack: (handler: null | (() => boolean)) => void;
}) {
  const [stage, setStage] = useState<Stage>('package');
  const [preferences, setPreferences] = useState(
    readInvestmentServicePreferences,
  );
  const [reviewed, setReviewed] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [company, setCompany] = useState({
    name: '',
    address: '',
    position: '',
    role: '',
  });
  const [marketAnswers, setMarketAnswers] = useState<string[]>([]);
  const [warning, setWarning] = useState(false);
  const realtime = selected.name.startsWith('Trading Real Time');
  const active = preferences.activePackages.includes(selected.name);
  useEffect(() => {
    setStage('package');
    setReviewed(false);
    setAccepted(false);
    setRevoking(false);
    setMarketAnswers([]);
    setWarning(false);
    setPreferences(readInvestmentServicePreferences());
  }, [selected.name]);
  useEffect(() => {
    registerBack(() => {
      if (stage === 'package') return false;
      if (stage === 'company' || stage === 'revoke') setStage('package');
      else if (stage === 'market') setStage('company');
      else if (stage === 'document') setStage(realtime ? 'market' : 'package');
      else if (stage === 'accept') setStage('document');
      else if (stage === 'sign') setStage('accept');
      else if (stage === 'code') setStage(revoking ? 'revoke' : 'sign');
      else return false;
      return true;
    });
    return () => registerBack(null);
  }, [registerBack, stage, realtime, revoking]);
  const next = (label: string, target: Stage, disabled = false) => (
    <InvestmentFooter>
      <Button
        label={label}
        disabled={disabled}
        onPress={() => setStage(target)}
      />
    </InvestmentFooter>
  );
  return (
    <>
      <PageTitle>
        {stage === 'package'
          ? selected.name
          : revoking
            ? 'Revoca funzionalità'
            : 'Attivazione funzionalità'}
      </PageTitle>
      {stage === 'package' && (
        <>
          <Text style={s.small}>{active ? 'Attivo' : 'Non attivo'}</Text>
          {active && (
            <Rows rows={[{ label: 'Data attivazione', value: '23/02/2025' }]} />
          )}
          {realtime ? (
            <>
              <Text style={s.heading}>In tempo reale</Text>
              <Text style={s.body}>
                Le quotazioni dei titoli del mercato{' '}
                {selected.name.replace('Trading Real Time ', '')} vengono
                fornite in tempo reale (Livello 1)
              </Text>
              <Text style={s.heading}>Aggiornamento prezzi</Text>
              <Text style={s.body}>
                I prezzi non si aggiornano automaticamente, ma è necessario
                aggiornare la pagina
              </Text>
            </>
          ) : (
            <>
              <Text style={s.body}>
                Quotazioni titoli Italia (MTA, Sedex, MOT ed EuroMOT) fornite
                con le seguenti modalità:
              </Text>
              <Text style={s.heading}>Tecnologia push</Text>
              <Text style={s.body}>
                Le quotazioni dei titoli, già fornite in tempo reale, si
                aggiornano automaticamente senza la necessità di cliccare alcun
                tasto.
              </Text>
              <Text style={s.heading}>Book a 5 livelli</Text>
              <Text style={s.body}>
                Vengono visualizzate in tempo reale le 5 migliori proposte in
                acquisto e vendita, con le relative quantità presenti sul
                mercato di negoziazione.
              </Text>
              <Text style={s.heading}>Ordini condizionati “Stop order”</Text>
              <Text style={s.body}>Proposte di negoziazione</Text>
              {selected.name === 'Money Trading Advanced' && (
                <>
                  <Text style={s.heading}>Commissione massima</Text>
                  <View style={styles.inline}>
                    <Text style={s.body}>
                      Commissione massima di negoziazione di
                    </Text>
                    <Money
                      cents={securityMaximumCommissionCents}
                      hidden={hidden}
                    />
                    <Text style={s.body}>
                      per ordine disposto sui mercati MTA, ETFPlus, Sedex e
                      azionario EuroTLX tramite il canale Internet.
                    </Text>
                  </View>
                </>
              )}
            </>
          )}
          <Rows
            rows={[
              {
                label: 'Canone mensile',
                value: <Money cents={selected.fee * 100} hidden={hidden} />,
              },
            ]}
          />
          <InvestmentFooter>
            <Button
              label={active ? 'Recesso' : 'Attiva funzionalità'}
              onPress={() => {
                setRevoking(active);
                setStage(active ? 'revoke' : realtime ? 'company' : 'document');
              }}
            />
          </InvestmentFooter>
        </>
      )}
      {stage === 'company' && (
        <>
          <Text style={s.heading}>
            Inserisci le tue informazioni per aderire alla funzionalità
          </Text>
          <Rows
            rows={[
              { label: 'Nome e Cognome', value: 'Andrea Rossini Bianchi' },
              { label: 'Professione', value: 'Dipendente Az. Industriale' },
            ]}
          />
          {(['name', 'address', 'position', 'role'] as const).map(key => (
            <FormField
              key={key}
              tokens={tokens}
              label={
                {
                  name: 'Nome di azienda',
                  address: 'Indirizzo di azienda',
                  position: 'Titolo e Posizione ricoperta',
                  role: 'Funzione',
                }[key]
              }
              value={company[key]}
              labelStyle={s.body}
              onChange={value => setCompany({ ...company, [key]: value })}
              inputProps={{ style: styles.input }}
            />
          ))}
          {next(
            'Conferma',
            'market',
            Object.values(company).some(value => !value.trim()),
          )}
        </>
      )}
      {stage === 'market' && (
        <>
          <Text style={s.heading}>
            Prendi visione e accetta le condizioni contrattuali
          </Text>
          <Text style={s.body}>
            Prima di confermare è necessario prendere visione delle condizioni
            contrattuali indicate nel seguente documento.
          </Text>
          {marketSubscriberQuestions.map((question, index) => (
            <View key={question} style={s.section}>
              <Text style={s.body}>{question}</Text>
              {['Sì', 'No'].map(value => (
                <Pressable
                  key={value}
                  accessibilityRole="radio"
                  accessibilityLabel={`${question} ${value}`}
                  accessibilityState={{
                    checked: marketAnswers[index] === value,
                  }}
                  style={styles.answer}
                  onPress={() => {
                    const answers = [...marketAnswers];
                    answers[index] = value;
                    setMarketAnswers(answers);
                    setReviewed(false);
                    setAccepted(false);
                    setWarning(false);
                  }}
                >
                  <View
                    style={[
                      styles.radio,
                      marketAnswers[index] === value && styles.checked,
                    ]}
                  />
                  <Text style={s.body}>{value}</Text>
                </Pressable>
              ))}
            </View>
          ))}
          {warning && (
            <View accessibilityRole="alert" style={s.notice}>
              <Text style={s.heading}>Attenzione</Text>
              <Text style={s.body}>
                Le risposte indicate non consentono l’adesione al servizio per
                uso personale non professionale.
              </Text>
              <Link
                label="Modifica le risposte"
                onPress={() => setWarning(false)}
              />
            </View>
          )}
          <InvestmentFooter>
            <Button
              label="Conferma"
              disabled={marketSubscriberQuestions.some(
                (_, index) => !marketAnswers[index],
              )}
              onPress={() => {
                if (isNonProfessionalMarketSubscriber(marketAnswers))
                  setStage('document');
                else setWarning(true);
              }}
            />
          </InvestmentFooter>
        </>
      )}
      {stage === 'document' && (
        <>
          <Text style={s.heading}>
            Prendi visione e firma la documentazione per aderire al servizio
          </Text>
          <Text style={s.body}>
            Per attivare la funzionalità è necessario prendere visione del
            Contratto per il servizio {selected.name}, del quale ti
            raccomandiamo il salvataggio su supporto duraturo.
          </Text>
          <ServiceDocument
            title={`Contratto ${selected.name}`}
            reviewed={reviewed}
            onReview={() => setReviewed(true)}
            rows={[
              { label: 'Intestatario', value: 'Andrea Rossini Bianchi' },
              { label: 'Deposito', value: preferences.preferredDeposit },
              { label: 'Servizio', value: selected.name },
              {
                label: 'Canone mensile',
                value: <Money cents={selected.fee * 100} hidden={hidden} />,
              },
              {
                label: 'Quotazioni',
                value: realtime
                  ? 'In tempo reale (Livello 1)'
                  : 'Book a 5 livelli e tecnologia push',
              },
            ]}
          />
          {next('Conferma', 'accept', !reviewed)}
        </>
      )}
      {stage === 'accept' && (
        <>
          <Text style={s.body}>
            Dichiaro di aver preso visione del Contratto per il servizio{' '}
            {selected.name} resomi a disposizione e di confermare la volontà da
            me espressa in merito ai consensi al trattamento dei dati personali.
          </Text>
          <Check
            label="Accetto i punti firma"
            value={accepted}
            onPress={() => setAccepted(!accepted)}
          />
          {next('Accetta e prosegui', 'sign', !accepted || !reviewed)}
        </>
      )}
      {stage === 'sign' && (
        <>
          <Text style={s.heading}>Completa l’attivazione</Text>
          <Text style={s.body}>
            Premendo sul tasto conferma ed inserendo poi il sistema di
            autenticazione richiesto, si completa la sottoscrizione elettronica
            in corrispondenza dei punti firma finora accettati.
          </Text>
          {next('Prosegui', 'code', !reviewed || !accepted)}
        </>
      )}
      {stage === 'revoke' && (
        <>
          <Text style={s.heading}>Conferma la revoca</Text>
          <Text style={s.body}>
            Vuole revocare l’adesione alla funzionalità “{selected.name}”?
          </Text>
          <Text style={s.body}>
            La revoca avrà efficacia dal primo giorno del mese successivo.
          </Text>
          {next('Conferma', 'code')}
        </>
      )}
      {stage === 'code' && (
        <ServiceMobileCode
          onConfirm={() => {
            if (!revoking && (!reviewed || !accepted)) return;
            const current = readInvestmentServicePreferences();
            const activePackages = revoking
              ? current.activePackages.filter(name => name !== selected.name)
              : [...new Set([...current.activePackages, selected.name])];
            saveInvestmentServicePreferences({ activePackages });
            setPreferences({ ...current, activePackages });
            onPreferences();
            onChanged();
            setStage('success');
          }}
        />
      )}
      {stage === 'success' && (
        <>
          <AssetGlyph
            asset={servicesAssets.imgNavigationAndActionSuccessLargeTkyPage}
          />
          <Text style={s.heading}>
            {revoking
              ? 'Revoca confermata'
              : 'Funzionalità aggiuntiva attivata'}
          </Text>
          {revoking && (
            <Text style={s.body}>
              Ti informiamo di aver ricevuto la tua richiesta di revoca
              dell’adesione che avrà efficacia dal primo giorno del mese
              successivo.
            </Text>
          )}
          <Button label="Chiudi" onPress={onDone} />
        </>
      )}
    </>
  );
}
const styles = StyleSheet.create({
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  inline: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 4,
  },
  answer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    paddingVertical: 16,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#666',
  },
  checked: { backgroundColor: '#007f96', borderColor: '#007f96' },
});
