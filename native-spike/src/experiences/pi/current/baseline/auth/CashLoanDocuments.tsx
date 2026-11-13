import React from 'react';
import { View } from 'react-native';
import { BaselineCheckbox } from '../../../../../universal/BaselineCheckbox';
import { BaselineNavigationRow } from '../../../../../universal/BaselineNavigationRow';
import { ToggleButton } from '../../../../../universal/ToggleButton';
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
const AGREEMENTS = [
  [
    'loanRequest',
    'SOLICITARE OFERTĂ CREDIT',
    'Am citit și sunt de acord cu termenii și condițiile prevăzute în Solicitarea de ofertă de credit.',
  ],
  [
    'anaf',
    'ACORD ANAF',
    'Am citit și sunt de acord cu Transmiterea și prelucrarea informațiilor din baza de date ANAF. Poți să îți retragi acordul în maximum 5 zile lucrătoare de la semnarea acestuia, în secțiunea Anulează cererea.',
  ],
  [
    'creditBureau',
    'NOTA DE INFORMARE BIROUL DE CREDIT',
    'Am citit și am înțeles Nota de informare referitoare la prelucrarea datelor personale în Sistemul Biroului de Credit.',
  ],
  [
    'ucfinGdpr',
    'NOTA DE INFORMARE ȘI ACORD GDPR UCFIN',
    'Am citit și am înțeles integral Nota de informare referitoare la prelucrarea datelor personale.',
  ],
] as const;
export function CashLoanAgreements(p: CashLoanPageProps) {
  return (
    <View style={s.content}>
      <LoanCopy>
        Pentru a calcula suma oferită, trebuie să parcurgi și să semnezi lista
        de documente, confirmând că le-ai deschis, citit, înțeles și acceptat.
        Poți consulta{' '}
        <Text
          accessibilityRole="link"
          style={{ textDecorationLine: 'underline' }}
          onPress={() =>
            p.onDocument('Ghidul de semnare a documentelor la distanță')
          }
        >
          Ghidul de semnare a documentelor la distanță
        </Text>{' '}
        dar si{' '}
        <Text
          accessibilityRole="link"
          style={{ textDecorationLine: 'underline' }}
          onPress={() =>
            p.onDocument('Conditiile de eligibilitate ale produsului')
          }
        >
          Conditiile de eligibilitate ale produsului.
        </Text>
      </LoanCopy>
      <BaselineNavigationRow
        title="INFORMATII DE INTERES PENTRU TINE"
        description="Informatii despre datele tale personale si optiunile de marketing"
        descriptionLines={null}
        trailingAccessory="chevron"
        style={{ marginHorizontal: -24, height: 'auto', minHeight: 80 }}
        onPress={() => p.onGo('loan-data-review')}
      />
      {AGREEMENTS.map(([key, title, body]) => (
        <LoanAgreement
          key={key}
          title={title}
          checked={!!p.checks[key]}
          onToggle={() =>
            p.checks[key] ? p.onCheck(key, false) : p.onDocument(title, key)
          }
          onOpen={() => p.onDocument(title, key)}
        >
          {body}
        </LoanAgreement>
      ))}
      <LoanAgreement
        title="ACORD VERIFICARE RULAJ LUNAR"
        checked={!!p.checks.turnover}
        onToggle={() => p.onCheck('turnover', !p.checks.turnover)}
      >
        Îmi exprim acordul ca operatorul să solicite si sa obtina de la
        UniCredit Bank SA datele mele pentru a ma informa despre produsul de
        credit cu conditie de rulaj lunar, precum si pentru analiza si acordarea
        beneficiului aferent acestui produs (reducerea de dobanda).
      </LoanAgreement>
      <LoanAgreement
        title="ACORD OFERTĂ CU ASIGURARE DE VIAȚĂ"
        checked={!!p.checks.lifeOffer}
        onToggle={() => p.onCheck('lifeOffer', !p.checks.lifeOffer)}
      >
        Îmi exprim acordul ca operatorul să prelucreze datele mele cu caracter
        personal, pentru a-mi comunica oferta și detaliile produsului de
        asigurare de viață, complementar produsului financiar solicitat.
      </LoanAgreement>
      {(!p.checks.turnover || !p.checks.lifeOffer) && (
        <View style={s.mutedBox}>
          <LoanCopy small>
            {!p.checks.turnover
              ? 'Nu ți-ai dat acordul pentru verificarea rulajului conturilor la UniCredit Bank, astfel nu putem analiza reducerea dobânzii cu 1 punct procentual.'
              : ''}
            {!p.checks.lifeOffer
              ? 'Alegerea ta nu include oferta cu asigurare de viață, care acoperă rata creditului la incapacitate temporară/pierderea locului de muncă sau soldul creditului la deces/invaliditate permanentă.'
              : ''}
          </LoanCopy>
        </View>
      )}
    </View>
  );
}
export function CashLoanPin(p: CashLoanPageProps) {
  const creating = p.step === 'loan-create-pin';
  return (
    <View style={[s.content, !creating && { paddingTop: 150 }]}>
      <LoanField
        label="INTRODU CODUL PIN"
        name={creating ? 'pin' : 'signPin'}
        values={p.values}
        onChange={p.onChange}
        numeric
        password
        maxLength={6}
        helperText="Asigura-te ca nu vede nimeni PIN-ul"
      />
      {creating && (
        <>
          <LoanField
            label="CONFIRMĂ CODUL PIN"
            name="confirmPin"
            values={p.values}
            onChange={p.onChange}
            numeric
            password
            maxLength={6}
            helperText="Asigura-te ca nu vede nimeni PIN-ul"
          />
          <View style={{ height: 40 }} />
          {['fingerprintLogin', 'fingerprintPayment'].map((key, index) => (
            <View key={key} style={s.row}>
              <Text style={[s.label, s.grow, { fontSize: 16, lineHeight: 20 }]}>
                {index === 0
                  ? 'ACTIVAȚI FINGERPRINT PENTRU AUTENTIFICARE'
                  : 'FINGERPRINT PENTRU CONFIRMAREA PLĂȚII'}
              </Text>
              <ToggleButton
                checked={!!p.checks[key]}
                onToggle={() => p.onCheck(key, !p.checks[key])}
                ariaLabel={
                  index === 0
                    ? 'Fingerprint pentru autentificare'
                    : 'Fingerprint pentru confirmarea plății'
                }
              />
            </View>
          ))}
        </>
      )}
    </View>
  );
}
export function CashLoanContract(p: CashLoanPageProps) {
  return (
    <View style={s.content}>
      <LoanCopy>
        Pentru a finaliza cererea, te rugăm să deschizi documentele contractuale
        și apoi să le semnezi cu semnătura electronică.
      </LoanCopy>
      <LoanSelect
        label="Modalitatea de plata a ratei"
        name="loanPaymentMethod"
        values={p.values}
        onChange={p.onChange}
        options={['Debit direct', 'MANDAT DE DEBITARE AUTOMATĂ']}
      />
      <View style={s.group}>
        <Text style={s.label}>CONTRACTUL ESTE VALABIL PÂNĂ ÎN DATA DE</Text>
        <LoanCopy small>15 februarie 2025</LoanCopy>
      </View>
      <OnboardingSectionDivider title="CONTRACT DE CREDIT" />
      {[
        [
          'loanIsne',
          'ISNE',
          'Cererea de contract împreună cu restul documentelor necesare acordării creditului',
        ],
        [
          'loanContract',
          'CONTRACT',
          'Cererea de contract împreună cu restul documentelor necesare acordării creditului',
        ],
        [
          'accountContract',
          'DOCUMENTAȚIE CONTRACTUALĂ',
          'Cererea de contract împreună cu restul documentelor necesare deschiderii contului curent',
        ],
      ].map(([key, title, description]) => (
        <View key={key}>
          {key === 'accountContract' && (
            <OnboardingSectionDivider title="CONTRACT DE DESCHIDERE CONT CURENT" />
          )}
          <View style={s.row}>
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: sourceColor(
                  p.checks[key]
                    ? 'var(--uc-green-olive)'
                    : 'var(--uc-status-red)',
                ),
              }}
            />
            <View style={s.grow}>
              <BaselineNavigationRow
                title={title}
                description={description}
                titleStyle={s.label}
                descriptionStyle={s.small}
                descriptionLines={null}
                style={{ height: 'auto', minHeight: 100, paddingVertical: 16 }}
                rowHeight={80}
                trailingAccessory="chevron"
                onPress={() => p.onDocument(title, key)}
              />
            </View>
          </View>
        </View>
      ))}
      <View style={s.row}>
        <BaselineCheckbox
          presentation="canonical"
          checked={!!p.checks.loanStudyPeriod}
          ariaLabel="ACORD INFORMARE PREALABILĂ"
          onCheckedChange={() => {
            if (
              !['loanIsne', 'loanContract', 'accountContract'].every(
                key => p.checks[key],
              )
            )
              p.onChange('loanContractWarning', 'true');
            else {
              p.onCheck('loanStudyPeriod', !p.checks.loanStudyPeriod);
              p.onChange('loanContractWarning', '');
            }
          }}
        />
        <View style={s.grow}>
          <Text style={s.label}>ACORD INFORMARE PREALABILĂ</Text>
          <LoanCopy small>
            Sunt de acord cu reducerea termenului legal de 15 zile privind
            informarea prealabilă.
          </LoanCopy>
        </View>
      </View>
      {p.values.loanContractWarning === 'true' && (
        <Text
          accessibilityRole="alert"
          style={[s.small, { color: sourceColor('var(--uc-status-red)') }]}
        >
          Este necesar să deschizi mai întâi documentația contractuală.
        </Text>
      )}
    </View>
  );
}
