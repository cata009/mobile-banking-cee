import type { Product } from '@/app/config/productConfig'
import { AppIcon } from '@/app/components/icons'
import { activateOnKeyboard } from '@/app/components/ui/keyboardActivation'

function SeparatorLine() {
  return (
    <div className="flex justify-center items-center w-[327px] h-px">
      <span className="block h-px w-full bg-[var(--uc-text-subtle)] opacity-40" />
    </div>
  )
}

/**
 * Expanded Product
 */
export function ExpandedProduct({
  product,
  findOutMoreText = 'FIND OUT MORE',
}: {
  product: Product
  findOutMoreText?: string
}) {
  return (
    <div className="flex flex-col gap-[16px] w-full">
      <h2 className="uc-type-l1 text-[var(--uc-static-white)]">{product.title}</h2>
      <div className="flex flex-col gap-[24px] w-full">
        <p className="uc-type-p1 text-[var(--uc-static-white)]">{product.description}</p>
        <button className="flex items-center gap-px self-start cursor-pointer hover:opacity-80 transition-opacity">
          <span className="uc-type-n5-strong uppercase text-[var(--uc-static-white)]">{findOutMoreText}</span>
          <AppIcon name="chevron-link" color="var(--uc-static-white)" />
        </button>
      </div>
    </div>
  )
}

/**
 * Collapsed Product
 */
export function CollapsedProduct({ product, onClick }: { product: Product; onClick: () => void }) {
  return (
    <div className="relative w-full">
      <div
        className="flex items-center gap-[16px] w-full pt-[24px] pb-[24px] cursor-pointer hover:opacity-80 transition-opacity relative"
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={activateOnKeyboard}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2">
          <SeparatorLine />
        </div>
        <div className="flex-1">
          <h2 className="uc-type-l1 text-[var(--uc-static-white)]">{product.title}</h2>
        </div>
        <div className="shrink-0">
          <AppIcon name="chevron-down" color="var(--uc-static-white)" />
        </div>
      </div>
    </div>
  )
}
