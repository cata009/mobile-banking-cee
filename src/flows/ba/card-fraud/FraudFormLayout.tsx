import { Children, Fragment, isValidElement, type ReactNode, type ReactElement } from 'react'
import PrimaryButton from '@/app/components/PrimaryButton'

/** Baseline forms keep primary actions fixed below the independently scrolling content. */
export function FraudFormLayout({ children }: { children: ReactNode }) {
  const body: ReactNode[] = []
  const actions: ReactNode[] = []
  const collect = (nodes: ReactNode) =>
    Children.forEach(nodes, (node) => {
      if (isValidElement(node) && node.type === Fragment)
        collect((node as ReactElement<{ children?: ReactNode }>).props.children)
      else if (isValidElement(node) && node.type === PrimaryButton) actions.push(node)
      else if (node !== null && node !== false && node !== undefined) body.push(node)
    })
  collect(children)
  return (
    <>
      <div className="fraud-form-scroll">
        {body.map((node, index) => (
          <Fragment key={index}>{node}</Fragment>
        ))}
      </div>
      {actions.length ? (
        <footer className="fraud-fixed-actions">
          {actions.map((node, index) => (
            <Fragment key={index}>{node}</Fragment>
          ))}
        </footer>
      ) : null}
    </>
  )
}
