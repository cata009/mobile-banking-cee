import { AppIcon } from '@/app/components/icons'
import PfmCategoryIcon from '@/app/components/pfm/PfmCategoryIcon'
import { resolveCanonicalIcon, type CanonicalIconLayer } from '@/app/components/contracts/canonicalIcons'
import { APP_ICON_METADATA } from '@/features/marketing-email/appIconMetadata'
import { resolveEmailIcon } from '@/features/marketing-email/iconCatalog'

const artwork = import.meta.glob('/src/assets/design-system/icons/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

/** Reuse actual DS renderers or compose original source layers with the native implementation's geometry. */
export function IconArtwork({ variantId, size = 32 }: { variantId: string; size?: number }) {
  const source = resolveEmailIcon(variantId)
  if (!source) return null
  const height = (source.height * size) / source.width
  if (source.kind === 'app' && source.appName)
    return (
      <span
        className="email-registry-icon"
        data-email-icon-source="app"
        aria-hidden="true"
        style={{ width: size, height }}
      >
        <AppIcon name={source.appName} width={size} height={height} />
      </span>
    )
  if (source.kind === 'pfm' && source.pfmCategory)
    return (
      <span className="email-registry-icon" data-email-icon-source="pfm" aria-hidden="true">
        <PfmCategoryIcon category={source.pfmCategory} size={size} variant={source.pfmVariant} />
      </span>
    )
  const canonical = resolveCanonicalIcon(variantId)
  if (!canonical) return null
  const existing = canonical.existing
  const existingMetadata = existing ? APP_ICON_METADATA.find((icon) => icon.name === existing.name) : undefined
  return (
    <span
      className="email-icon-artwork"
      data-email-icon-source="canonical"
      style={{ width: size, height }}
      aria-hidden="true"
    >
      <span style={{ width: canonical.width, height: canonical.height, transform: `scale(${size / canonical.width})` }}>
        {canonical.shapes?.map((shape, index) => (
          <span
            key={`shape-${index}`}
            data-email-artwork-shape={index}
            style={{
              position: 'absolute',
              left: shape.x,
              top: shape.y,
              width: shape.width,
              height: shape.height,
              borderRadius: shape.radius,
              backgroundColor: shape.color,
              borderWidth: shape.borderWidth,
              borderColor: shape.borderColor,
              borderStyle: shape.borderWidth ? 'solid' : undefined,
            }}
          />
        ))}
        {existing && existingMetadata ? (
          <span
            style={{
              position: 'absolute',
              left: existing.x,
              top: existing.y,
              width: existing.size,
              height: existing.size,
            }}
          >
            <AppIcon name={existingMetadata.name} size={existing.size} color={existing.color} />
          </span>
        ) : (
          canonical.layers.map((layer, index) => <CanonicalLayer key={index} layer={layer} index={index} />)
        )}
        {canonical.number && (
          <span
            style={{
              position: 'absolute',
              left: canonical.number.x,
              top: canonical.number.y,
              minWidth: canonical.number.width,
              fontFamily: 'UniCredit, sans-serif',
              fontWeight: 700,
              fontSize: canonical.number.fontSize,
              lineHeight: `${canonical.number.height}px`,
              letterSpacing: canonical.number.letterSpacing,
              color: '#ffffff',
            }}
          >
            1
          </span>
        )}
      </span>
    </span>
  )
}

function CanonicalLayer({ layer, index }: { layer: CanonicalIconLayer; index: number }) {
  const src = artwork[`/src/assets/design-system/icons/${layer.asset}`]
  if (!src) return null
  const clip = layer.clip,
    scaleX = layer.scaleX ?? 1,
    scaleY = layer.scaleY ?? 1
  const x = layer.x - (clip?.x ?? 0),
    y = layer.y - (clip?.y ?? 0)
  const transformed = Boolean(layer.rotate || scaleX !== 1 || scaleY !== 1)
  const image = (
    <img
      src={src}
      alt=""
      data-email-artwork-layer={index}
      style={{
        position: 'absolute',
        left: transformed ? 0 : x,
        top: transformed ? 0 : y,
        width: layer.width,
        height: layer.height,
      }}
    />
  )
  const content = transformed ? (
    <span
      style={{
        position: 'absolute',
        left: x + (layer.width * (scaleX - 1)) / 2,
        top: y + (layer.height * (scaleY - 1)) / 2,
        width: layer.width,
        height: layer.height,
        transform: `rotate(${layer.rotate ?? 0}deg) scaleX(${scaleX}) scaleY(${scaleY})`,
      }}
    >
      {image}
    </span>
  ) : (
    image
  )
  return clip ? (
    <span
      style={{
        position: 'absolute',
        left: clip.x,
        top: clip.y,
        width: clip.width,
        height: clip.height,
        overflow: 'hidden',
      }}
    >
      {content}
    </span>
  ) : (
    content
  )
}
