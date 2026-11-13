import React, { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import documentIcon from '@/assets/pi/ro/cash-loan/document.svg';
import uploadIcon from '@/assets/pi/ro/cash-loan/upload.svg';
import { AssetGlyph } from '../../../../../universal/AssetGlyph';
import { Text } from '../../../../../universal/Typography';
import { SourceCustomIcon } from '../../../../../universal/SourceCustomIcon';
import { sourceColor } from '../../../../../universal/sourceColor';
import { pickLocalDocument } from '../../../../../platform/filePicker';
import {
  validLoanUpload,
  readIncomeEntries,
} from '@/features/ro-cash-loan/model';
import { BaselineCheckbox } from '../../../../../universal/BaselineCheckbox';
import { BaselineNavigationRow } from '../../../../../universal/BaselineNavigationRow';
import { PrimaryButton } from '../../../../../universal/PrimaryButton';
import { OnboardingSheet } from './OnboardingSheet';
import { OnboardingSectionDivider } from './OnboardingSectionDivider';
import {
  LoanCopy,
  LoanField,
  LoanLink,
  LoanSelect,
  loanStyles as s,
  type CashLoanPageProps,
} from './CashLoanCommon';

export function CashLoanFinancial(p: CashLoanPageProps) {
  return (
    <View style={s.content}>
      <LoanCopy>
        In acest pas avem nevoie sa ne oferi mai multe informatii despre
        veniturile tale
      </LoanCopy>
      <LoanSelect
        label="Statut Profesional"
        name="professional"
        values={p.values}
        onChange={p.onChange}
        options={[
          'ANGAJAT',
          'PENSIONAR',
          'ALTELE',
          'ASOCIAT',
          'FREELANCER',
          'STUDENT',
          'FARA LOC DE MUNCA',
        ]}
      />
      <LoanSelect
        label="Tipul contractului de munca"
        name="workContract"
        values={p.values}
        onChange={p.onChange}
        options={[
          'PERIOADA NEDETERMINATA',
          'PERIOADA DETERMINATA',
          'VALOARE 3',
          'VALOARE 4',
          'VALOARE 5',
        ]}
      />
      <LoanField
        label="Ocupatia"
        name="occupation"
        values={p.values}
        onChange={p.onChange}
      />
      <View
        style={{
          padding: 16,
          gap: 24,
          borderWidth: 1,
          borderRadius: 4,
          borderColor: sourceColor('var(--uc-text-muted)'),
        }}
      >
        <View style={s.row}>
          <Text style={[s.label, s.grow]}>
            INCASEZ VENITURI CARE NU FIGUREAZA IN BAZA DE DATE ANAF
          </Text>
          <BaselineCheckbox
            presentation="canonical"
            checked={!!p.checks.otherIncome}
            onCheckedChange={() =>
              p.onCheck('otherIncome', !p.checks.otherIncome)
            }
            ariaLabel="INCASEZ VENITURI CARE NU FIGUREAZA IN BAZA DE DATE ANAF"
          />
        </View>
        <View style={[s.row, { gap: 8 }]}>
          <SourceCustomIcon
            name="info-circle"
            size={16}
            color={sourceColor('var(--uc-text)')}
          />
          <View style={s.grow}>
            <Text style={[s.small, { fontSize: 14, lineHeight: 16 }]}>
              În situația în care încasezi venituri (diurne, salarii etc.) care
              nu pot fi interogate în baza de date ANAF, te rugăm să bifezi
              căsuța de mai sus.
            </Text>
          </View>
        </View>
      </View>
      <LoanSelect
        label="Persoane aflate in intretinere"
        name="dependants"
        values={p.values}
        onChange={p.onChange}
        options={['0', '1', '2', '3', '4', '5']}
      />
      <LoanSelect
        label="Starea civila"
        name="marital"
        values={p.values}
        onChange={p.onChange}
        options={[
          'CASATORIT',
          'NECASATORIT',
          'DIVORTAT',
          'ALTA VALOARE',
          'ALTA VALOARE 2',
        ]}
      />
      {!!p.values.monthlyIncome && (
        <View style={s.group}>
          <OnboardingSectionDivider title="ALTE TIPURI DE VENIT" />
          <LoanCopy>
            {p.values.incomeType} · {p.values.monthlyIncome} LEI
          </LoanCopy>
          <PrimaryButton
            label="Modifică veniturile"
            variant="secondary"
            onPress={() => p.onGo('loan-other-income')}
          />
        </View>
      )}
    </View>
  );
}
export function CashLoanOtherIncome(p: CashLoanPageProps) {
  if (p.step === 'loan-income-summary')
    return (
      <View style={s.content}>
        <OnboardingSectionDivider title="ALTE TIPURI DE VENIT" />
        {(p.values.incomes
          ? readIncomeEntries(p.values.incomes)
          : [
              {
                type: p.values.incomeType || 'Diurnă',
                amount: p.values.monthlyIncome || '2.000',
              },
            ]
        ).map((row, index) => (
          <BaselineNavigationRow
            key={index}
            title={row.type}
            description={row.amount}
            trailingAccessory="chevron"
            onPress={() => {
              p.onChange('incomeType', row.type);
              p.onChange('monthlyIncome', row.amount);
              p.onGo('loan-other-income');
            }}
          />
        ))}
      </View>
    );
  return (
    <View style={s.content}>
      <LoanCopy>
        Poti prezenta si alte venituri pe care le incasezi ce nu pot fi
        interogate in baza de date ANAF, selectand una din categoriile de mai
        jos. Poti consulta Ghidul privind veniturile acceptate{' '}
        <Text
          accessibilityRole="link"
          style={{ textDecorationLine: 'underline' }}
          onPress={() => p.onDocument('Ghid privind veniturile aditionale')}
        >
          aici
        </Text>
        .
      </LoanCopy>
      <LoanSelect
        label="Alte tipuri de venit"
        name="incomeType"
        values={p.values}
        onChange={p.onChange}
        initialOpen={p.values.documentSheet === 'incomeType'}
        uppercaseOptions
        optionDescriptions={{
          'Venituri din salarii':
            'Daca esti angajat al unei institutii publice ale carei date privind salariile nu pot fi interogate in baza de date a ANAF, de exemplu Ministerul Apararii Nationale, Ministerul Afacerilor Interne, Serviciul de Telecomunicatii Speciale, Serviciul de Protectie si Paza, Serviciul Roman de Informatii, Serviciul de Informatii Externe.',
        }}
        options={[
          'Venituri din salarii',
          'Venituri din diurne',
          'Norma de hrana pentru angajatii institutiilor de stat',
          'Pensie militara',
          'Venituri obținute din indemnizatia de crestere copil (provenit din salarii)',
          'Venituri din chirii',
          'Venituri din rente viagere',
          'Venituri din contracte de management / mandat',
        ]}
      />
      <LoanField
        label="Venitul lunar incasat"
        name="monthlyIncome"
        values={p.values}
        onChange={p.onChange}
        numeric
        suffix="LEI"
      />
      {!!p.values.incomeType && (
        <>
          <LoanField
            label="CUI Angajator"
            name="employerCui"
            values={p.values}
            onChange={p.onChange}
            numeric
            maxLength={10}
          />
          <LoanField
            label="Ocupatia"
            name="incomeOccupation"
            values={p.values}
            onChange={p.onChange}
          />
          <LoanField
            label="Data angajare"
            name="employmentDate"
            values={p.values}
            onChange={p.onChange}
            helperText="ZZ-LL-AAAA"
          />
          <LoanSelect
            label="Tipul contractului de munca"
            name="incomeContract"
            values={p.values}
            onChange={p.onChange}
            options={['Perioada nedeterminata', 'Perioada determinata']}
          />
        </>
      )}
    </View>
  );
}
export function CashLoanIncomeDocuments(p: CashLoanPageProps) {
  const [deleting, setDeleting] = useState<string | null>(
    p.values.deleteDocument === 'true' ? 'incomeDocument' : null,
  );
  const [models, setModels] = useState(p.values.showDocumentModels === 'true');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const alive = useRef(true),
    pending = useRef(false);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const upload = async (key: string) => {
    if (pending.current) return;
    pending.current = true;
    setBusy(key);
    setError('');
    try {
      const file = await pickLocalDocument(false);
      try {
        if (!alive.current || !file) return;
        if (!validLoanUpload(file)) {
          setError('Alege un document PDF, PNG sau JPEG de maximum 10 MB.');
          return;
        }
        p.onChange(key, file.name);
      } finally {
        if (Platform.OS === 'web' && file?.uri.startsWith('blob:'))
          URL.revokeObjectURL(file.uri);
      }
    } catch {
      if (alive.current)
        setError('Documentul nu a putut fi selectat. Reîncearcă.');
    } finally {
      pending.current = false;
      if (alive.current) setBusy(null);
    }
  };
  const extra = p.step === 'loan-extra-information';
  const child = /crestere copil/i.test(p.values.incomeType || '');
  const entries = extra
    ? [['extraDocument', 'DOCUMENT SUPLIMENTAR']]
    : child
      ? [
          [
            'incomeDecision',
            'DECIZIA PRIVIND INDEMNIZATIA DE CRESTERE A COPILULUI',
          ],
          ['incomeSlip', 'TALON - INDEMNIZATIE CRESTERE COPIL'],
          ['incomeDocument', 'ADEVERINTA DE VENIT'],
        ]
      : [['incomeDocument', 'ADEVERINTA DE VENIT']];
  return (
    <View style={s.content}>
      <LoanCopy>
        {extra
          ? 'Pentru a finaliza analiza solicitarii tale, te rugam sa ne ajuti cu urmatoarele informatii:'
          : 'Încarcă documentele justificative pentru venitul declarat. Analiza se va face de luni până vineri, între 09:00 și 17:30.'}
      </LoanCopy>
      {extra ? (
        <>
          <View style={s.mutedBox}>
            <LoanCopy>Va rog sa atasati extrasul de cont.</LoanCopy>
          </View>
          <LoanCopy small>
            In functie de informatiile suplimentare solicitate, poti descarca de
            aici formularul potrivit
          </LoanCopy>
          <LoanLink title="FORMULARE UTILE" onPress={() => setModels(true)} />
        </>
      ) : (
        <View style={s.group}>
          <OnboardingSectionDivider title="TIP VENIT" />
          <LoanCopy small>
            {(p.values.incomeType || 'VENITURI DIN SALARII').toUpperCase()}
          </LoanCopy>
        </View>
      )}
      {entries.map(([key, title]) => (
        <View key={key} style={s.group}>
          <View
            style={{
              borderWidth: 1,
              borderColor: sourceColor('var(--uc-text)'),
              borderRadius: 4,
              padding: 12,
              gap: 16,
            }}
          >
            <View style={[s.row, { gap: 16 }]}>
              <AssetGlyph asset={documentIcon} size={24} />
              <Text style={[s.label, s.grow, { lineHeight: 16 }]}>{title}</Text>
            </View>
            <View
              style={{
                height: 1,
                backgroundColor: sourceColor('var(--uc-text-muted)'),
              }}
            />
            {p.values[key] ? (
              <View style={[s.row, { gap: 4 }]}>
                <Text style={[s.small, s.grow]}>{p.values[key]}</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Șterge ${p.values[key]}`}
                  hitSlop={12}
                  onPress={() => setDeleting(key)}
                >
                  <SourceCustomIcon
                    name="trash-2"
                    size={14}
                    color={sourceColor('var(--uc-text)')}
                  />
                </Pressable>
              </View>
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="ÎNCARCĂ DOCUMENTUL"
                accessibilityState={{ disabled: !!busy, busy: busy === key }}
                disabled={!!busy}
                onPress={() => upload(key)}
                style={[
                  s.row,
                  { justifyContent: 'center', gap: 5, minHeight: 24 },
                ]}
              >
                <AssetGlyph asset={uploadIcon} size={14} />
                <Text
                  style={[
                    s.label,
                    { color: sourceColor('var(--uc-action)'), lineHeight: 16 },
                  ]}
                >
                  ÎNCARCĂ DOCUMENTUL
                </Text>
              </Pressable>
            )}
          </View>
          {child && key === 'incomeSlip' && (
            <LoanCopy small>
              In cazul in care nu ai primit Decizia privind indemnizatia de
              crestere copil si Talonul sau extrasul, te rugam sa incarci
              Adeverinta ta detaliata emisa in formatul angajatorului sau in
              formatul Directiei Generale de Asistenta Sociala si Protectie a
              copilului cu veniturile pe ultimele 12 luni anterioare datei
              nasterii copilului si motivul/data suspendarii contractului de
              munca sau, daca esti angajat MAPN/SRI/SPP/STS/MAI, Adeverinta de
              venit (
              <Text
                accessibilityRole="link"
                style={{ textDecorationLine: 'underline' }}
                onPress={() => setModels(true)}
              >
                model aici
              </Text>
              )
            </LoanCopy>
          )}
          {!extra && key === 'incomeDocument' && (
            <LoanCopy small>
              Te rugam sa incarci Adeverinta de venit, completata si semnata de
              angajator
            </LoanCopy>
          )}
        </View>
      ))}
      {!extra && !child && (
        <LoanLink title="Model de document" onPress={() => setModels(true)} />
      )}
      {extra && (
        <LoanField
          label="Mesajul tau"
          name="extraMessage"
          values={p.values}
          onChange={p.onChange}
          maxLength={1000}
          helperText="Scrie-ne aici daca doresti sa ne coumunici informatii suplimentare"
        />
      )}
      {!!error && <LoanCopy>{error}</LoanCopy>}
      {deleting && (
        <OnboardingSheet
          title="Stergi documentul"
          onClose={() => setDeleting(null)}
          footer={
            <View style={s.group}>
              <PrimaryButton
                label="Sterge"
                onPress={() => {
                  p.onChange(deleting, '');
                  setDeleting(null);
                }}
              />
              <PrimaryButton
                label="Inapoi"
                variant="secondary"
                onPress={() => setDeleting(null)}
              />
            </View>
          }
        >
          <LoanCopy>
            Esti pe cale sa stergi documentul. Esti sigur ca vrei asta?
          </LoanCopy>
        </OnboardingSheet>
      )}
      {models && (
        <OnboardingSheet
          title="Model de document"
          onClose={() => setModels(false)}
        >
          {[
            'ACORD CRC',
            'ADEVERINTA DE VENIT IN FORMAT STANDARD',
            'ADEVERINTA PRIVIND VENITURILE OBTINUTE DIN DIURNE',
          ].map(title => (
            <LoanLink
              key={title}
              title={title}
              onPress={() => p.onDocument(title)}
            />
          ))}
        </OnboardingSheet>
      )}
    </View>
  );
}
