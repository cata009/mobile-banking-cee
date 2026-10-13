import type { StorageAdapter } from '../../../native-spike/node_modules/@hot-updater/plugin-core';
export const checkout: string;
export const proofRoot: string;
export function localObjectPath(key: string): string;
export function localOtaStorage(baseURL?: string): StorageAdapter;
