import type { ReactNode } from 'react'
import { l1HeaderWeb } from './contracts/l1HeaderWeb'
import type { L1HeaderVariant } from './contracts/l1Header'

/** Exact shared shell; named feature wrappers retain actions, context and title ownership. */
export default function BaselineL1Header({ variant, title, actions, showActions = true, showTitle = true, gutterClassName }: { variant: L1HeaderVariant; title: string; actions?: ReactNode; showActions?: boolean; showTitle?: boolean; gutterClassName?: string }) {
  const contract = l1HeaderWeb(variant, gutterClassName)
  const Root = contract.rootTag
  return <Root className={contract.rootClass}>
    {contract.splitActionsAndTitle ? <>
      {showActions && <div className={contract.homeActionsClass}>{actions}</div>}
      {showTitle && <div className={contract.contentClass}><h1 className={contract.titleClass}>{title}</h1></div>}
    </> : <div className={contract.contentClass}><div className={contract.rowClass}>
      <h1 className={contract.titleClass} style={contract.titleStyle}>{title}</h1>
      {actions}
    </div></div>}
  </Root>
}
