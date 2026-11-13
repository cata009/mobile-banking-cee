import React from 'react';
import { View } from 'react-native';
import { BaselineFeedbackSlider } from '../../../../../universal/BaselineFeedbackProgress';
import { BaselineCheckbox } from '../../../../../universal/BaselineCheckbox';
import { BaselineTag } from '../../../../../universal/BaselineTag';
import { BaselineNavigationLink } from '../../../../../universal/BaselineNavigationLink';
import { RadioButton } from '../../../../../universal/RadioButton';
import { Text } from '../../../../../universal/Typography';
import { sourceColor } from '../../../../../universal/sourceColor';
import { OnboardingSectionDivider } from './OnboardingSectionDivider';
import {
  LoanAgreement,
  LoanCopy,
  LoanField,
  LoanLink,
  LoanSelect,
  loanStyles as s,
  type CashLoanPageProps,
} from './CashLoanCommon';
const number = (value: string) => Number(value || 0).toLocaleString('ro-RO');
const statistics = [
  ['DOBÂNDA FIXĂ', '5.99%'],
  ['DAE', '10.11%'],
  ['TOTAL DE RAMBURSAT', '50.500,31 LEI'],
];
function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.group}>
      <Text style={s.label}>{label}</Text>
      <LoanCopy small>{value}</LoanCopy>
    </View>
  );
}
function LoanInsurance(p: CashLoanPageProps) {
  const recommended = p.values.recommendedInsurance === 'true';
  return (
    <View style={s.content}>
      {[true, false].map(yes => (
        <React.Fragment key={String(yes)}>
          <View
            style={{
              borderWidth: p.checks.insurance === yes ? 2 : 1,
              borderColor: sourceColor(
                p.checks.insurance === yes
                  ? 'var(--uc-action)'
                  : 'var(--uc-text-muted)',
              ),
              borderRadius: 4,
              padding: p.checks.insurance === yes ? 14 : 15,
              gap: 12,
            }}
          >
            <RadioButton
              label={
                yes
                  ? 'DORESC ASIGURARE PENTRU CREDIT'
                  : 'NU DORESC ASIGURARE PENTRU CREDIT'
              }
              selected={!!p.checks.insurance === yes}
              onPress={() => p.onCheck('insurance', yes)}
              paddingHorizontal={0}
              labelStyle={s.label}
              description={
                yes
                  ? 'Vreau să fiu protejat în caz de incidente'
                  : 'Înțeleg eventualele riscuri care pot să apară'
              }
              style={{
                paddingVertical: 0,
                flexDirection: 'row-reverse',
                alignItems: 'flex-start',
              }}
            />
            {yes && p.checks.insurance && !recommended && (
              <LoanCopy small>
                Reduci dobânda creditului cu 2 puncte procentuale dacă alegi și
                asigurare de viață. Asigurarea te ajută să plătești creditul în
                cazul pierderii locului de muncă sau a incapacității de a lucra.
                În caz de invaliditate sau deces, creditul tău va fi plătit
                integral.
              </LoanCopy>
            )}
          </View>
          {yes && recommended && p.checks.insurance && (
            <View
              style={[s.mutedBox, { padding: 16, borderRadius: 6, gap: 16 }]}
            >
              <BaselineTag kind="positive" label="RECOMANDAT" />
              <View style={s.group}>
                <Text style={s.label}>REDUCERE DOBĂNDA</Text>
                <Text
                  style={[
                    s.body,
                    {
                      fontFamily: 'UniCredit-bold',
                      textTransform: 'uppercase',
                    },
                  ]}
                >
                  1 punct procentual
                </Text>
                <LoanCopy small>
                  Dacă alegi și asigurare de viață. Asigurarea te ajută să
                  plătești creditul în cazul pierderii locului de muncă sau a
                  incapacității de a lucra. În caz de invaliditate sau deces,
                  creditul tău va fi plătit integral.
                </LoanCopy>
              </View>
              <View
                style={{
                  height: 1,
                  backgroundColor: sourceColor('var(--uc-border)'),
                }}
              />
              <LoanAgreement
                hideTitle
                title="ACORD GDPR GENERALI"
                checked={!!p.checks.generali}
                onToggle={() => p.onCheck('generali', !p.checks.generali)}
              >
                Am citit și accept Nota de Informare Generali România. Confirm
                că datele mele, inclusiv cele de sănătate, pot fi prelucrate de
                Generali.
              </LoanAgreement>
              <BaselineNavigationLink
                text="NOTA DE INFORMARE"
                presentation="primary"
                onPress={() =>
                  p.onDocument('Nota de Informare Generali', 'generali')
                }
              />
            </View>
          )}
        </React.Fragment>
      ))}
      {p.checks.insurance ? (
        recommended ? null : (
          <LoanAgreement
            title="ACORD GDPR GENERALI"
            checked={!!p.checks.generali}
            onToggle={() => p.onCheck('generali', !p.checks.generali)}
            onOpen={() =>
              p.onDocument('Nota de Informare Generali', 'generali')
            }
          >
            Am citit și sunt de acord cu Nota de Informare Generali România
            Asigurare Reasigurare S.A. Confirm că sunt de acord ca datele mele
            inclusiv cele de sănătate să fie prelucrate de Generali.
          </LoanAgreement>
        )
      ) : (
        <LoanCopy small>
          Poți renunța la asigurare, dar dacă îți pierzi veniturile, va trebui
          să plătești creditul în continuare.
        </LoanCopy>
      )}
    </View>
  );
}
function AmountPeriod(p: CashLoanPageProps) {
  return (
    <View style={s.content}>
      <View style={{ marginHorizontal: -24 }}>
        <BaselineFeedbackSlider
          compact
          label={
            p.values.loanType === 'refinance'
              ? 'DE CE SUMA SUPLIMENTARĂ AI NEVOIE?'
              : 'DE CE SUMĂ AI NEVOIE?'
          }
          value={Number(p.values.loanAmount || 40000)}
          min={1500}
          max={40000}
          step={500}
          onChange={value => p.onChange('loanAmount', String(value))}
          valueLabel={`${number(p.values.loanAmount)} LEI`}
          minLabel="1.500 RON"
          maxLabel="40.000 RON"
        />
      </View>
      <View style={{ marginHorizontal: -24 }}>
        <BaselineFeedbackSlider
          compact
          label="PE CE PERIOADĂ?"
          value={Number(p.values.loanMonths || 60)}
          min={6}
          max={60}
          step={1}
          onChange={value => p.onChange('loanMonths', String(value))}
          showTrack={false}
        />
      </View>
      <LoanCopy small>
        Perioada minimă este de 6 luni și maximă de 60 de luni
      </LoanCopy>
    </View>
  );
}
function Repayment(p: CashLoanPageProps) {
  return (
    <View style={s.content}>
      <LoanSelect
        label="Achitare credit prin"
        name="repayment"
        values={p.values}
        onChange={p.onChange}
        options={['Rată egală', 'Rată descrescătoare']}
        initialOpen={p.values.documentSheet === 'repayment'}
        helperText={
          p.values.repayment === 'Rată egală'
            ? 'Datoria scade constant cu aceeași sumă. La rate egale, dobânzile totale sunt mai mari decât la rate descrescătoare. Inițial, principalul poate fi mai mic decât dobânda, soldul scăzând lent. Poți face rambursări anticipate oricând.'
            : undefined
        }
      />
      <LoanSelect
        label="Ziua cand vei plati rata"
        name="paymentDay"
        values={p.values}
        onChange={p.onChange}
        options={Array.from({ length: 28 }, (_, i) => String(i + 1))}
        initialOpen={p.values.documentSheet === 'paymentDay'}
      />
    </View>
  );
}
function RefinanceCredit({
  index,
  p,
  editable = false,
}: {
  index: string;
  p: CashLoanPageProps;
  editable?: boolean;
}) {
  return (
    <View
      style={{
        ...s.content,
        padding: 16,
        borderWidth: 1,
        borderRadius: 4,
        borderColor: sourceColor('var(--uc-border)'),
      }}
    >
      <View style={s.row}>
        {!editable && (
          <BaselineCheckbox
            presentation="canonical"
            checked={!!p.checks[`refinance${index}`]}
            ariaLabel={`Refinanțează creditul ${index}`}
            onCheckedChange={() =>
              p.onCheck(`refinance${index}`, !p.checks[`refinance${index}`])
            }
          />
        )}
        <View style={s.grow}>
          <Text style={s.label}>CREDIT DE CONSUM</Text>
          <Text style={s.title}>17.500 LEI</Text>
        </View>
      </View>
      <Fact label="RATA LUNARĂ" value="250,21 LEI" />
      <Fact label="VALOARE DE REFINANȚAT" value="21.500,00 LEI" />
      {!editable && <Fact label="DURATĂ" value="60 LUNI" />}
      <Fact label="DATA DE ACORDARE" value="14.03.2022" />
      <LoanSelect
        label="Instituția Financiară"
        name={`refinanceBank${index}`}
        values={p.values}
        onChange={p.onChange}
        options={['UniCredit Consumer Financing', 'Banca Transilvania']}
        helperText={
          !editable
            ? 'Selectează instituția financiară care a eliberat creditul'
            : undefined
        }
      />
      {editable && (
        <>
          <LoanField
            label="IBAN pentru refinantarea creditului"
            name={`refinanceIban${index}`}
            values={p.values}
            onChange={p.onChange}
            maxLength={34}
          />
          <LoanField
            label="Numar contract"
            name={`refinanceContract${index}`}
            values={p.values}
            onChange={p.onChange}
          />
        </>
      )}
    </View>
  );
}
export function CashLoanOffer(p: CashLoanPageProps) {
  const refinance = p.values.loanType === 'refinance';
  return (
    <View style={s.content}>
      <LoanCopy>
        După evaluarea datelor tale, îți prezentăm oferta de creditare, pe care
        te rugăm să o analizezi atent.
      </LoanCopy>
      {(refinance || p.values.refinanceEligible === 'true') && (
        <View style={s.row}>
          {['refinance', 'standard'].map(type => (
            <View key={type} style={s.grow}>
              <RadioButton
                key={type}
                label={type === 'refinance' ? 'REFINANȚARE' : 'CREDIT STANDARD'}
                selected={p.values.loanType === type}
                onPress={() => p.onChange('loanType', type)}
                paddingHorizontal={0}
                labelStyle={s.label}
              />
            </View>
          ))}
        </View>
      )}
      {refinance ? (
        <>
          <LoanCopy small>
            Am găsit 5 credite eligibile în urma interogării Biroului de
            Credite. Informații adiționale despre refinanțare{' '}
            <Text
              accessibilityRole="link"
              style={{ textDecorationLine: 'underline' }}
              onPress={() =>
                p.onDocument('Informații adiționale despre refinanțare')
              }
            >
              aici
            </Text>
          </LoanCopy>
          {['1', '2'].map(index => (
            <RefinanceCredit key={index} index={index} p={p} />
          ))}
          <View style={s.mutedBox}>
            <LoanCopy>
              Sunt selectate{' '}
              {Number(!!p.checks.refinance1) + Number(!!p.checks.refinance2)}{' '}
              {Number(!!p.checks.refinance1) + Number(!!p.checks.refinance2) ===
              1
                ? 'credit'
                : 'credite'}{' '}
              pentru un total de{' '}
              {(
                (p.checks.refinance1 ? 17500 : 0) +
                (p.checks.refinance2 ? 17500 : 0)
              ).toLocaleString('ro-RO')}{' '}
              Lei
            </LoanCopy>
          </View>
          <LoanInsurance {...p} />
          <Repayment {...p} />
          <AmountPeriod {...p} />
          {[
            ['VALOARE TOTALA CREDIT SOLICITAT', '150.500,31 LEI'],
            [
              'DIN CARE SUMA SUPLIMENTARA PENTRU NEVOI PERSONALE',
              '50.500,31 LEI',
            ],
            ['SUMA REFINANTATA', '100.000,00 LEI'],
            [
              'RATA LUNARĂ CREDIT NOU (INCLUDE CREDITE REFINANTATE)',
              '855,30 LEI',
            ],
            [
              'TOTAL RATE PE CARE LE PLATESTI ACUM DIN CREDITE SELECTATE',
              '1.233,30 LEI',
            ],
            ['DOBÂNDA FIXĂ', '5.99%'],
            ['DAE', '7.99%'],
            ['VALOARE TOTALA PLATIBILA', '190.500,31 LEI'],
          ].map(([label, value]) => (
            <Fact key={label} label={label} value={value} />
          ))}
        </>
      ) : (
        <>
          <View style={s.mutedBox}>
            <Text style={s.label}>SUMĂ MAXIMĂ PE CARE AI PUTEA SA O OBTII</Text>
            <Text style={s.title}>40.000,00 LEI</Text>
          </View>
          <View style={s.mutedBox}>
            <Text style={s.label}>RATA LUNARA CREDIT</Text>
            <Text style={s.title}>1.437,36 LEI</Text>
          </View>
          <AmountPeriod {...p} />
          <LoanInsurance {...p} />
          {statistics.map(([label, value]) => (
            <Fact key={label} label={label} value={value} />
          ))}
          <Repayment {...p} />
        </>
      )}
    </View>
  );
}
export function CashLoanRefinancing(p: CashLoanPageProps) {
  return (
    <View style={s.content}>
      <LoanCopy>
        Introdu pentru fiecare credit refinantat codul IBAN si numarul
        contractului de credit.
      </LoanCopy>
      <LoanLink
        title="Informatii aditionale despre refinantare si costul ordinului de plata conditionat aici"
        onPress={() =>
          p.onDocument('Refinanțare și costul ordinului de plată condiționat')
        }
      />
      <OnboardingSectionDivider title="CREDITE LA ALTE BĂNCI" />
      {['1', '2']
        .filter(index => p.checks[`refinance${index}`])
        .map(index => (
          <RefinanceCredit key={index} index={index} p={p} editable />
        ))}
      <LoanCopy small>
        Introdu numărul de cont și numărul contractului de credit refinanțat
        pentru transferul sumei de refinanțare prin ordin de plată condiționat.
      </LoanCopy>
    </View>
  );
}
export function CashLoanSummary(p: CashLoanPageProps) {
  return (
    <View style={s.content}>
      <LoanCopy>
        Verifică oferta aleasă și citește documentația de credit, de asigurare
        (dacă ai optat) și certificatul calificat, confirmând prin semnare că
        le-ai deschis, citit, înțeles și acceptat.
      </LoanCopy>
      <OnboardingSectionDivider title="OFERTA DE CREDIT" />
      {[
        ['SUMA SOLICITATĂ', `${number(p.values.loanAmount)} LEI`],
        ['RATĂ LUNARĂ', '838,34 LEI'],
        ['PERIOADĂ', `${p.values.loanMonths} LUNI`],
        ...statistics,
        ['ASIGURARE DE CREDIT INCLUSĂ', p.checks.insurance ? 'DA' : 'NU'],
        ...(p.checks.insurance
          ? [['COST TOTAL ASIGURARE', '1.314,00 LEI']]
          : []),
      ].map(([label, value]) => (
        <Fact key={label} label={label} value={value} />
      ))}
      {p.checks.insurance && (
        <LoanCopy small>
          Prima de asigurare lunară de 30,66 LEI este inclusă și plătită
          împreună cu rata creditului.
        </LoanCopy>
      )}
      <Fact
        label="ZIUA CÂND VEI PLĂTI RATĂ"
        value={p.values.paymentDay || '13'}
      />
      <OnboardingSectionDivider title="TAXE ȘI COMISIOANE" />
      <Fact label="COMISIOANE DE ANALIZĂ DOSAR" value="300 LEI" />
      <Fact label="COMISIOANE DE RAMBURSARE ANTICIPATĂ" value="1%" />
      <LoanCopy small>
        1% din suma rambursată anticipat dacă perioada până la încetare
        depășește un an, sau 0,5% dacă e sub un an.
      </LoanCopy>
      {[
        [
          'offerCredit',
          'DOCUMENTAȚIE PRECONTRACTUALĂ CREDIT',
          'Am citit și sunt de acord cu Documentele și termenii și condițiile prevăzute de acestea.',
          'DOCUMENTAȚIE PRECONTRACTUALĂ CREDIT',
        ],
        [
          'qualifiedCertificate',
          'EMITERE CERTIFICAT ELECTRONIC',
          'Am citit integral și sunt de acord cu Cererea de emitere și termenii și condițiile acestui produs.',
          'CERTIFICAT ELECTRONIC CALIFICAT',
        ],
        ...(p.checks.insurance
          ? [
              [
                'offerInsurance',
                'DOCUMENTAȚIE PRECONTRACTUALĂ ASIGURARE',
                'Descarcă documentele precontractuale pentru verificare și acord.',
                'DOCUMENTAȚIE ASIGURARE',
              ],
              [
                'insuranceConditions',
                'CONDIȚII DE ASIGURARE',
                'Descarcă Condițiile de asigurare pentru verificare și acord.',
                '',
              ],
            ]
          : []),
      ].map(([key, title, body, section]) => (
        <View key={key} style={s.group}>
          {!!section && <OnboardingSectionDivider title={section} />}
          <LoanAgreement
            title={title}
            checked={!!p.checks[key]}
            onToggle={() =>
              p.checks[key] ? p.onCheck(key, false) : p.onDocument(title, key)
            }
            onOpen={() => p.onDocument(title, key)}
          >
            {body}
          </LoanAgreement>
          {key === 'qualifiedCertificate' && (
            <>
              <Text style={s.label}>ACORD GDPR TRANS SPED S.A.</Text>
              <LoanCopy small>
                Am citit și sunt de acord cu{' '}
                <Text
                  accessibilityRole="link"
                  style={{ textDecorationLine: 'underline' }}
                  onPress={() =>
                    p.onDocument('Nota de informare TRANS SPED S.A.')
                  }
                >
                  Nota de informare
                </Text>{' '}
                referitoare la prelucrarea datelor cu caracter personal.
              </LoanCopy>
            </>
          )}
        </View>
      ))}
    </View>
  );
}
