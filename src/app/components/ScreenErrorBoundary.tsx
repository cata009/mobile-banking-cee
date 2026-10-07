import { Component, type ErrorInfo, type ReactNode } from 'react'
import PrimaryButton from './PrimaryButton'

interface ScreenErrorBoundaryProps {
  children: ReactNode
  resetKey: string
  onBack?: () => void
  onReload?: () => void
}

export class ScreenErrorBoundary extends Component<ScreenErrorBoundaryProps, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Screen failed to render', error, info.componentStack)
  }

  componentDidUpdate(previous: ScreenErrorBoundaryProps) {
    if (this.state.failed && previous.resetKey !== this.props.resetKey) this.setState({ failed: false })
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <section
        role="alert"
        className="flex h-full flex-col items-center justify-center gap-[16px] bg-[var(--uc-surface)] p-[24px] text-center text-[var(--uc-text)]"
      >
        <h1 className="uc-type-h2">Unable to open this screen</h1>
        <p className="uc-type-n4">Try again or go back to continue.</p>
        <PrimaryButton onClick={this.props.onReload ?? (() => window.location.reload())}>Try again</PrimaryButton>
        {this.props.onBack ? (
          <PrimaryButton variant="surface" onClick={this.props.onBack}>
            Go back
          </PrimaryButton>
        ) : null}
      </section>
    )
  }
}
