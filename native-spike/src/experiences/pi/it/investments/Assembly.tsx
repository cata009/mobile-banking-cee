import { PageTitle } from './PageLayout';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import {
  recordSecuritiesAssemblyTicket,
  saveSecuritiesFinancialState,
  validateSecuritiesAssemblyMobileCode,
  validateSecuritiesAssemblyRequest,
  type SecuritiesState,
} from '@/features/investments/mobileFirstSecurities';
import { securitiesAssemblies } from '@/experiences/pi/it/mobile-first/investmentsSecuritiesContent';
import { FormField } from '../../../../universal/FormField';
import { Button, Link, Rows, Tabs, s, tokens } from './Primitives';
export default function Assembly({
  state,
  onState,
  onChanged,
  registerBack,
  hasHoldings,
  instrument,
}: {
  state: SecuritiesState;
  onState: (state: SecuritiesState) => void;
  onChanged: () => void;
  registerBack: (handler: null | (() => boolean)) => void;
  hasHoldings: boolean;
  instrument?: string;
}) {
  const [selected, setSelected] = useState<string | null>(instrument ?? null);
  const [quantity, setQuantity] = useState('');
  const [convocation, setConvocation] = useState('Prima Convocazione');
  const [step, setStep] = useState(0);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const assembly = securitiesAssemblies.find(item => item.company === selected);
  useEffect(() => {
    registerBack(() => {
      if (step) setStep(step - 1);
      else if (selected) setSelected(null);
      else return false;
      setError(null);
      return true;
    });
    return () => registerBack(null);
  }, [registerBack, step, selected]);
  const next = () => {
    if (!assembly) return;
    if (step === 0) {
      const validation = validateSecuritiesAssemblyRequest(
        quantity,
        assembly.quantity,
      );
      if (validation) {
        setError(validation);
        return;
      }
      setStep(1);
    } else if (step === 1) setStep(2);
    else if (step === 2) {
      const validation = validateSecuritiesAssemblyMobileCode(code);
      if (validation) {
        setError(validation);
        return;
      }
      const nextState = recordSecuritiesAssemblyTicket(state, assembly.company);
      saveSecuritiesFinancialState(nextState);
      onState(nextState);
      onChanged();
      setStep(3);
    }
    setError(null);
  };
  if (!hasHoldings)
    return (
      <>
        <PageTitle>Biglietti assembleari</PageTitle>
        <Text style={s.body}>
          Non sono presenti titoli per cui richiedere biglietti assembleari.
        </Text>
      </>
    );
  if (selected && !assembly)
    return (
      <>
        <PageTitle>Assemblea non disponibile</PageTitle>
        <Text style={s.body}>L’assemblea richiesta non è presente.</Text>
      </>
    );
  return (
    <>
      <PageTitle>
        {assembly
          ? step === 2
            ? 'Mobile Code'
            : step === 3
              ? 'Richiesta inviata'
              : 'Richiesta biglietti assembleari'
          : 'Biglietti assembleari'}
      </PageTitle>
      {!!error && (
        <Text accessibilityRole="alert" style={s.error}>
          {error}
        </Text>
      )}
      {!assembly ? (
        <>
          <Text style={s.body}>
            In questa sezione è possibile richiedere l’emissione dei biglietti
            per la partecipazione alle assemblee in relazione ai titoli quotati
            di emittenti italiani in evidenza sul tuo portafoglio.
          </Text>
          {securitiesAssemblies.map(item => (
            <View key={item.company} style={s.card}>
              <Rows
                rows={[
                  { label: 'Nome società', value: item.company },
                  { label: 'Tipo assemblea', value: item.type },
                  { label: 'Data/ora assemblea', value: item.date },
                  { label: 'Indirizzo assemblea', value: item.address },
                  { label: 'Data/ora limite richiesta', value: item.deadline },
                  {
                    label: 'Numero biglietti richiesti',
                    value: String(state.assemblyTickets[item.company] ?? 0),
                  },
                ]}
              />
              <Link
                label={`Richiedi biglietto ${item.company}`}
                onPress={() => {
                  setSelected(item.company);
                  setQuantity('');
                  setError(null);
                }}
              />
            </View>
          ))}
        </>
      ) : step === 0 ? (
        <>
          <Text style={s.heading}>{assembly.company}</Text>
          <Text style={s.body}>
            Quantità di azioni disponibili: {assembly.quantity}
          </Text>
          <FormField
            tokens={tokens}
            label="Quantità di azioni richieste"
            value={quantity}
            onChange={value => {
              setQuantity(value);
              setError(null);
            }}
            inputProps={{ keyboardType: 'number-pad' }}
          />
          <Text style={s.body}>Convocazione</Text>
          <Tabs
            items={['Prima Convocazione', 'Seconda Convocazione']}
            value={convocation}
            onChange={setConvocation}
          />
          <Rows
            rows={[
              {
                label: 'Data/ora',
                value:
                  convocation === 'Prima Convocazione'
                    ? assembly.date
                    : '30/04/2025 - 10:00',
              },
              { label: 'Data/ora limite richiesta', value: assembly.deadline },
              { label: 'Luogo', value: assembly.address },
            ]}
          />
        </>
      ) : step === 1 ? (
        <>
          <Text style={s.heading}>Conferma richiesta</Text>
          <Text style={s.body}>
            La richiesta riserva le azioni indicate per la partecipazione
            all’assemblea. Confermi di voler procedere?
          </Text>
          <Rows
            rows={[
              { label: 'Società', value: assembly.company },
              { label: 'Quantità', value: quantity },
              { label: 'Convocazione', value: convocation },
              { label: 'Data/ora', value: assembly.date },
              { label: 'Luogo', value: assembly.address },
            ]}
          />
        </>
      ) : step === 2 ? (
        <>
          <Text style={s.body}>
            Inserisci il Mobile Code per confermare la richiesta.
          </Text>
          <FormField
            tokens={tokens}
            label="Mobile Code"
            value={code}
            onChange={setCode}
            inputProps={{ secureTextEntry: true, keyboardType: 'number-pad' }}
          />
          <Text style={s.small}>Per questa simulazione usa 123456.</Text>
        </>
      ) : (
        <View accessibilityRole="alert" style={s.card}>
          <Text style={s.heading}>La tua richiesta è stata inviata</Text>
          <Text style={s.body}>
            Biglietto assembleare per {assembly.company}. Potrai consultare il
            numero di biglietti richiesti nella sezione Biglietti assembleari.
          </Text>
        </View>
      )}
      {assembly && (
        <Button
          label={
            step === 3
              ? 'Vai ai biglietti assembleari'
              : step === 2
                ? 'Conferma'
                : 'Prosegui'
          }
          onPress={
            step === 3
              ? () => {
                  setSelected(null);
                  setStep(0);
                  setQuantity('');
                }
              : next
          }
        />
      )}
    </>
  );
}
