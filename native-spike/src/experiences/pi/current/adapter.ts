import React from 'react';
import type { CurrentAdapter, CurrentScreenProps } from './contracts';
import { currentFeature } from './context';
import RoboHome from './RoboHome';
import Home from './Home';
import Products, { currentProductSearch } from './products/Products';
import Detail from './products/Detail';
import RoProducts from './baseline/offers/Products';
import RoProductDetail from './baseline/offers/Detail';
import GeniusProtectFlow from './baseline/offers/GeniusProtectFlow';
import GeniusProtectPolicyDetails from './baseline/offers/GeniusProtectPolicyDetails';
import { isPiClassicCompositionContext } from './baseline/policy';
import Pfm from './analytics/Pfm';
import Investments, {
  currentInvestmentSearch,
} from './investments/Investments';

function ProductDetailScreen(props: CurrentScreenProps) {
  if (!isPiClassicCompositionContext(props))
    return React.createElement(Detail, props);
  if (
    props.country === 'RO' &&
    props.route.params?.optionId === 'genius-protect-policy'
  )
    return React.createElement(GeniusProtectPolicyDetails, props);
  if (
    props.country === 'RO' &&
    props.route.params?.optionId === 'genius-protect'
  )
    return React.createElement(GeniusProtectFlow, props);
  return React.createElement(RoProductDetail, props);
}
export const CURRENT_HOME_ADAPTER: CurrentAdapter = {
  id: 'pi-current-home-products-pfm-investments',
  screens: {
    home: (props: CurrentScreenProps) =>
      React.createElement(
        currentFeature(props, 'fx_czRoboAdvisor') ? RoboHome : Home,
        props,
      ),
    products: (props: CurrentScreenProps) =>
      React.createElement(
        isPiClassicCompositionContext(props) ? RoProducts : Products,
        props,
      ),
    'product-detail': ProductDetailScreen,
    pfm: Pfm,
    investments: Investments,
  },
  searchEntries: context => [
    {
      id: 'current-home',
      label: 'Home',
      keywords: ['balance', 'accounts'],
      target: { screen: 'home' },
    },
    {
      id: 'current-pfm',
      label: 'Spending',
      keywords: ['analytics', 'income', 'expenses', 'categories'],
      target: { screen: 'pfm' },
    },
    ...currentProductSearch(context),
    ...currentInvestmentSearch(context),
  ],
};
