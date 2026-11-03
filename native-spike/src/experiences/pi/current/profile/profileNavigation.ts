import type { CurrentRoute } from '../contracts';

export function getProfileIconRoute(country: string): CurrentRoute {
  return country === 'RO'
    ? { screen: 'profile', params: { area: 'my-data' } }
    : { screen: 'profile' };
}
