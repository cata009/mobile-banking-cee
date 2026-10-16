import React, { createContext, useContext } from 'react';
import type { CurrentScreenProps } from '../contracts';
import { getTranslations } from '@/translations';
import type { AppLanguage } from '@/app/registry/languageByCountry';
const Context = createContext<CurrentScreenProps | null>(null);
export function ProfileHost({
  host,
  children,
}: {
  host: CurrentScreenProps;
  children: React.ReactNode;
}) {
  return <Context.Provider value={host}>{children}</Context.Provider>;
}
export function useProfileHost() {
  const host = useContext(Context);
  if (!host) throw new Error('Profile screen requires Current host');
  return host;
}
export function translateProfile(
  host: Pick<CurrentScreenProps, 'country' | 'language'>,
  key: string,
  fallback = key,
  language: AppLanguage = host.language,
): string {
  let value: unknown = getTranslations(host.country, language);
  for (const part of key.split('.')) {
    if (
      !value ||
      typeof value !== 'object' ||
      !Object.prototype.hasOwnProperty.call(value, part)
    )
      return fallback;
    value = (value as Record<string, unknown>)[part];
  }
  return typeof value === 'string' ? value : fallback;
}
export function useProfileTranslation() {
  const host = useProfileHost();
  return (key: string, fallback?: string) =>
    translateProfile(host, key, fallback);
}
export function useProfileTokens() {
  return useProfileHost().tokens;
}
