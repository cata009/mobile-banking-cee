import { useState } from "react";
import type { UIEvent } from "react";
import PageHeader from "@/app/components/PageHeader";
import CopyToast from "@/app/components/accounts/CopyToast";
import { AppIcon } from "@/app/components/icons";
import { useProducts } from "@/hooks/useProducts";
import { useCopyToClipboard } from "@/app/utils/useCopyToClipboard";
import type { CreditCard, DebitCard, Product } from "@/data/products";

interface CardDetailsInfoScreenProps {
  selectedCardId?: string | null;
  onBack: () => void;
}

function isCardProduct(product: Product): product is DebitCard | CreditCard {
  return product.type === "debit_card" || product.type === "credit_card";
}

function CardDetailsField({
  label,
  value,
  onCopy,
}: {
  label: string;
  value: string;
  onCopy?: () => void;
}) {
  return (
    <div className="grid min-h-[74px] w-full grid-cols-[minmax(0,1fr)_40px] items-center gap-[16px] py-[16px]">
      <div className="min-w-0">
        <p className="uc-type-n4 text-[16px] leading-[20px] text-[var(--uc-text)]">{label}</p>
        <p className="uc-type-n4-strong mt-[4px] break-all text-[18px] leading-[22px] text-[var(--uc-text)]">{value}</p>
      </div>
      {onCopy ? (
        <button
          aria-label="Copy card number"
          className="flex h-[40px] w-[40px] items-center justify-center"
          onClick={onCopy}
          type="button"
        >
          <AppIcon name="copy-documents" color="var(--uc-text)" size={24} />
        </button>
      ) : (
        <span aria-hidden="true" />
      )}
    </div>
  );
}

export default function CardDetailsInfoScreen({ selectedCardId, onBack }: CardDetailsInfoScreenProps) {
  const { categories } = useProducts();
  const [headerProgress, setHeaderProgress] = useState(0);
  const cards = categories.flatMap((category) => category.products).filter(isCardProduct);
  const card = cards.find((candidate) => candidate.id === selectedCardId) ?? cards[0];
  const { toast: copyToast, copy: copyToClipboard } = useCopyToClipboard();

  const handlePageScroll = (event: UIEvent<HTMLDivElement>) => {
    setHeaderProgress(Math.min(1, Math.max(0, event.currentTarget.scrollTop / 64)));
  };

  if (!card) {
    return <div className="h-full w-full bg-[var(--uc-surface)]" />;
  }

  const cardHolderName = card.cardHolderName ?? "PETER JAGODIĆ";
  const securityCode = card.securityCode ?? "990";

  return (
    <div className="h-full w-full overflow-y-auto bg-[var(--uc-surface)] scrollbar-hide" onScroll={handlePageScroll}>
      <PageHeader
        title="Card details"
        onBack={onBack}
        collapsedTitleProgress={headerProgress}
        includeSafeArea
      />

      <div className="px-[24px] pb-[40px] pt-[10px]">
        <CardDetailsField label="Card number" value={card.cardNumber} onCopy={() => copyToClipboard(card.cardNumber, "Card number")} />
        <CardDetailsField label="Card CVV2/CVC2" value={securityCode} />
        <CardDetailsField label="Card holder" value={cardHolderName} />
        <CardDetailsField label="Card validity" value={card.expiryDate} />
      </div>
      <CopyToast toast={copyToast} />
    </div>
  );
}
