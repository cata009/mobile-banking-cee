import React, { useState } from 'react';
import { View } from 'react-native';
import photo from '@/assets/pi/ro/cash-loan/introduction.png';
import { RasterImage } from '../offers/RasterImage';
import { BaselineNavigationRow } from '../../../../../universal/BaselineNavigationRow';
import { PrimaryButton } from '../../../../../universal/PrimaryButton';
import { verifyRecommendation } from '@/features/ro-onboarding/referral';
import { OnboardingSheet } from './OnboardingSheet';
import {
  LoanCopy,
  LoanLink,
  LoanAgreement,
  LoanField,
  loanStyles as s,
  type CashLoanPageProps,
} from './CashLoanCommon';
const INTRO_ROWS = [
  [
    'CREDIT CU UTILIZARE FACILA',
    'Prin contul curent UniCredit Bank cu cardul de debit si/sau prin Mobile Banking cu reduceri de dobanda daca iti virezi venitul in cont si/sau achizitionezi o asigurare de viata.',
  ],
  ['PASII PE CARE II VEI URMA', 'Simplu, 100% online fara drumuri la banca'],
  [
    'CONDITII DE ELIGIBILITATE',
    'Afla daca acesta este procesul potrivit pentru tine',
  ],
  ['DESPRE NOI', 'Prezentare UniCredit Consumer Financing si UniCredit Bank'],
] as const;
export function CashLoanIntroduction(p: CashLoanPageProps) {
  const [referral, setReferral] = useState(false);
  const [invalid, setInvalid] = useState(false);
  return (
    <View style={s.content}>
      <LoanCopy>
        Aplica pentru un credit oferit de UniCredit Consumer Financing de pana
        la 150.000 lei și transformă-ți visurile în realitate!
      </LoanCopy>
      <RasterImage
        source={{ uri: photo }}
        accessibilityLabel="Creditul 100% online"
        style={{ width: '100%', height: 145, borderRadius: 4 }}
        resizeMode="cover"
      />
      {INTRO_ROWS.map(([title, description]) => (
        <BaselineNavigationRow
          key={title}
          title={title}
          description={description}
          titleStyle={{ ...s.label, fontSize: 16 }}
          descriptionStyle={s.small}
          descriptionLines={null}
          trailingAccessory="chevron"
          rowHeight={80}
          style={{
            marginHorizontal: -24,
            height: 'auto',
            minHeight: 80,
            paddingVertical: 16,
          }}
          onPress={() => p.onDocument(title)}
        />
      ))}
      <View style={{ ...s.mutedBox, padding: 0 }}>
        <BaselineNavigationRow
          title="AM COD DE RECOMANDARE"
          description={
            p.checks.loanReferral
              ? p.values.friendCode && p.values.branchCode
                ? 'Codurile primite de la prieten si sucursala introduse'
                : p.values.friendCode
                  ? 'Codul primit de la prieten introdus'
                  : 'Codul primit de la sucursala introdus'
              : undefined
          }
          trailingAccessory="chevron"
          onPress={() => setReferral(true)}
        />
      </View>
      {[
        'NOTĂ DE INFORMARE PRELUCRAREA DATELOR UNICREDIT BANK',
        'NOTĂ DE INFORMARE PRELUCRAREA DATELOR UNICREDIT CONSUMER FINANCING IFN S.A.',
        'NOTĂ DE INFORMARE PRELUCRAREA DATELOR TRANS SPED SRL',
      ].map(title => (
        <LoanLink
          key={title}
          title={title}
          onPress={() => p.onDocument(title)}
        />
      ))}
      <LoanAgreement
        hideTitle
        title="Am citit si am inteles anterior si integral documentele de mai sus"
        checked={!!p.checks.loanPrivacy}
        onToggle={() => p.onCheck('loanPrivacy', !p.checks.loanPrivacy)}
      >
        Am citit si am inteles anterior si integral documentele de mai sus
      </LoanAgreement>
      {referral && (
        <OnboardingSheet
          title="Am un cod de recomandare"
          onClose={() => setReferral(false)}
          footer={
            <PrimaryButton
              label="Confirm"
              disabled={!p.values.friendCode && !p.values.branchCode}
              onPress={() => {
                if (
                  [p.values.friendCode, p.values.branchCode]
                    .filter(Boolean)
                    .every(verifyRecommendation)
                ) {
                  p.onCheck('loanReferral', true);
                  setReferral(false);
                  setInvalid(false);
                } else setInvalid(true);
              }}
            />
          }
        >
          <View style={s.content}>
            <LoanCopy>
              Dacă ai primit un cod de recomandare de la un prieten sau ai fost
              asistat de un angajat din sucursala poți introduce mai jos ambele
              coduri sau unul dintre cele primite.
            </LoanCopy>
            <LoanField
              label="Codul primit de la un prieten"
              name="friendCode"
              values={p.values}
              onChange={p.onChange}
              numeric
              maxLength={20}
            />
            <LoanField
              label="Codul primit de la sucursală"
              name="branchCode"
              values={p.values}
              onChange={p.onChange}
              numeric
              maxLength={20}
            />
            {invalid && (
              <LoanCopy>Codul este invalid, te rugăm să reîncerci</LoanCopy>
            )}
          </View>
        </OnboardingSheet>
      )}
    </View>
  );
}
