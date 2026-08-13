import type { ProductCardAction } from "@/app/components/ProductCard";
import { AppIcon, type IconName } from "@/app/components/icons";

interface FutureCzAccountCardActionDefinition {
  id: "new-payment" | "scan-qr" | "create-qr" | "account-info";
  iconName: IconName;
  iconSize: 24;
  label: string;
  ariaLabel: string;
}

export const FUTURE_CZ_ACCOUNT_CARD_ACTIONS: readonly FutureCzAccountCardActionDefinition[] = [
  {
    id: "new-payment",
    iconName: "payment-new",
    iconSize: 24,
    label: "New\npayment",
    ariaLabel: "New payment",
  },
  {
    id: "scan-qr",
    iconName: "payment-scan-qr",
    iconSize: 24,
    label: "Scan QR\ncode",
    ariaLabel: "Scan QR code",
  },
  {
    id: "create-qr",
    iconName: "payment-create-qr",
    iconSize: 24,
    label: "Create QR\ncode",
    ariaLabel: "Create QR code",
  },
  {
    id: "account-info",
    iconName: "account-info",
    iconSize: 24,
    label: "Account\ninfo",
    ariaLabel: "Account info",
  },
] as const;

export function buildFutureCzAccountCardActions({
  onNewPayment,
  onScanQrCode,
  onCreateQrCode,
  onAccountInfo,
}: {
  onNewPayment?: () => void;
  onScanQrCode?: () => void;
  onCreateQrCode?: () => void;
  onAccountInfo?: () => void;
} = {}): readonly ProductCardAction[] {
  return FUTURE_CZ_ACCOUNT_CARD_ACTIONS.map((action) => ({
    id: action.id,
    icon: (
      <AppIcon
        name={action.iconName}
        size={action.iconSize}
        className="text-[var(--uc-text)]"
      />
    ),
    label: action.label,
    ariaLabel: action.ariaLabel,
    onClick:
      action.id === "new-payment"
        ? onNewPayment
        : action.id === "scan-qr"
          ? onScanQrCode
          : action.id === "create-qr"
            ? onCreateQrCode
        : action.id === "account-info"
          ? onAccountInfo
          : undefined,
  }));
}
