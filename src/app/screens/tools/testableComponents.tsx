/**
 * Registry of design-system components the Component translation tester can
 * stress with copy. Every entry reuses the real shared component — nothing is
 * re-implemented here — and declares which text slots can be overridden.
 */

import type { ReactNode } from "react";
import PrimaryButton from "@/app/components/PrimaryButton";
import PageHeader from "@/app/components/PageHeader";
import NavigationRow from "@/app/components/NavigationRow";
import TextField from "@/app/components/TextField";
import InfoBanner from "@/app/components/cards/InfoBanner";
import GhostBanner from "@/app/components/cards/GhostBanner";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";

/**
 * How the specimen sits inside the 375px phone width:
 * - "screen": full-bleed element (e.g. PageHeader)
 * - "card":   element that lives inside a surface card with 16px page inset
 * - "plain":  element placed directly on the app background with 16px inset
 */
export type SpecimenContainer = "screen" | "card" | "plain";

export interface TestableSlot {
  id: string;
  label: string;
  defaultText: string;
}

export interface TestableComponentMeta {
  id: string;
  label: string;
  description: string;
  container: SpecimenContainer;
  slots: readonly TestableSlot[];
  render: (texts: Record<string, string>) => ReactNode;
}

const noop = () => {};

export const TESTABLE_COMPONENTS: readonly TestableComponentMeta[] = [
  {
    id: "page-header",
    label: "PageHeader",
    description: "Screen title bar with back action",
    container: "screen",
    slots: [{ id: "title", label: "Title", defaultText: "Account details" }],
    render: (texts) => <PageHeader title={texts.title ?? ""} onBack={noop} includeSafeArea={false} />,
  },
  {
    id: "primary-button",
    label: "PrimaryButton",
    description: "Main call-to-action button",
    container: "plain",
    slots: [{ id: "label", label: "Label", defaultText: "Continue" }],
    render: (texts) => <PrimaryButton onClick={noop}>{texts.label ?? ""}</PrimaryButton>,
  },
  {
    id: "navigation-row",
    label: "NavigationRow",
    description: "List row with title, description and chevron",
    container: "card",
    slots: [
      { id: "title", label: "Title", defaultText: "Account settings" },
      { id: "description", label: "Description", defaultText: "Manage limits, cards and security" },
    ],
    render: (texts) => (
      <NavigationRow title={texts.title ?? ""} description={texts.description || undefined} onClick={noop} />
    ),
  },
  {
    id: "text-field",
    label: "TextField",
    description: "Design-system line input with floating label",
    container: "card",
    slots: [
      { id: "label", label: "Label", defaultText: "Account name" },
      { id: "value", label: "Value", defaultText: "Main current account" },
    ],
    render: (texts) => <TextField label={texts.label ?? ""} value={texts.value ?? ""} onChange={noop} />,
  },
  {
    id: "info-banner",
    label: "InfoBanner",
    description: "Informational banner with icon, title and body",
    container: "plain",
    slots: [
      { id: "title", label: "Title", defaultText: "Scheduled maintenance" },
      {
        id: "description",
        label: "Description",
        defaultText: "Payments will be unavailable on Sunday between 02:00 and 04:00.",
      },
    ],
    render: (texts) => <InfoBanner title={texts.title ?? ""} description={texts.description || undefined} />,
  },
  {
    id: "ghost-banner",
    label: "GhostBanner",
    description: "Dashed-border CTA banner",
    container: "plain",
    slots: [
      { id: "title", label: "Title", defaultText: "Add a new product" },
      {
        id: "description",
        label: "Description",
        defaultText: "Open a savings account or explore investment funds.",
      },
    ],
    render: (texts) => <GhostBanner title={texts.title ?? ""} description={texts.description || undefined} onClick={noop} />,
  },
  {
    id: "section-heading",
    label: "SectionHeadingDivider",
    description: "Section heading with secondary text",
    container: "card",
    slots: [
      { id: "title", label: "Title", defaultText: "Transactions" },
      { id: "secondaryText", label: "Secondary text", defaultText: "July 2026" },
    ],
    render: (texts) => (
      <SectionHeadingDivider title={texts.title ?? ""} secondaryText={texts.secondaryText || undefined} />
    ),
  },
];
