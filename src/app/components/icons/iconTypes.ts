/**
 * Shape of an entry in the app icon registry.
 *
 * Extracted from AppIcon.tsx so the icon data modules and the component can
 * share one definition without importing each other.
 */
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export type IconCategory =
  | "Header"
  | "Navigation"
  | "Payments"
  | "Accounts"
  | "Contacts"
  | "Prime"
  | "Actions"
  | "System"
  | "External Lucide";

export type BaseIconDefinition = {
  label: string;
  category: IconCategory;
  usage: string[];
  notes?: string;
};

export type CustomIconDefinition = BaseIconDefinition & {
  source: "custom";
  viewBox: string;
  width: number;
  height: number;
  render: () => ReactNode;
};

export type LucideIconDefinition = BaseIconDefinition & {
  source: "lucide";
  component: LucideIcon;
  width: number;
  height: number;
  strokeWidth?: number;
};

export type IconDefinition = CustomIconDefinition | LucideIconDefinition;
