import type { CountryId } from "@/app/state/demoTypes";

export type DocumentListItem = {
  id: string;
  day: string;
  month: string;
  title: string;
  description: string;
  badge?: string;
  isLegal?: boolean;
};

export type DocumentsYearGroup = {
  year: string;
  items: readonly DocumentListItem[];
};

export type DocumentsConfig = {
  title: string;
  groups: readonly DocumentsYearGroup[];
};

const MONTH_ORDER: Record<string, number> = {
  JAN: 1,
  FEB: 2,
  MAR: 3,
  APR: 4,
  MAY: 5,
  JUN: 6,
  JUL: 7,
  AUG: 8,
  SEP: 9,
  OCT: 10,
  NOV: 11,
  DEC: 12,
};

const SHARED_DOCUMENTS_CONFIG: DocumentsConfig = {
  title: "Documents",
  groups: [
    {
      year: "2025",
      items: [
        { id: "documents-2025-12-12", day: "12", month: "DEC", title: "LEONARDO OLIVEIRA", description: "Salary transfer advice" },
        { id: "documents-2025-11-24", day: "24", month: "NOV", title: "AFAMEFUNA OKPARO", description: "Transfer confirmation" },
        { id: "documents-2025-10-16", day: "16", month: "OCT", title: "KWAK SEONG-MIN", description: "Incoming payment notice", isLegal: true },
        { id: "documents-2025-09-08", day: "8", month: "SEP", title: "MALIN QUIST", description: "Standing order statement" },
        { id: "documents-2025-08-21", day: "21", month: "AUG", title: "ARINA BELOMESTNYKH", description: "Account confirmation", isLegal: true },
      ],
    },
    {
      year: "2026",
      items: [
        { id: "documents-2026-06-03", day: "3", month: "JUN", title: "ARINA BELOMESTNYKH", description: "Tax payment receipt", badge: "NEW" },
        { id: "documents-2026-05-28", day: "28", month: "MAY", title: "ARINA BELOMESTNYKH", description: "Loan schedule update", isLegal: true },
        { id: "documents-2026-04-17", day: "17", month: "APR", title: "NINA PETROVA", description: "Account confirmation" },
      ],
    },
  ],
};

export const DOCUMENTS_CONFIG_BY_COUNTRY: Record<CountryId, DocumentsConfig> = {
  RO: SHARED_DOCUMENTS_CONFIG,
  RS: SHARED_DOCUMENTS_CONFIG,
  HU: SHARED_DOCUMENTS_CONFIG,
  BA: SHARED_DOCUMENTS_CONFIG,
  BA_BL: SHARED_DOCUMENTS_CONFIG,
  SK: SHARED_DOCUMENTS_CONFIG,
  SI: SHARED_DOCUMENTS_CONFIG,
  CZ: SHARED_DOCUMENTS_CONFIG,
};

function getDocumentSortValue(group: DocumentsYearGroup, item: DocumentListItem) {
  const year = Number(group.year);
  const month = MONTH_ORDER[item.month.toUpperCase()] ?? 0;
  const day = Number(item.day);

  return (
    (Number.isFinite(year) ? year : 0) * 10000 +
    month * 100 +
    (Number.isFinite(day) ? day : 0)
  );
}

function sortDocumentsConfig(config: DocumentsConfig): DocumentsConfig {
  return {
    ...config,
    groups: [...config.groups]
      .map((group) => ({
        ...group,
        items: [...group.items].sort((left, right) => (
          getDocumentSortValue(group, right) - getDocumentSortValue(group, left)
        )),
      }))
      .sort((left, right) => (
        Math.max(...right.items.map((item) => getDocumentSortValue(right, item)), 0) -
        Math.max(...left.items.map((item) => getDocumentSortValue(left, item)), 0)
      )),
  };
}

export function getDocumentsConfigForCountry(country: CountryId): DocumentsConfig {
  return sortDocumentsConfig(DOCUMENTS_CONFIG_BY_COUNTRY[country]);
}

export function getDocumentsCountForCountry(country: CountryId): number {
  const config = getDocumentsConfigForCountry(country);

  return config.groups.reduce((total, group) => total + group.items.length, 0);
}
