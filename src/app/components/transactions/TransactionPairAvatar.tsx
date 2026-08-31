import { AppIcon } from "@/app/components/icons";
import { CurrencyFlagRoundel } from "@/app/components/payments/CurrencyFlag";
import type { TransactionEndpoint, TransactionTransferPair } from "@/data/accountDetails";
import type { Currency } from "@/data/products";

const ENDPOINT_ICON = {
  current: "accounts-coins",
  savings: "piggy-bank",
  deposit: "piggy-bank",
} as const;

const ENDPOINT_STYLE = {
  current: { background: "var(--uc-action-soft)", color: "var(--uc-action)" },
  savings: { background: "#007A91", color: "var(--uc-static-white)" },
  deposit: { background: "#52666D", color: "var(--uc-static-white)" },
} as const;

const ENDPOINT_LABEL = {
  current: "current account",
  savings: "savings account",
  deposit: "term deposit",
} as const;

function endpointLabel(endpoint: TransactionEndpoint) {
  return endpoint.kind === "currency" ? endpoint.currency : ENDPOINT_LABEL[endpoint.account];
}

function EndpointRoundel({ endpoint, size, currency }: { endpoint: TransactionEndpoint; size: number; currency?: Currency }) {
  if (endpoint.kind === "currency") {
    return <CurrencyFlagRoundel currency={endpoint.currency} size={size} />;
  }

  if (endpoint.account === "current" && currency) {
    return (
      <span data-transaction-pair-endpoint="current">
        <CurrencyFlagRoundel currency={currency} size={size} />
      </span>
    );
  }

  const style = ENDPOINT_STYLE[endpoint.account];

  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full ${endpoint.account === "savings" ? "bg-[#007A91] text-[var(--uc-static-white)]" : endpoint.account === "deposit" ? "bg-[#52666D] text-[var(--uc-static-white)]" : "bg-[var(--uc-action-soft)] text-[var(--uc-action)]"}`}
      data-transaction-pair-endpoint={endpoint.account}
      style={{ width: size, height: size, backgroundColor: style.background, color: style.color }}
    >
      <AppIcon name={ENDPOINT_ICON[endpoint.account]} size={Math.round(size * 0.58)} color="var(--uc-static-white)" aria-hidden="true" />
    </span>
  );
}

/**
 * The mark for a transfer that has two sides of the customer's own money: an
 * own-account transfer or a currency exchange. The payer sits behind and the
 * destination sits in front, so the direction of the move is readable before
 * the label is.
 */
export default function TransactionPairAvatar({
  pair,
  size = 32,
  currency,
}: {
  pair: TransactionTransferPair;
  size?: number;
  currency?: Currency;
}) {
  // Two discs at ~68% of the box, offset so each stays legible while the
  // overlap makes them read as one mark rather than two icons.
  const discSize = Math.round(size * 0.68);
  const offset = size - discSize;

  return (
    <span
      aria-label={`${endpointLabel(pair.from)} to ${endpointLabel(pair.to)}`}
      className="relative inline-flex shrink-0"
      data-transaction-pair="true"
      role="img"
      style={{ width: size, height: size }}
    >
      <span className="absolute inline-flex leading-none left-0 top-0">
        <EndpointRoundel endpoint={pair.from} size={discSize} currency={currency} />
      </span>
      {/*
        inline-flex and leading-none, not a bare span: an inline child inside a
        block wrapper builds a line box with half-leading above and below it, so
        the ring was drawn around a taller rectangle than the disc and showed as
        a stroke that did not follow the circle.
      */}
      <span
        className="absolute inline-flex rounded-full leading-none shadow-[0_0_0_2px_var(--uc-surface)]"
        style={{ left: offset, top: offset }}
      >
        <EndpointRoundel endpoint={pair.to} size={discSize} currency={currency} />
      </span>
    </span>
  );
}
