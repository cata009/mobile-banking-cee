import { NativeScreenPreview } from '@/app/components/demo/NativeScreenPreview'
import { useDemo } from '@/app/state/demoStore'
import type { ProductsCardId } from '@/app/config/productsMenuConfig'
import type { NativeProductDetailPresentation } from '@/features/demo-native/productDetailPresentation'
import SmeProductDetailScreen, { getProductDetailImageSrc } from './SmeProductDetailScreen'
import type { ProductDetailScreenProps } from './SmeProductDetailScreen'

export type { ProductDetailScreenProps } from './SmeProductDetailScreen'
export { getProductDetailContent } from '@/features/products/evoProductDetail'
export { getProductDetailImageSrc } from './SmeProductDetailScreen'

export default function ProductDetailScreen(props: ProductDetailScreenProps) {
  const { product } = useDemo()
  if (product === 'SME') return <SmeProductDetailScreen {...props} />

  const presentation: NativeProductDetailPresentation = {
    title: props.title,
    ...(props.cardId ? { cardId: props.cardId as ProductsCardId } : {}),
    ...(props.optionId ? { optionId: props.optionId } : {}),
    ...(props.actionLabel ? { actionLabel: props.actionLabel } : {}),
    includeSafeArea: props.includeSafeArea ?? true,
    heroImage: props.heroImage ?? getProductDetailImageSrc(props.optionId, props.cardId),
    ...(props.heroImagePosition ? { heroImagePosition: props.heroImagePosition } : {}),
    ...(props.headline ? { headline: props.headline } : {}),
    ...(props.intro ? { intro: props.intro } : {}),
  }
  const params = {
    title: props.title,
    ...(props.cardId ? { cardId: props.cardId } : {}),
    ...(props.optionId ? { optionId: props.optionId } : {}),
  }

  return (
    <NativeScreenPreview
      route={{ screen: 'product-detail', params }}
      snapshot={{ productDetailPresentation: presentation }}
      events={{ onProductDetailAction: props.onActionClick }}
      onBack={props.onBack}
      onNavigate={(_route, _action) => true}
    />
  )
}
