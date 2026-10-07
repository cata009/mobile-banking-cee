import type { SVGProps } from 'react'
import type { IconDefinition } from './iconTypes'
import type { IconName } from './iconNames'
import { ICON_REGISTRY, resolveDefaultDimensions } from './iconRegistry'
export { ICON_REGISTRY, ICON_INVENTORY, ICON_AUDIT_EXCLUSIONS } from './iconRegistry'
export type { IconName, IconInventoryItem } from './iconRegistry'
export type { IconCategory } from './iconTypes'

type AppIconProps = Omit<SVGProps<SVGSVGElement>, 'name' | 'color' | 'width' | 'height'> & {
  name: IconName
  size?: number
  width?: number
  height?: number
  color?: string
  title?: string
  strokeWidth?: number
}

function resolveSize(name: IconName, definition: IconDefinition, size?: number, width?: number, height?: number) {
  if (width || height) {
    return {
      width: width ?? size ?? definition.width,
      height: height ?? size ?? definition.height,
    }
  }

  if (size) {
    return {
      width: size,
      height: size,
    }
  }

  return resolveDefaultDimensions(name, definition)
}

function normalizeSvgDisplayClassName(className?: string) {
  if (!className) return undefined

  return className
    .replace(/\bw-6\b/g, 'w-5')
    .replace(/\bh-6\b/g, 'h-5')
    .replace(/\bsize-6\b/g, 'size-5')
}

export function AppIcon({
  name,
  size,
  width,
  height,
  color = 'currentColor',
  title,
  strokeWidth,
  className,
  ...svgProps
}: AppIconProps) {
  const resolvedName = name in ICON_REGISTRY ? name : 'help-circle'
  const definition: IconDefinition = ICON_REGISTRY[resolvedName]
  const dimensions = resolveSize(resolvedName, definition, size, width, height)
  const normalizedClassName = normalizeSvgDisplayClassName(className)

  if (definition.source === 'lucide') {
    const LucideComponent = definition.component
    return (
      <LucideComponent
        aria-hidden={title ? undefined : true}
        className={normalizedClassName}
        color={color}
        height={dimensions.height}
        role={title ? 'img' : undefined}
        strokeWidth={strokeWidth ?? definition.strokeWidth}
        width={dimensions.width}
        {...svgProps}
      >
        {title ? <title>{title}</title> : null}
      </LucideComponent>
    )
  }

  return (
    <svg
      aria-hidden={title ? undefined : true}
      className={normalizedClassName}
      color={color}
      fill="none"
      height={dimensions.height}
      role={title ? 'img' : undefined}
      viewBox={definition.viewBox}
      width={dimensions.width}
      xmlns="http://www.w3.org/2000/svg"
      {...svgProps}
    >
      {title ? <title>{title}</title> : null}
      {definition.render()}
    </svg>
  )
}
