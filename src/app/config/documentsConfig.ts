import type { CountryId } from "@/app/state/demoTypes";

export type DocumentListItem = {
  id: string;
  day: string;
  month: string;
  title: string;
  description: string;
  badge?: string;
};

export type DocumentsYearGroup = {
  year: string;
  items: readonly DocumentListItem[];
};

export type DocumentsConfig = {
  title: string;
  groups: readonly DocumentsYearGroup[];
};

const SHARED_DOCUMENTS_CONFIG: DocumentsConfig = {
  title: "Documents",
  groups: [
    {
      year: "2025",
      items: [
        { id: "documents-2025-10-10", day: "10", month: "OCT", title: "LEONARDO OLIVEIRA", description: "Salary transfer advice", badge: "NEW" },
        { id: "documents-2025-10-07", day: "7", month: "OCT", title: "AFAMEFUNA OKPARO", description: "Transfer confirmation", badge: "NEW" },
        { id: "documents-2025-10-05", day: "5", month: "OCT", title: "KWAK SEONG-MIN", description: "Incoming payment notice", badge: "NEW" },
        { id: "documents-2025-10-03", day: "3", month: "OCT", title: "MALIN QUIST", description: "Standing order statement", badge: "NEW" },
        { id: "documents-2025-10-01", day: "1", month: "OCT", title: "ARINA BELOMESTNYKH", description: "Account confirmation", badge: "NEW" },
      ],
    },
    {
      year: "2026",
      items: [
        { id: "documents-2026-10-01-a", day: "1", month: "OCT", title: "ARINA BELOMESTNYKH", description: "Tax payment receipt", badge: "NEW" },
        { id: "documents-2026-10-01-b", day: "1", month: "OCT", title: "ARINA BELOMESTNYKH", description: "Loan schedule update", badge: "NEW" },
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

export function getDocumentsConfigForCountry(country: CountryId): DocumentsConfig {
  return DOCUMENTS_CONFIG_BY_COUNTRY[country];
}

export function getDocumentsCountForCountry(country: CountryId): number {
  const config = getDocumentsConfigForCountry(country);

  return config.groups.reduce((total, group) => total + group.items.length, 0);
}
