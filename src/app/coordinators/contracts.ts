import type { ProductsShelfFocusRequest } from '@/app/chat/czChatOrchestration'
import type { useDemo } from '@/app/state/demoStore'
import type { useNavigationContext, NavigationRoute, Screen } from '@/app/contexts/NavigationContext'
import type { ProductCategory } from '@/data/products'
import type { parseDeepLinkFromUrl } from '@/app/utils/deepLink'
import type { ProductDetailSelection } from '@/app/components/products/ProductCardBottomSheet'
import type { InvestmentBuyRequest, InvestmentFundsRequest } from '@/app/screens/investments/InvestmentsPortfolioScreen'
export interface CoordinatorInput {
  demoState: ReturnType<typeof useDemo>
  navigation: ReturnType<typeof useNavigationContext>
  categories: ProductCategory[]
  parsedDeepLink: ReturnType<typeof parseDeepLinkFromUrl>
}
export type AppCommand =
  | { type: 'navigate'; destination: Screen | NavigationRoute }
  | { type: 'investmentFunds'; collectionId?: InvestmentFundsRequest['collectionId'] }
  | { type: 'investmentBuy'; securityId: string; draft?: InvestmentBuyRequest['draft'] }
  | { type: 'creditOffer'; cardId: string }
  | { type: 'opportunityCard'; cardId?: string }
  | { type: 'productDetail'; selection: ProductDetailSelection }
  | { type: 'productsFocus'; cardId: ProductsShelfFocusRequest['cardId'] }
