/**
 * HU Kids money surfaces on Home and Saving: spending summary, the transaction
 * list and its rows, the cards panel, and the all-money breakdown.
 *
 * Extracted verbatim from KidsMarketHomeApp.tsx (kids-split Phase 3).
 */
import { AppIcon, type IconName } from "@/app/components/icons";
import LinkButton from "@/app/components/ui/LinkButton";
import { cn } from "@/app/components/ui/utils";
import { formatMoneyNumber } from "@/app/registry/countryConfig";
import type { AccountTransaction } from "@/data/accountDetails";
import huCardHomeCatSrc from "@/assets/kids/figma/hu-card-home-cat.png";
import { HU_DEFAULT_KIDS_CARD } from "./cards";
import { HU_KIDS_RUNTIME_COUNTRY, HU_KIDS_TRANSACTIONS } from "./data";
import { HuMerchantLogo, HuMerchantLogoMark } from "./merchantLogos";
import {
  HU_MASKED_DECIMALS,
  HU_MASKED_INTEGER,
  formatHuKidsDecimalAmount,
  formatHuMaskedMoney,
  formatHuMaskedSignedMoney,
  getHuKidsDecimalParts,
  getHuKidsSpendModel,
} from "./money";
import type { HuKidsTransaction } from "./types";

export function HuSavingFocusCard({
  showAmounts,
}: {
  showAmounts: boolean;
}) {
  return (
    <section className="rounded-[16px] bg-[var(--hu-theme-card-bg)] px-[18px] py-[18px] shadow-sm">
      <div className="flex items-start justify-between gap-[14px]">
        <div className="min-w-0">
          <p className="text-[18px] font-bold leading-[22px] tracking-[0] text-[var(--uc-text)]">Saving account</p>
          <p className="mt-[8px] text-[14px] font-normal leading-[18px] tracking-[0] text-[var(--uc-text-muted)]">
            Festival pass and sneakers stay on track.
          </p>
        </div>
        <span className="grid size-[44px] shrink-0 place-items-center rounded-full bg-[var(--hu-theme-control-bg)] text-[var(--hu-theme-accent-strong)]">
          <AppIcon name="piggy-bank" size={23} />
        </span>
      </div>
      <div className="mt-[18px]">
        <p className="text-[13px] font-normal leading-[16px] tracking-[0] text-[var(--uc-text-muted)]">Saved so far</p>
        <p className="mt-[6px] text-[25px] font-bold leading-[29px] tracking-[0] text-[var(--uc-text)]">
          {showAmounts ? "11.824" : HU_MASKED_INTEGER}
          <span className="text-[16px] font-normal leading-[20px]">
            {showAmounts ? ",33 HUF" : `${HU_MASKED_DECIMALS} HUF`}
          </span>
        </p>
      </div>
      <div className="mt-[16px] h-[10px] overflow-hidden rounded-full bg-[var(--hu-theme-progress-bg)]">
        <div className="h-full w-[62%] rounded-full bg-[var(--hu-theme-accent-strong)]" />
      </div>
    </section>
  );
}

export function HuSpendingCard({ showAmounts }: { showAmounts: boolean }) {
  const spendModel = getHuKidsSpendModel();
  const spentParts = getHuKidsDecimalParts(spendModel.weeklySpent);
  const remainingParts = getHuKidsDecimalParts(spendModel.availableToSpend);
  const weeklyLimitLabel = formatHuKidsDecimalAmount(spendModel.weeklyLimit);

  return (
    <section className="rounded-[16px] bg-[var(--hu-theme-card-bg)] px-[18px] py-[18px] shadow-sm">
      <h2 className="text-[18px] font-bold leading-[22px] tracking-[0] text-[var(--uc-text)]">Spending this week</h2>
      <div className="mt-[20px] flex items-start justify-between gap-[12px]">
        <HuAmountColumn label="Spent" value={showAmounts ? spentParts.integer : HU_MASKED_INTEGER} suffix={showAmounts ? `${spentParts.decimal} HUF` : `${HU_MASKED_DECIMALS} HUF`} />
        <HuAmountColumn align="right" label="Remaining" value={showAmounts ? remainingParts.integer : HU_MASKED_INTEGER} suffix={showAmounts ? `${remainingParts.decimal} HUF` : `${HU_MASKED_DECIMALS} HUF`} />
      </div>
      <div className="mt-[22px] h-[10px] overflow-hidden rounded-full bg-[var(--hu-theme-progress-bg)]">
        <div
          className="h-full rounded-full bg-[var(--hu-theme-accent-strong)]"
          style={{ width: `${spendModel.spentProgress}%` }}
        />
      </div>
      <div className="mt-[18px] flex items-center justify-between gap-[12px] text-[13px] leading-[16px] tracking-[0] text-[var(--uc-text-muted)]">
        <p>
          Weekly limit: <span className="font-bold text-[var(--uc-text)]">{showAmounts ? `${weeklyLimitLabel} HUF` : formatHuMaskedMoney()}</span>
        </p>
        <p>
          Days left: <span className="font-bold text-[var(--uc-text)]">{spendModel.daysLeft}</span>
        </p>
      </div>
    </section>
  );
}

function HuAmountColumn({
  align = "left",
  label,
  suffix,
  value,
}: {
  align?: "left" | "right";
  label: string;
  suffix: string;
  value: string;
}) {
  return (
    <div className={cn("min-w-0", align === "right" ? "text-right" : "text-left")}>
      <p className="text-[17px] font-bold leading-[20px] tracking-[0] text-[var(--uc-text)]">{label}</p>
      <p className="mt-[14px] whitespace-nowrap text-[22px] font-bold leading-[25px] tracking-[0] text-[var(--uc-text)]">
        {value}
        <span className="text-[16px] font-normal leading-[20px]">{suffix}</span>
      </p>
    </div>
  );
}

export function HuTransactionsCard({
  onTransactionClick,
  showAmounts,
}: {
  onTransactionClick?: (transaction: AccountTransaction) => void;
  showAmounts: boolean;
}) {
  const visibleTransactions = HU_KIDS_TRANSACTIONS.slice(0, 3);

  return (
    <section className="rounded-[16px] bg-[var(--hu-theme-card-bg)] px-[18px] pb-[18px] pt-[18px] shadow-sm">
      <h2 className="text-[18px] font-bold leading-[22px] tracking-[0] text-[var(--uc-text)]">Your recent transactions</h2>
      <div className="mt-[18px]">
        {visibleTransactions.map((transaction, index) => (
          <div key={transaction.id}>
            {index > 0 ? <div className="my-[16px] h-px bg-[var(--uc-border)]" /> : null}
            <HuKidsTransactionRow
              compact
              onClick={onTransactionClick}
              showAmounts={showAmounts}
              transaction={transaction}
            />
          </div>
        ))}
      </div>
      <LinkButton className="mx-auto mt-[22px] text-[var(--hu-theme-accent-strong)]">
        SEE MORE TRANSACTIONS
      </LinkButton>
    </section>
  );

  return (
    <section className="rounded-[16px] bg-[var(--hu-theme-card-bg)] px-[18px] pb-[18px] pt-[18px] shadow-sm">
      <h2 className="text-[18px] font-bold leading-[22px] tracking-[0] text-[var(--uc-text)]">Your recent transactions</h2>
      <div className="mt-[18px]">
        <HuTransactionRow
          amount={showAmounts ? "+11.824,33 RON" : `+${formatHuMaskedMoney("RON")}`}
          icon="add-money"
          isPositive
          source="From Dad"
          subtitle="Salary November"
          time="Today 14:31"
        />
        <div className="my-[16px] h-px bg-[var(--uc-border)]" />
        <HuTransactionRow
          amount={showAmounts ? "-94,21 RON" : `-${formatHuMaskedMoney("RON")}`}
          icon="gift"
          merchantLogo="mcdonalds"
          source="McDonalds"
          time="Today 11:24"
        />
      </div>
      <LinkButton className="mx-auto mt-[22px] text-[var(--hu-theme-accent-strong)]">
        SEE MORE TRANSACTIONS
      </LinkButton>
    </section>
  );
}

function HuTransactionRow({
  amount,
  icon,
  isPositive = false,
  merchantLogo,
  source,
  subtitle,
  time,
}: {
  amount: string;
  icon: IconName;
  isPositive?: boolean;
  merchantLogo?: "mcdonalds";
  source: string;
  subtitle?: string;
  time: string;
}) {
  return (
    <div className="flex items-start gap-[12px]">
      {merchantLogo ? (
        <HuMerchantLogo merchant={merchantLogo} />
      ) : (
        <span
          className={cn(
            "grid size-[34px] shrink-0 place-items-center rounded-full text-[var(--uc-static-white)]",
            isPositive ? "bg-[var(--uc-green-olive)]" : "bg-[var(--uc-product-pink)]",
          )}
        >
          <AppIcon name={icon} size={18} />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-[8px]">
          <p className="truncate text-[16px] font-bold leading-[20px] tracking-[0] text-[var(--uc-text)]">{source}</p>
          <p
            className={cn(
              "shrink-0 text-right text-[16px] font-bold leading-[20px] tracking-[0]",
              isPositive ? "text-[var(--uc-green-olive)]" : "text-[var(--uc-text)]",
            )}
          >
            {amount}
          </p>
        </div>
        {subtitle ? (
          <p className="mt-[10px] text-[14px] font-normal leading-[18px] tracking-[0] text-[var(--uc-text-muted)]">
            {subtitle}
          </p>
        ) : null}
        <p className={cn("text-[14px] font-normal leading-[18px] tracking-[0] text-[var(--uc-text-muted)]", subtitle ? "mt-[8px]" : "mt-[10px]")}>
          {time}
        </p>
      </div>
    </div>
  );
}

export function HuKidsTransactionRow({
  compact = false,
  onClick,
  showAmounts,
  transaction,
}: {
  compact?: boolean;
  onClick?: (transaction: AccountTransaction) => void;
  showAmounts: boolean;
  transaction: HuKidsTransaction;
}) {
  const isPositive = transaction.amount > 0;
  const formattedAmount = showAmounts
    ? `${isPositive ? "+" : "-"}${formatMoneyNumber(Math.abs(transaction.amount), HU_KIDS_RUNTIME_COUNTRY)} HUF`
    : formatHuMaskedSignedMoney(isPositive);
  const amountMatch = formattedAmount.match(/^([+-]?\d[\d\s.]*)((?:,\d+)?)(.*)$/);
  const amountInteger = amountMatch?.[1] ?? formattedAmount;
  const amountDecimal = amountMatch ? `${amountMatch[2]}${amountMatch[3]}` : "";
  const rowContent = (
    <>
      {transaction.merchantLogo ? (
        <HuMerchantLogoMark merchant={transaction.merchantLogo} />
      ) : (
        <span
          className={cn(
            "grid size-[34px] shrink-0 place-items-center rounded-full text-[var(--uc-static-white)]",
            isPositive ? "bg-[var(--uc-green-olive)]" : "bg-[var(--uc-product-pink)]",
          )}
        >
          <AppIcon name={isPositive ? "add-money" : "gift"} size={18} />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-[8px]">
          <p className="truncate text-[16px] font-bold leading-[20px] tracking-[0] text-[var(--uc-text)]">{transaction.label}</p>
          {isPositive ? (
            <p className="shrink-0 text-right tracking-[0] text-[var(--uc-green-olive)]">
              <span className="text-[18px] font-bold leading-[20px]">{amountInteger}</span>
              <span className="text-[14px] font-normal leading-[20px]">{amountDecimal}</span>
            </p>
          ) : (
            <p className="shrink-0 text-right text-[16px] font-bold leading-[20px] tracking-[0] text-[var(--uc-text)]">
              {formattedAmount}
            </p>
          )}
        </div>
        {transaction.subtitle ?? transaction.details ? (
          <p className="mt-[4px] text-[14px] font-normal leading-[18px] tracking-[0] text-[var(--uc-text-muted)]">
            {transaction.subtitle ?? transaction.details}
          </p>
        ) : null}
        <p className="mt-[4px] text-[14px] font-normal leading-[18px] tracking-[0] text-[var(--uc-text-muted)]">
          {transaction.time}
        </p>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        className={cn(
          "flex w-full items-start gap-[12px] rounded-[12px] text-left transition-colors active:bg-[color-mix(in_srgb,var(--uc-text)_6%,transparent)]",
          compact ? "py-0" : "px-[16px] py-[10px]",
        )}
        onClick={() => onClick(transaction)}
        type="button"
      >
        {rowContent}
      </button>
    );
  }

  return (
    <div className={cn("flex items-start gap-[12px]", compact ? undefined : "px-[16px] py-[10px]")}>
      {rowContent}
    </div>
  );
}

export function HuCardsPanel({ onCardDetails }: { onCardDetails: (cardId: string) => void }) {
  const card = HU_DEFAULT_KIDS_CARD;

  return (
    <section className="h-[102px] rounded-[8px] bg-[var(--hu-theme-card-bg)] p-[16px] shadow-sm" data-hu-cards-panel>
      <h2 className="text-[18px] font-bold leading-[22px] tracking-[0] text-[var(--uc-text)]">Your cards</h2>
      <button
        aria-label={`Open ${card.title} ending ${card.lastDigits}`}
        className="mt-[12px] flex h-[40px] w-full items-center gap-[8px] rounded-[4px] text-left transition-transform active:scale-[0.99]"
        onClick={() => onCardDetails(card.id)}
        type="button"
      >
        <img
          alt={`${card.title} card ending ${card.lastDigits}`}
          className="block h-[40px] w-[64px] shrink-0 rounded-[4px] object-cover shadow-[0_4px_8px_color-mix(in_srgb,var(--uc-static-black)_12%,transparent)]"
          draggable={false}
          height={40}
          src={huCardHomeCatSrc}
          width={64}
        />
        <span className="flex min-w-0 flex-col gap-[4px]">
          <span className="truncate text-[14px] font-bold leading-[15px] tracking-[0] text-[var(--uc-text)]">
            {card.title}
          </span>
          <span className="text-[14px] font-normal leading-[15px] tracking-[0] text-[var(--uc-text)]">
            *{card.lastDigits}
          </span>
        </span>
      </button>
    </section>
  );
}

export function HuAllMoneyCard({ showAmounts }: { showAmounts: boolean }) {
  const spendModel = getHuKidsSpendModel();
  const totalParts = getHuKidsDecimalParts(spendModel.totalMoney);
  const accountAmount = 11824.33;
  const savingAmount = 11824.33;
  const goalsAmount = spendModel.totalMoney - accountAmount - savingAmount;

  return (
    <section className="rounded-[16px] bg-[var(--hu-theme-card-bg)] px-[18px] py-[18px] shadow-sm">
      <h2 className="text-[18px] font-bold leading-[22px] tracking-[0] text-[var(--uc-text)]">All your money</h2>
      <p className="mt-[4px] text-[29px] font-bold leading-[32px] tracking-[0] text-[var(--uc-text)]">
        {showAmounts ? totalParts.integer : HU_MASKED_INTEGER}
        <span className="text-[20px] font-normal leading-[24px]">
          {showAmounts ? `${totalParts.decimal} HUF` : `${HU_MASKED_DECIMALS} HUF`}
        </span>
      </p>
      <div className="mt-[24px] space-y-[22px]">
        <HuMoneyBucket amount={accountAmount} colorClass="bg-[var(--uc-product-blue)]" icon="mcash" label="Accounts" showAmounts={showAmounts} />
        <HuMoneyBucket amount={savingAmount} colorClass="bg-[var(--uc-green-bright)]" icon="piggy-bank" label="Saving account" showAmounts={showAmounts} />
        <HuMoneyBucket amount={goalsAmount} colorClass="bg-[var(--uc-product-pink)]" icon="gift" label="Goals" showAmounts={showAmounts} />
      </div>
    </section>
  );
}

function HuMoneyBucket({
  amount,
  colorClass,
  icon,
  label,
  showAmounts,
}: {
  amount: number;
  colorClass: string;
  icon: IconName;
  label: string;
  showAmounts: boolean;
}) {
  const amountLabel = `${formatHuKidsDecimalAmount(amount)} HUF`;

  return (
    <div className="flex items-center gap-[18px]">
      <span className={cn("grid size-[34px] shrink-0 place-items-center rounded-full text-[var(--uc-static-white)]", colorClass)}>
        <AppIcon name={icon} size={18} />
      </span>
      <p className="min-w-0 flex-1 text-[16px] font-bold leading-[20px] tracking-[0] text-[var(--uc-text)]">{label}</p>
      <p className="shrink-0 text-right text-[14px] font-bold leading-[18px] tracking-[0] text-[var(--uc-text)]">
        {showAmounts ? amountLabel : formatHuMaskedMoney()}
      </p>
    </div>
  );
}
