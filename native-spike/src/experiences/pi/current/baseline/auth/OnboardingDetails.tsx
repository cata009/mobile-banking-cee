import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BaselineNavigationRow } from '../../../../../universal/BaselineNavigationRow';
import { OnboardingSectionDivider as BaselineSectionDivider } from './OnboardingSectionDivider';
import { Text } from '../../../../../universal/Typography';
import { sourceColor } from '../../../../../universal/sourceColor';

const QUESTIONS = [
  [
    'Cand pot aplica si de ce documente am nevoiepentru a deschide un cont UniCredit Bank online?',
    'You can apply at any time but you need the original Romanian ID card.',
  ],
  [
    'Do I need to come to the Bank?',
    'You do not need to come to the Bank to open an account or to take possession of the card. Nor for performing current operations if you use our digital applications Mobile and Onine Banking. See more information here',
  ],
  ['How to activate Mobile banking?', ''],
  ['How do I find the IBAN code?', ''],
  ['How can I purchase other products and services later?', ''],
  ['Can I change my mind after signing the contract?', ''],
];
const PRODUCTS = [
  [
    'Cont curent in LEI',
    'Ai ZERO comision * pentru:\n\n• Administration of a current account in Lei;\n• Payments in Lei to any bank in Romania through Mobile and Online Banking (including by Scheduled Payment Order);\n• Incomings & Direct debit interbank payments in Lei.;\n\n*Benefit applicable only if you meet the eligibility conditions of the GeniusCont Classic offer. Full details in the Annex. For other services/products/offers, we invite you to any UniCredit Bank branch.',
  ],
  ['Cont curent in EUR', ''],
  ['Card de debit Mastercard Standard', ''],
  ['Servicii Bancare', ''],
];
export function OnboardingDetails({
  products = false,
  cashLoan = false,
  expandedSource = false,
}: {
  products?: boolean;
  cashLoan?: boolean;
  expandedSource?: boolean;
}) {
  const [expanded, setExpanded] = useState<number[]>(
    expandedSource ? [0, 1] : products ? [0] : [],
  );
  const productRows = cashLoan
    ? [
        [
          'Cont curent în Lei',
          'Nu ai niciun comision de administrare* pentru:\n\n• Administrarea unui cont curent în Lei;\n• Plăți în Lei către orice bancă din România prin Mobile și Online Banking (inclusiv prin Ordin de Plată Programat);\n• Încasări și plăți interbancare prin debit direct în Lei.\n\n*Beneficiul este aplicabil doar dacă îndeplinești condițiile de eligibilitate ale ofertei GeniusCont Classic. Detalii complete în Anexă. Pentru alte servicii/produsuri/oferte, te invităm la orice sucursală UniCredit Bank.',
        ],
        ['Cont curent în EUR', ''],
        ['Card de debit', ''],
        ['Mobile Banking', ''],
      ]
    : PRODUCTS;
  return (
    <View style={s.content}>
      {!products && (
        <>
          <BaselineSectionDivider
            title={
              expandedSource ? 'ADDITIONAL REQUIREMENTS' : 'CE TREBUIE SA STII'
            }
            width={327}
          />
          <Text style={s.body}>
            {expandedSource ? (
              '• You do not have the authorized person status, legally represented in relation to a private individual or legal person with an account opened at Unicredit.\n\n• You agree that Trans Sped SA will issue you a qualified electronic certificate free of charge, remotely, to complete the online purchase process.'
            ) : (
              <>
                {' '}
                Nu poti deschide un cont 100% online daca esti imputernicit in
                relatie cu orice cont de client UniCredit Bank (persoana fizica
                sau juridica). Pentru a-ti deschide contul, va trebui sa semnezi
                cu certificat electronic calificat care va fi eliberat de catre
                Trans Sped SA, gratuit.{'\n\n'}Esti de acord ca Trans Sped SA sa
                iti elibereze gratuit un certificat electronic calficicat, de la
                distanta, pentru a finaliza procesul de achizitie online.
              </>
            )}
          </Text>
          <BaselineSectionDivider title="INTREBARI SI RASPUNSURI" width={327} />
        </>
      )}
      <View>
        {(products ? productRows : QUESTIONS).map(([title, body], index) => (
          <View key={title} style={s.item}>
            <BaselineNavigationRow
              title={title}
              titleLines={null}
              trailingAccessory="chevron"
              chevronIconName={
                expanded.includes(index) ? 'chevron-up' : 'chevron-down'
              }
              titleStyle={s.question}
              rowHeight={64}
              style={s.flush}
              onPress={() =>
                setExpanded(current =>
                  current.includes(index)
                    ? current.filter(i => i !== index)
                    : [...current, index],
                )
              }
            />
            {expanded.includes(index) && !!body && (
              <Text style={[s.body, s.answer]}>{body}</Text>
            )}
          </View>
        ))}
      </View>
      {products && (
        <Text style={s.body}>
          Nota: Pentru produse suplimentare sau servicii personalizate dedicate
          Private Banking, va invitam in orice sucursala UniCredit Bank, pentru
          o discutie cu unul dintre consultatii nostri.
        </Text>
      )}
    </View>
  );
}
const s = StyleSheet.create({
  content: { gap: 24 },
  body: {
    fontFamily: 'UniCredit-regular',
    fontSize: 18,
    lineHeight: 24,
    color: sourceColor('var(--uc-text)'),
  },
  item: {
    borderBottomWidth: 1,
    borderColor: sourceColor('var(--uc-border-muted)'),
  },
  flush: {
    paddingHorizontal: 0,
    height: 'auto',
    minHeight: 64,
    paddingVertical: 16,
  },
  question: { fontSize: 18, lineHeight: 24 },
  answer: { paddingBottom: 24 },
});
