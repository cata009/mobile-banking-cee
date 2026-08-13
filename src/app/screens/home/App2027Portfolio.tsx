import { useRef, useState, type ReactNode } from 'react';
import type { Product, ProductCategory } from '@/data/products';

export interface App2027PortfolioProps {
  categories: ProductCategory[];
  currency: string;
  amountsHidden: boolean;
  getProductIcon: (product: Product) => ReactNode;
  onCategoryClick: (category: ProductCategory) => void;
}

function money(value: number, currency: string, hidden: boolean) {
  if (hidden) return `****.** ${currency}`;
  return `${Math.round(Math.abs(value)).toLocaleString('cs-CZ')} ${currency}`;
}

function categoryByKey(categories: ProductCategory[], key: ProductCategory['key']) {
  return categories.find((category) => category.key === key);
}

function PortfolioPanel({
  kind,
  eyebrow,
  title,
  amount,
  supporting,
  artefact,
  onClick,
}: {
  kind: 'everyday' | 'grow' | 'borrowed';
  eyebrow: string;
  title: string;
  amount: string;
  supporting: string;
  artefact: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      data-portfolio-world={kind}
      onClick={onClick}
      className="group relative isolate flex min-h-[164px] w-full flex-col overflow-hidden rounded-[24px] border border-[rgb(var(--uc-static-white-rgb)/0.13)] p-[16px] text-left shadow-[inset_0_1px_0_rgb(var(--uc-static-white-rgb)/0.15),0_16px_34px_rgb(0_0_0/0.18)] backdrop-blur-[20px] transition-[border-color,transform,box-shadow] duration-300 active:scale-[0.992] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
    >
      <span aria-hidden="true" data-portfolio-world-light />
      <span className="relative z-10 text-[14px] font-bold uppercase leading-[18px] tracking-[0.075em] text-[var(--uc-text-muted)]">{eyebrow}</span>
      <span className="relative z-10 mt-[3px] text-[18px] font-bold leading-[22px] tracking-[-0.015em] text-[var(--uc-text)]">{title}</span>
      <span className="relative z-10 mt-auto text-[21px] font-bold leading-[25px] tracking-[-0.02em] tabular-nums text-[var(--uc-text)]">{amount}</span>
      <span className="relative z-10 mt-[3px] text-[14px] leading-[18px] text-[var(--uc-text-muted)]">{supporting}</span>
      <span className="absolute right-[13px] top-[14px] z-10">{artefact}</span>
    </button>
  );
}

function EverydayArtefact({ icon }: { icon?: ReactNode }) {
  return (
    <span className="relative block h-[50px] w-[70px]">
      <span className="absolute right-0 top-0 h-[36px] w-[57px] rotate-[5deg] rounded-[8px] border border-[rgb(var(--uc-static-white-rgb)/0.16)] bg-[linear-gradient(135deg,#373b42,#17191c)] shadow-[0_8px_18px_rgb(0_0_0/0.24)]" />
      <span className="absolute left-0 top-[10px] grid h-[36px] w-[57px] -rotate-[6deg] place-items-start rounded-[8px] border border-[rgb(var(--uc-static-white-rgb)/0.18)] bg-[linear-gradient(135deg,#8c2435,#35151c)] p-[7px] shadow-[0_8px_18px_rgb(0_0_0/0.23)] [&>svg]:size-[17px]">{icon}</span>
    </span>
  );
}

function GrowArtefact() {
  return (
    <span className="relative grid size-[54px] place-items-center rounded-full bg-[conic-gradient(var(--uc-action)_0_64%,rgb(var(--uc-static-white-rgb)/0.10)_64%)] shadow-[0_0_28px_rgb(101_217_210/0.18)]">
      <span className="grid size-[40px] place-items-center rounded-full bg-[rgb(18_29_29/0.88)] text-[14px] font-bold leading-[18px] text-[var(--uc-static-white)]">64%</span>
    </span>
  );
}

function BorrowedArtefact() {
  return (
    <span className="relative block h-[54px] w-[64px]">
      {[9, 22, 37, 49].map((height, index) => (
        <span key={height} className="absolute bottom-[8px] w-[7px] rounded-full bg-[linear-gradient(180deg,rgb(255_255_255/0.72),rgb(255_255_255/0.16))]" style={{ height, left: 5 + index * 14 }} />
      ))}
      <span className="absolute inset-x-[2px] bottom-[3px] h-px bg-[rgb(var(--uc-static-white-rgb)/0.28)]" />
    </span>
  );
}

export default function App2027Portfolio({ categories, currency, amountsHidden, getProductIcon, onCategoryClick }: App2027PortfolioProps) {
  const [activeWorldIndex, setActiveWorldIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const accounts = categoryByKey(categories, 'accounts');
  const cards = categoryByKey(categories, 'cards');
  const savings = categoryByKey(categories, 'savings_deposits');
  const investments = categoryByKey(categories, 'investments');
  const borrowed = categoryByKey(categories, 'mortgages_loans');
  const everydayProducts = [...(accounts?.products ?? []), ...(cards?.products ?? [])];
  const growProducts = [...(savings?.products ?? []), ...(investments?.products ?? [])];
  const everydayTotal = everydayProducts.reduce((sum, product) => sum + Math.max(product.balance, 0), 0);
  const growTotal = growProducts.reduce((sum, product) => sum + Math.max(product.balance, 0), 0);
  const borrowedTotal = (borrowed?.products ?? []).reduce((sum, product) => sum + Math.abs(product.balance), 0);
  const everydayTarget = accounts ?? cards;
  const growTarget = savings ?? investments;
  const everydayWorld: ProductCategory | undefined = everydayTarget ? {
    key: 'accounts',
    title: 'Everyday',
    products: everydayProducts,
  } : undefined;
  const growWorld: ProductCategory | undefined = growTarget ? {
    key: investments?.products.length ? 'investments' : 'savings_deposits',
    title: 'Grow',
    products: growProducts,
  } : undefined;
  const borrowedWorld: ProductCategory | undefined = borrowed ? {
    ...borrowed,
    title: 'Borrowed',
  } : undefined;

  const worlds = [
    everydayWorld ? {
      key: 'everyday',
      panel: (
        <PortfolioPanel
          kind="everyday"
          eyebrow="Spend & manage"
          title="Everyday"
          amount={money(everydayTotal, currency, amountsHidden)}
          supporting={`${everydayProducts.length} accounts and cards`}
          artefact={<EverydayArtefact icon={cards?.products[0] ? getProductIcon(cards.products[0]) : undefined} />}
          onClick={() => onCategoryClick(everydayWorld)}
        />
      ),
    } : null,
    growWorld ? {
      key: 'grow',
      panel: (
        <PortfolioPanel
          kind="grow"
          eyebrow="Save & invest"
          title="Grow"
          amount={money(growTotal, currency, amountsHidden)}
          supporting="+4.8% over the past year"
          artefact={<GrowArtefact />}
          onClick={() => onCategoryClick(growWorld)}
        />
      ),
    } : null,
    borrowedWorld ? {
      key: 'borrowed',
      panel: (
        <PortfolioPanel
          kind="borrowed"
          eyebrow="Credit overview"
          title="Borrowed"
          amount={money(borrowedTotal, currency, amountsHidden)}
          supporting="Next repayment tomorrow"
          artefact={<BorrowedArtefact />}
          onClick={() => onCategoryClick(borrowedWorld)}
        />
      ),
    } : null,
  ].filter((world): world is NonNullable<typeof world> => world !== null);

  const safeIndex = worlds.length > 0 ? activeWorldIndex % worlds.length : 0;
  const activeWorld = worlds[safeIndex];

  const move = (direction: -1 | 1) => {
    if (worlds.length < 2) return;
    setActiveWorldIndex((current) => (current + direction + worlds.length) % worlds.length);
  };

  const finishSwipe = (clientX: number) => {
    if (touchStartX.current === null) return;
    const travel = clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(travel) < 42) return;
    move(travel < 0 ? 1 : -1);
  };

  return (
    <section data-home-area="products" aria-labelledby="app-2027-portfolio-heading">
      <div className="mb-[10px] flex min-h-[44px] items-center justify-between gap-[10px]">
        <div className="min-w-0">
          <h2 id="app-2027-portfolio-heading" className="text-[19px] font-bold leading-[24px] tracking-[-0.018em] text-[var(--uc-text)]">Your portfolio</h2>
          <p className="mt-[1px] text-[14px] leading-[18px] text-[var(--uc-text-muted)]">Organised by what your money does</p>
        </div>
        {worlds.length > 0 ? (
          <div className="flex shrink-0 items-center gap-[3px]" aria-label="Portfolio carousel controls">
            <button
              type="button"
              aria-label="Previous portfolio world"
              title="Previous"
              onClick={() => move(-1)}
              disabled={worlds.length < 2}
              className="grid size-[44px] place-items-center rounded-full border border-[rgb(var(--uc-static-white-rgb)/0.14)] bg-[rgb(var(--uc-static-black-rgb)/0.16)] text-[var(--uc-action)] shadow-[inset_0_1px_0_rgb(var(--uc-static-white-rgb)/0.10)] transition-[background-color,transform] active:scale-95 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <span aria-live="polite" aria-atomic="true" className="min-w-[48px] text-center text-[14px] font-semibold leading-[18px] tabular-nums text-[var(--uc-text)]">
              {safeIndex + 1} of {worlds.length}
            </span>
            <button
              type="button"
              aria-label="Next portfolio world"
              title="Next"
              onClick={() => move(1)}
              disabled={worlds.length < 2}
              className="grid size-[44px] place-items-center rounded-full border border-[rgb(var(--uc-static-white-rgb)/0.14)] bg-[rgb(var(--uc-static-black-rgb)/0.16)] text-[var(--uc-action)] shadow-[inset_0_1px_0_rgb(var(--uc-static-white-rgb)/0.10)] transition-[background-color,transform] active:scale-95 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        ) : null}
      </div>
      {activeWorld ? (
        <div
          data-portfolio-worlds
          data-portfolio-current={activeWorld.key}
          className="w-full touch-pan-y"
          onTouchStart={(event) => { touchStartX.current = event.touches[0]?.clientX ?? null; }}
          onTouchEnd={(event) => finishSwipe(event.changedTouches[0]?.clientX ?? 0)}
          onTouchCancel={() => { touchStartX.current = null; }}
        >
          <div key={activeWorld.key} className="w-full">{activeWorld.panel}</div>
        </div>
      ) : null}
      {worlds.length > 1 ? (
        <div className="mt-[10px] flex items-center justify-center gap-[5px]" aria-hidden="true">
          {worlds.map((world, index) => (
            <span
              key={world.key}
              className={`h-[3px] rounded-full transition-[width,background-color] duration-300 ${index === safeIndex ? 'w-[24px] bg-[var(--uc-action)]' : 'w-[12px] bg-[rgb(var(--uc-static-white-rgb)/0.28)]'}`}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
