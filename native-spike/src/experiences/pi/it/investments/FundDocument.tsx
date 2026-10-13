import React from 'react';
import { Text } from '../../../../universal/Typography';
import type { InvestmentFund } from '@/features/investments/mobileFirstFunds';
import type { ItalyNativeScreenProps } from '../contracts';
import { Button, Money, Rows, s } from './Primitives';
import { InvestmentSheet } from './OverviewExtras';
export default function FundDocument({
  title,
  fund,
  props,
  onClose,
}: {
  title: string;
  fund: InvestmentFund;
  props: ItalyNativeScreenProps;
  onClose: () => void;
}) {
  return (
    <InvestmentSheet
      title={title}
      visible={!!title && props.isActive !== false}
      onClose={onClose}
      props={props}
      footer={<Button label="Ho preso visione" onPress={onClose} />}
    >
      <Text style={s.heading}>{fund.name}</Text>
      <Rows
        rows={[
          { label: 'ISIN', value: fund.isin },
          { label: 'Società prodotto', value: fund.manager },
          { label: 'Categoria', value: fund.category },
          { label: 'Divisa', value: 'EUR' },
          {
            label: 'Ultimo NAV',
            value: (
              <Money
                cents={fund.nav * 100}
                decimals={4}
                hidden={props.amountsHidden}
              />
            ),
          },
        ]}
      />
      <Text style={s.body}>
        Prima di procedere, verifica le caratteristiche del fondo, i costi e gli
        oneri e le dichiarazioni relative all’operazione.
      </Text>
      <Text style={s.body}>
        Il valore delle quote può variare. Consulta il KID e le norme del
        servizio relative al fondo selezionato.
      </Text>
    </InvestmentSheet>
  );
}
