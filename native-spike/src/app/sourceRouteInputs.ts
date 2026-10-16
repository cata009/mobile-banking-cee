import { ROUTE_POLICY } from '@/app/navigation/routePolicy';
import type { CurrentRoute } from '../experiences/pi/current/contracts';
import type { CzechNativeRoute } from '../experiences/pi/cz/evo-2027/contracts';

const sourceRoutes:Record<string,string>={
 homepage:'home',analytics:'pfm',more:'profile',prime:'prime',
 'prelogin-active':'prelogin','prelogin-inactive':'prelogin','language-selector':'language',
 'co-apping-session':'coapping','account-detail':'account','account-details-info':'account-info',
 'card-detail':'card','card-details-info':'card-info','transaction-detail':'transaction',
 'request-call':'call-request','future-gain-peer-insights':'peer-insights',
 'investments-history':'investment-history','investment-orders-to-approve':'investments',
};
/** Restore actual Source share-link route names and entity payloads; explicit native debug routes remain available for paired QA. */
export function readSourceNativeRoute(query:URLSearchParams,implementation:string|null):CurrentRoute|CzechNativeRoute{
 let screen=query.get('screen')??'homepage';
 const policy=Object.prototype.hasOwnProperty.call(ROUTE_POLICY,screen)?ROUTE_POLICY[screen as keyof typeof ROUTE_POLICY]:undefined;
 if(policy){
  if(policy.deepLink.payload==='card'&&!query.get('card'))screen='homepage';
  else if(!policy.deepLink.restorable)screen=(query.get('card')&&'fallbackWithCard'in policy.deepLink?policy.deepLink.fallbackWithCard:undefined)??policy.deepLink.fallback;
 }
 screen=sourceRoutes[screen]??screen;
 const params:Record<string,string>=Object.fromEntries([...query.entries()].filter(([key])=>key.startsWith('param_')).map(([key,value])=>[key.slice(6),value]));
 const account=query.get('account'),card=query.get('card');
 if(account){params.accountId=account;params.productId=account;}
 if(card){params.cardId=card;params.productId=card;}
 if(implementation==='current'&&screen==='investment-history'){screen='investments';params.view='history';}
 return {screen:screen as CurrentRoute['screen'],...(Object.keys(params).length?{params}:{})};
}
