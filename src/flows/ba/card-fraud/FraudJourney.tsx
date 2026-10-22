import { useEffect, useReducer, useRef, useState } from 'react'
import {
  createFraudSession,
  fraudReducer,
  canSubmitReport,
  type FraudScreen,
  type FraudSession,
  type CaseStatus,
} from '@/features/cards/fraud/model'
import { FraudScreens } from './FraudScreens'
import { FraudBaselineScreen } from './FraudBaselineScreen'
import { FraudNotification } from './FraudNotification'
import './fraud.css'

export function fraudScreenFixture(
  screen: FraudScreen,
  parameters: Readonly<Record<string, string>> = {},
): FraudSession {
  const hasCase =
    [
      'fraud-case-status',
      'fraud-claim-sent',
      'fraud-card-security',
      'fraud-replace-confirm',
      'fraud-replacement-status',
    ].includes(screen) || Boolean(parameters.caseStatus)
  let state = createFraudSession(
    hasCase
      ? parameters.ledger === 'booked'
        ? 'case'
        : 'report'
      : parameters.ledger === 'booked'
        ? 'booked'
        : undefined,
    parameters.transaction,
  )
  if (parameters.transaction) state = fraudReducer(state, { type: 'select', transactionId: parameters.transaction })
  if (['fraud-claim-details', 'fraud-claim-review', 'fraud-attempt'].includes(screen))
    state = fraudReducer(state, { type: 'report', transactionId: state.selectedId })
  if (screen === 'fraud-attempt' && !parameters.transaction) {
    state = fraudReducer(state, { type: 'report', transactionId: 'vienna' })
  }
  if (screen === 'fraud-claim-review')
    state = fraudReducer(state, { type: 'draft', note: 'I have my card and did not authorise this payment.' })
  if (screen === 'fraud-recognised') state = fraudReducer(state, { type: 'recognise', transactionId: state.selectedId })
  if (screen === 'fraud-replacement-status') state = fraudReducer(state, { type: 'replace', confirmed: true })
  if (
    parameters.caseStatus &&
    Object.prototype.hasOwnProperty.call(
      { submitted: 1, 'in-review': 1, 'needs-information': 1, resolved: 1, declined: 1 },
      parameters.caseStatus,
    )
  )
    state = fraudReducer(state, { type: 'case-fixture', status: parameters.caseStatus as CaseStatus })
  if (parameters.location === 'stale') state = fraudReducer(state, { type: 'geo', enabled: true })
  if (parameters.location === 'unavailable' || parameters.location === 'stale')
    state = fraudReducer(state, { type: 'location', location: parameters.location })
  return state
}

export function FraudJourney({
  initialScreen = 'fraud-push',
  parameters = {},
  failFirstSubmission = false,
  onScreenChange,
  controlledScreen,
}: {
  initialScreen?: FraudScreen
  parameters?: Readonly<Record<string, string>>
  failFirstSubmission?: boolean
  onScreenChange?: (screen: FraudScreen) => void
  controlledScreen?: FraudScreen
}) {
  const [state, dispatch] = useReducer(fraudReducer, undefined, () => fraudScreenFixture(initialScreen, parameters))
  const [screen, setScreen] = useState<FraudScreen>(initialScreen)
  const [replacementOrigin, setReplacementOrigin] = useState<FraudScreen>('fraud-card-security')
  const visibleScreen = screen === 'fraud-attempt' ? 'fraud-claim-details' : screen
  const failedOnce = useRef(false)
  const parameterKey = JSON.stringify(parameters)
  const previousParameters = useRef(parameterKey)
  const root = useRef<HTMLDivElement>(null)
  const go = (next: FraudScreen) => {
    if (next === 'fraud-replace-confirm')
      setReplacementOrigin(screen === 'fraud-card-options' ? 'fraud-card-options' : 'fraud-card-security')
    setScreen(next)
    onScreenChange?.(next)
  }
  useEffect(() => {
    const parametersChanged = previousParameters.current !== parameterKey
    previousParameters.current = parameterKey
    if (controlledScreen && (controlledScreen !== screen || parametersChanged)) {
      const reset = parametersChanged || controlledScreen === 'fraud-push'
      if (reset) failedOnce.current = false
      dispatch({
        type: 'preview-fixture',
        state: fraudScreenFixture(controlledScreen, parameters),
        reset,
      })
      setScreen(controlledScreen)
    }
  }, [controlledScreen, screen, parameters, parameterKey])
  useEffect(() => {
    root.current?.querySelector('.fraud-phone')?.scrollTo({ top: 0 })
  }, [screen])
  const back = () => {
    const target: Partial<Record<FraudScreen, FraudScreen>> = {
      'fraud-alerts': 'fraud-home',
      'fraud-transaction': 'fraud-alerts',
      'fraud-recognised': 'fraud-alerts',
      'fraud-attempt': 'fraud-alerts',
      'fraud-claim-details': 'fraud-transaction',
      'fraud-claim-review': 'fraud-claim-details',
      'fraud-claim-sent': 'fraud-transaction',
      'fraud-case-status': 'fraud-baseline-transaction',
      'fraud-card-security': 'fraud-card-options',
      'fraud-replace-confirm': replacementOrigin,
      'fraud-replacement-status': 'fraud-card-security',
      'fraud-geo-settings': 'fraud-card-options',
    }
    go(target[screen] ?? 'fraud-push')
  }
  const submit = () => {
    if (!canSubmitReport(state)) return
    const fail = (failFirstSubmission || parameters.submission === 'fail-once') && !failedOnce.current
    failedOnce.current = true
    dispatch({ type: 'submit', fail })
    if (!fail) go('fraud-claim-sent')
  }
  return (
    <div ref={root} className="fraud-journey">
      {visibleScreen === 'fraud-push' || visibleScreen === 'fraud-authenticate' ? (
        <FraudNotification authenticating={visibleScreen === 'fraud-authenticate'} go={go} />
      ) : [
          'fraud-home',
          'fraud-cards',
          'fraud-card-options',
          'fraud-baseline-transaction',
          'fraud-transaction',
        ].includes(visibleScreen) ? (
        <FraudBaselineScreen
          screen={visibleScreen}
          state={state}
          dispatch={dispatch}
          go={go}
          select={(transactionId) => dispatch({ type: 'select', transactionId })}
        />
      ) : (
        <FraudScreens
          key={visibleScreen}
          screen={visibleScreen}
          state={state}
          dispatch={dispatch}
          go={go}
          back={back}
          submit={submit}
        />
      )}
    </div>
  )
}
