import { cn } from "@/lib/utils"

const MOBILE_CHIP_BASE_CLASS =
  "relative flex flex-col items-center justify-center h-[46px] rounded-[120px] whitespace-nowrap transition-all duration-200"
const MOBILE_CHIP_ACTIVE_CLASS = "bg-[#007A91] px-3 pt-3 pb-2"
const MOBILE_CHIP_INACTIVE_CLASS = "bg-transparent px-3 pt-3 pb-[14px]"
const MOBILE_CHIP_LABEL_BASE_CLASS = "text-[18px] leading-5 transition-all duration-200"
const MOBILE_CHIP_LABEL_ACTIVE_CLASS = "text-white font-medium"
const MOBILE_CHIP_LABEL_INACTIVE_CLASS = "text-[#666666] font-normal"

export function getMobileChipButtonClassName(
  isActive: boolean,
  options?: {
    activeClassName?: string
    inactiveClassName?: string
  },
) {
  return cn(
    MOBILE_CHIP_BASE_CLASS,
    isActive ? MOBILE_CHIP_ACTIVE_CLASS : MOBILE_CHIP_INACTIVE_CLASS,
    isActive ? options?.activeClassName : options?.inactiveClassName,
  )
}

export function getMobileChipLabelClassName(isActive: boolean) {
  return cn(
    MOBILE_CHIP_LABEL_BASE_CLASS,
    isActive ? MOBILE_CHIP_LABEL_ACTIVE_CLASS : MOBILE_CHIP_LABEL_INACTIVE_CLASS,
  )
}
