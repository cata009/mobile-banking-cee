import { useMemo, useState, type ReactNode } from 'react'
import { COMPONENT_REGISTRY } from '@/app/registry/componentRegistry'
import MiniPhone from './MiniPhone'
import ScreenInspector from './ScreenInspector'
import { renderFlowPreview } from './flowPreviews'
import { FLOW_SCREEN_SOURCES } from './screenSources'
import { groupRules, rulesForScreen, screenTitle, screensForRule } from '../flows/rules'
import type { FlowDefinition, FlowRule, FlowScreenKind } from '../flows/types'
import {
  acceptanceTestsSource,
  adapterSource,
  buildFlowReferencePackage,
  dataFields,
  orderedScreens,
  sessionSource,
  stateTransitions,
} from '../handoff/referencePackage'
import { composedComponents, moduleToRepoPath, parseImports, sliceFunction, tokensUsed } from '../handoff/sourceSlices'

/**
 * The developer build surface.
 *
 * Owns only what no screen contract can: the screens as built (with the exact
 * source that rendered them and a Figma-style inspector over the real layout),
 * the session model and guards, and the integration boundary. Everything else
 * on this tab — the state machine, the data contract, the rule→guard→test
 * table, the acceptance-criteria test names — is derived from the same flow
 * definition Specification renders, so it cannot say something Specification
 * does not. Rules are cited by id and never restated.
 */

const SECTIONS = [
  { id: 'impl-screens', label: 'Screens as built' },
  { id: 'impl-session', label: 'Session model & guards' },
  { id: 'impl-states', label: 'State machine' },
  { id: 'impl-data', label: 'Data contract' },
  { id: 'impl-rules', label: 'Rule → guard → test' },
  { id: 'impl-boundary', label: 'Integration boundary' },
  { id: 'impl-tests', label: 'Acceptance as tests' },
  { id: 'impl-analytics', label: 'Analytics' },
  { id: 'impl-caveats', label: 'Caveats' },
  { id: 'impl-package', label: 'Delivery package' },
] as const

const INSPECT_SCALE = 0.56

const REGISTRY_BY_PATH = new Map(
  Object.values(COMPONENT_REGISTRY).map((meta) => [meta.componentPath, meta] as const),
)

export default function FlowImplementationPanel({
  flow,
  countryName,
  onOpenRule,
  onOpenScreenContract,
}: {
  flow: FlowDefinition
  countryName: string
  onOpenRule: (ruleId: string) => void
  onOpenScreenContract: (screen: FlowScreenKind) => void
}) {
  const implementation = flow.implementation
  if (!implementation) return null
  const screenSource = FLOW_SCREEN_SOURCES[flow.id]
  const rules = flow.overview.rules ?? []
  const screens = orderedScreens(flow)

  const jump = (id: string) => document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: 'smooth' })

  return (
    <div role="tabpanel" className="grid w-full min-w-0 gap-[24px]">
      <Panel>
        <p className="uc-type-n6-strong text-[var(--uc-action)]">Build surface</p>
        <h2 className="mt-[5px] uc-type-h2 text-[var(--uc-text)]">Build it as it is built here</h2>
        <p className="mt-[8px] max-w-[880px] uc-type-n5 leading-[20px] text-[var(--uc-text-muted)]">
          <strong className="text-[var(--uc-text)]">Specification says what; this tab says how, from the same definition.</strong>{' '}
          The screens below are the real components that rendered the prototype, with the design-system parts they compose and
          an inspector over the real layout. The state machine, data contract and test names are derived from the prototype map
          and the screen contracts — nothing here is written twice. Rules are cited by id (R1…); the text lives in Specification.
        </p>
        <nav aria-label="Implementation sections" className="mt-[14px] flex flex-wrap gap-[6px]">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => jump(section.id)}
              className="rounded-full border border-[var(--uc-border)] bg-[var(--uc-surface)] px-[10px] py-[5px] uc-type-n6-strong text-[var(--uc-text-muted)] transition-colors hover:border-[var(--uc-action)] hover:text-[var(--uc-action)]"
            >
              {section.label}
            </button>
          ))}
        </nav>
      </Panel>

      <ScreensAsBuilt
        flow={flow}
        screens={screens}
        countryName={countryName}
        screenSource={screenSource}
        onOpenRule={onOpenRule}
        onOpenScreenContract={onOpenScreenContract}
      />

      <Panel id="impl-session" title="Session model and guards">
        <p className="max-w-[820px] uc-type-n5 leading-[20px] text-[var(--uc-text-muted)]">
          {implementation.sessionModel.description}
        </p>
        <div className="mt-[14px] grid gap-[16px] xl:grid-cols-[minmax(0,420px)_1fr]">
          <CodeBlock title={`${implementation.sessionModel.name} — lives across screens`} code={implementation.sessionModel.shape} />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left">
              <thead>
                <tr className="bg-[var(--uc-surface-muted)]">
                  {['Guard', 'Enforces', 'Where', 'Proven by'].map((heading) => (
                    <Th key={heading}>{heading}</Th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {implementation.guards.map((guard) => (
                  <tr key={guard.name}>
                    <Td>
                      <code className="font-mono text-[12px] font-bold text-[var(--uc-text)]">{guard.name}</code>
                      <p className="mt-[2px] font-mono text-[11px] text-[var(--uc-text-muted)]">{guard.signature}</p>
                    </Td>
                    <Td>
                      <span className="flex flex-wrap gap-[4px]">
                        {guard.rules.map((id) => (
                          <RuleChip key={id} rule={rules.find((rule) => rule.id === id) ?? { id, group: '', statement: '' }} onOpen={onOpenRule} />
                        ))}
                      </span>
                    </Td>
                    <Td muted>{guard.enforcedOn.map((screen) => screenTitle(flow, screen)).join(', ')}</Td>
                    <Td muted>
                      <span className="font-mono text-[11px]">{guard.test}</span>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Panel>

      <StateMachine flow={flow} onOpenScreenContract={onOpenScreenContract} />

      <DataContract flow={flow} />

      <Panel id="impl-rules" title="Rule → guard → test">
        <p className="max-w-[820px] uc-type-n5 leading-[20px] text-[var(--uc-text-muted)]">
          One row per rule: where it applies, the guard that enforces it and the test that proves it. A rule with no guard is a
          contract on the screen itself — see its screen contract.
        </p>
        <div className="mt-[14px] overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="bg-[var(--uc-surface-muted)]">
                {['Rule', 'Statement', 'Applies to', 'Guard', 'Test'].map((heading) => (
                  <Th key={heading}>{heading}</Th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groupRules(rules).flatMap((group) =>
                group.rules.map((rule) => {
                  const guards = implementation.guards.filter((guard) => guard.rules.includes(rule.id))
                  return (
                    <tr key={rule.id}>
                      <Td>
                        <RuleChip rule={rule} onOpen={onOpenRule} />
                        <p className="mt-[3px] uc-type-n6 text-[var(--uc-text-muted)]">{group.group}</p>
                      </Td>
                      <Td>{rule.statement}</Td>
                      <Td muted>
                        <span className="flex flex-wrap gap-[4px]">
                          {screensForRule(flow, rule.id).map((screen) => (
                            <button
                              key={screen}
                              type="button"
                              onClick={() => onOpenScreenContract(screen)}
                              className="rounded-[4px] bg-[var(--uc-surface-muted)] px-[6px] py-[1px] uc-type-n6-strong text-[var(--uc-text)] hover:text-[var(--uc-action)]"
                            >
                              {screenTitle(flow, screen)}
                            </button>
                          ))}
                        </span>
                      </Td>
                      <Td muted>
                        {guards.length ? (
                          guards.map((guard) => (
                            <code key={guard.name} className="block font-mono text-[12px] font-bold text-[var(--uc-text)]">
                              {guard.name}
                            </code>
                          ))
                        ) : (
                          <span className="uc-type-n6">Screen contract only</span>
                        )}
                      </Td>
                      <Td muted>
                        {guards.length ? (
                          guards.map((guard) => (
                            <span key={guard.name} className="block font-mono text-[11px]">
                              {guard.test}
                            </span>
                          ))
                        ) : (
                          <span className="font-mono text-[11px]">acceptance.skeleton.test.ts</span>
                        )}
                      </Td>
                    </tr>
                  )
                }),
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel id="impl-boundary" title="Technical integration boundary">
        <p className="max-w-[820px] uc-type-n5 leading-[20px] text-[var(--uc-text-muted)]">
          Every call the flow makes across the boundary, the screen that makes it, and what is still undecided. Replace the
          reference adapter with the approved data client; enter signing orchestration only after the summary guard passes.
        </p>
        <div className="mt-[14px] overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="bg-[var(--uc-surface-muted)]">
                {['Operation', 'Called from', 'Purpose', 'Not decided yet'].map((heading) => (
                  <Th key={heading}>{heading}</Th>
                ))}
              </tr>
            </thead>
            <tbody>
              {implementation.operations.map((operation) => (
                <tr key={operation.name}>
                  <Td>
                    <code className="font-mono text-[12px] font-bold text-[var(--uc-text)]">{operation.name}</code>
                    <p className="mt-[2px] font-mono text-[11px] text-[var(--uc-text-muted)]">{operation.signature}</p>
                  </Td>
                  <Td muted>
                    <button
                      type="button"
                      onClick={() => onOpenScreenContract(operation.calledFrom)}
                      className="uc-type-n5-strong text-[var(--uc-action)] underline-offset-2 hover:underline"
                    >
                      {screenTitle(flow, operation.calledFrom)}
                    </button>
                  </Td>
                  <Td>{operation.purpose}</Td>
                  <Td>
                    {operation.unresolved ? (
                      <span className="block rounded-[6px] border border-[var(--uc-orange-bright)] bg-[color-mix(in_srgb,var(--uc-orange-bright)_10%,var(--uc-surface))] px-[8px] py-[4px] uc-type-n6 text-[var(--uc-text)]">
                        {operation.unresolved}
                      </span>
                    ) : (
                      <span className="uc-type-n6 text-[var(--uc-text-muted)]">—</span>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel id="impl-tests" title="Acceptance criteria as tests">
        <p className="max-w-[820px] uc-type-n5 leading-[20px] text-[var(--uc-text-muted)]">
          Every acceptance criterion in the screen contracts, as a test name. Generated from Specification; ships in the package
          as <code className="font-mono text-[12px]">tests/acceptance.skeleton.test.ts</code>.
        </p>
        <div className="mt-[14px]">
          <CodeBlock title="acceptance.skeleton.test.ts" code={acceptanceTestsSource(flow)} collapsedHeight={280} />
        </div>
      </Panel>

      {implementation.analytics?.length ? (
        <Panel id="impl-analytics" title="Analytics">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left">
              <thead>
                <tr className="bg-[var(--uc-surface-muted)]">
                  {['Event', 'Fires when', 'Screen'].map((heading) => (
                    <Th key={heading}>{heading}</Th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {implementation.analytics.map((entry) => (
                  <tr key={entry.event}>
                    <Td>
                      <code className="font-mono text-[12px] text-[var(--uc-text)]">{entry.event}</code>
                    </Td>
                    <Td>{entry.trigger}</Td>
                    <Td muted>{entry.screen ? screenTitle(flow, entry.screen) : '—'}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      ) : null}

      <Panel id="impl-caveats" title="Implementation-specific caveats">
        <ul className="grid gap-[8px]">
          {implementation.openTechnicalQuestions.map((question) => (
            <li key={question} className="flex gap-[8px] uc-type-n5 text-[var(--uc-text)]">
              <span aria-hidden="true" className="mt-[8px] size-[5px] shrink-0 rounded-full bg-[var(--uc-text-muted)]" />
              <span>{question}</span>
            </li>
          ))}
        </ul>
      </Panel>

      <DeliveryPackage flow={flow} screenSourceFile={screenSource?.file} />
    </div>
  )
}

/* ------------------------------------------------------------------------ */

function ScreensAsBuilt({
  flow,
  screens,
  countryName,
  screenSource,
  onOpenRule,
  onOpenScreenContract,
}: {
  flow: FlowDefinition
  screens: readonly FlowScreenKind[]
  countryName: string
  screenSource: { file: string; source: string } | undefined
  onOpenRule: (ruleId: string) => void
  onOpenScreenContract: (screen: FlowScreenKind) => void
}) {
  const [inspecting, setInspecting] = useState(false)
  const mapping = flow.implementation?.screenSource
  const imports = useMemo(() => (screenSource ? parseImports(screenSource.source) : []), [screenSource])
  const shownComponents = new Set<string>()

  return (
    <Panel
      id="impl-screens"
      title="Screens as built"
      action={
        <button
          type="button"
          aria-pressed={inspecting}
          onClick={() => setInspecting((current) => !current)}
          className={`inline-flex h-[36px] items-center gap-[8px] rounded-[8px] border px-[12px] uc-type-n5-strong transition-colors ${
            inspecting
              ? 'border-[#7B61FF] bg-[#7B61FF] text-white'
              : 'border-[var(--uc-border)] bg-[var(--uc-surface)] text-[var(--uc-text)] hover:border-[#7B61FF]'
          }`}
        >
          <span aria-hidden="true" className="grid size-[14px] place-items-center rounded-[3px] border-2 border-current" />
          {inspecting ? 'Inspecting — hover a screen' : 'Inspect spacing & tokens'}
        </button>
      }
    >
      <p className="max-w-[880px] uc-type-n5 leading-[20px] text-[var(--uc-text-muted)]">
        These are the components that rendered the prototype, composed from the app's own design-system parts.
        {screenSource ? (
          <>
            {' '}
            Source: <code className="font-mono text-[12px] text-[var(--uc-text)]">{screenSource.file}</code>.
          </>
        ) : null}{' '}
        Turn on the inspector to read sizes, padding, gaps, typography and colour tokens off the real layout — in the
        phone's own 375-wide pixels, the way you would read them in Figma, except these are the numbers the build produced.
      </p>
      {mapping?.shell ? (
        <p className="mt-[6px] uc-type-n6 text-[var(--uc-text-muted)]">
          Flow shell: <code className="font-mono text-[12px] text-[var(--uc-text)]">{mapping.shell}</code> wires these screens with local state.
        </p>
      ) : null}

      <div className="mt-[18px] grid gap-[18px]">
        {screens.map((screen) => {
          const component = mapping?.screens[screen]
          const slice = screenSource && component ? sliceFunction(screenSource.source, component) : undefined
          const firstShowing = Boolean(component) && !shownComponents.has(component!)
          if (component) shownComponents.add(component)
          const composed = slice ? composedComponents(slice.code, imports) : []
          const tokens = slice ? tokensUsed(slice.code) : []
          const usage = screenSource && component ? renderCase(screenSource.source, screen) : undefined
          return (
            <article
              key={screen}
              data-testid="impl-screen"
              className="grid gap-[16px] rounded-[10px] border border-[var(--uc-border)] p-[16px] xl:grid-cols-[auto_minmax(0,1fr)]"
            >
              <div className="justify-self-center xl:justify-self-start">
                <ScreenInspector scale={INSPECT_SCALE} enabled={inspecting}>
                  <MiniPhone scale={INSPECT_SCALE} scrollable device>
                    {renderFlowPreview(screen, { countryName })}
                  </MiniPhone>
                </ScreenInspector>
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline justify-between gap-[8px]">
                  <h3 className="uc-type-n4-strong text-[var(--uc-text)]">{screenTitle(flow, screen)}</h3>
                  <button
                    type="button"
                    onClick={() => onOpenScreenContract(screen)}
                    className="uc-type-n5-strong text-[var(--uc-action)] underline-offset-2 hover:underline"
                  >
                    Open screen contract →
                  </button>
                </div>
                <p className="mt-[2px] font-mono text-[11px] text-[var(--uc-text-muted)]">{screen}</p>
                <RuleChips flow={flow} screen={screen} onOpenRule={onOpenRule} />

                {component ? (
                  <dl className="mt-[12px] grid gap-[8px] uc-type-n5">
                    <div className="grid gap-[2px] sm:grid-cols-[132px_minmax(0,1fr)]">
                      <dt className="uc-type-n6-strong uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">Component</dt>
                      <dd className="min-w-0">
                        <code className="font-mono text-[12px] font-bold text-[var(--uc-text)]">{component}</code>
                        {slice ? (
                          <span className="ml-[6px] uc-type-n6 text-[var(--uc-text-muted)]">
                            lines {slice.startLine}–{slice.endLine}
                          </span>
                        ) : null}
                      </dd>
                    </div>
                    {usage ? (
                      <div className="grid gap-[2px] sm:grid-cols-[132px_minmax(0,1fr)]">
                        <dt className="uc-type-n6-strong uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">This state</dt>
                        <dd className="min-w-0">
                          <code className="block overflow-x-auto whitespace-pre font-mono text-[11px] leading-[16px] text-[var(--uc-text)]">{usage}</code>
                        </dd>
                      </div>
                    ) : null}
                    {composed.length ? (
                      <div className="grid gap-[2px] sm:grid-cols-[132px_minmax(0,1fr)]">
                        <dt className="uc-type-n6-strong uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">Composes</dt>
                        <dd className="flex min-w-0 flex-wrap gap-[6px]">
                          {composed.map((entry) => (
                            <ComposedChip key={entry.name} name={entry.name} module={entry.module} />
                          ))}
                        </dd>
                      </div>
                    ) : null}
                    {tokens.length ? (
                      <div className="grid gap-[2px] sm:grid-cols-[132px_minmax(0,1fr)]">
                        <dt className="uc-type-n6-strong uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">Tokens</dt>
                        <dd className="flex min-w-0 flex-wrap gap-[4px]">
                          {tokens.map((token) => (
                            <code key={token} className="rounded-[4px] bg-[var(--uc-surface-muted)] px-[5px] py-[1px] font-mono text-[11px] text-[var(--uc-text)]">
                              {token}
                            </code>
                          ))}
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                ) : (
                  <p className="mt-[12px] uc-type-n5 text-[var(--uc-text-muted)]">No component is mapped to this screen yet.</p>
                )}

                {slice ? (
                  firstShowing ? (
                    <div className="mt-[12px]">
                      <CodeBlock
                        title={`${component}.tsx — ${screenSource?.file.split('/').pop()} · lines ${slice.startLine}–${slice.endLine}`}
                        code={slice.code}
                        collapsedHeight={220}
                      />
                    </div>
                  ) : (
                    <p className="mt-[12px] uc-type-n6 text-[var(--uc-text-muted)]">
                      Same component as above, rendered with the props shown under “This state”.
                    </p>
                  )
                ) : null}
              </div>
            </article>
          )
        })}
      </div>
    </Panel>
  )
}

/** The `case "kind": return <Screen … />` line from the preview dispatcher — the props that produce this state. */
function renderCase(source: string, screen: FlowScreenKind): string | undefined {
  const match = new RegExp(`case ["']${screen}["']:\\s*\\n?\\s*return ([\\s\\S]*?);\\n`).exec(source)
  return match?.[1]?.trim()
}

function ComposedChip({ name, module }: { name: string; module?: string }) {
  const meta = module ? REGISTRY_BY_PATH.get(moduleToRepoPath(module)) : undefined
  const title = module
    ? `${moduleToRepoPath(module)}${meta ? ` · ${meta.label} · used by ${meta.usedByScreens.length} app screens` : ''}`
    : 'Defined in the same module'
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-[5px] rounded-[5px] border px-[6px] py-[2px] font-mono text-[11px] ${
        module
          ? 'border-[var(--uc-border)] bg-[var(--uc-surface)] text-[var(--uc-text)]'
          : 'border-dashed border-[var(--uc-border)] text-[var(--uc-text-muted)]'
      }`}
    >
      {name}
      {meta ? (
        <span className="rounded-[3px] bg-[color-mix(in_srgb,var(--uc-green-status)_14%,var(--uc-surface))] px-[4px] uc-type-n6-strong text-[var(--uc-green-status)]">
          DS
        </span>
      ) : null}
    </span>
  )
}

function StateMachine({
  flow,
  onOpenScreenContract,
}: {
  flow: FlowDefinition
  onOpenScreenContract: (screen: FlowScreenKind) => void
}) {
  const transitions = stateTransitions(flow)
  if (!flow.prototype || transitions.length === 0) return null
  const kindTone: Record<(typeof transitions)[number]['kind'], string> = {
    primary: 'text-[var(--uc-action)]',
    secondary: 'text-[var(--uc-text)]',
    extra: 'text-[var(--uc-text)]',
    back: 'text-[var(--uc-text-muted)]',
    close: 'text-[var(--uc-text-muted)]',
  }
  return (
    <Panel id="impl-states" title="State machine">
      <p className="max-w-[820px] uc-type-n5 leading-[20px] text-[var(--uc-text-muted)]">
        Every transition, derived from the prototype map — the same map business clicked through, so it cannot drift from
        what was reviewed. Start: <strong className="text-[var(--uc-text)]">{screenTitle(flow, flow.prototype.start)}</strong>.{' '}
        {transitions.length} transitions across {orderedScreens(flow).length} screens.
      </p>
      <div className="mt-[14px] overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse text-left">
          <thead>
            <tr className="bg-[var(--uc-surface-muted)]">
              {['From', 'Control', 'To', 'Kind'].map((heading) => (
                <Th key={heading}>{heading}</Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transitions.map((transition) => (
              <tr key={`${transition.from}-${transition.kind}-${transition.control}-${transition.to}`}>
                <Td>
                  <ScreenLink flow={flow} screen={transition.from} onOpen={onOpenScreenContract} />
                </Td>
                <Td>
                  <span className={`uc-type-n5-strong ${kindTone[transition.kind]}`}>{transition.control}</span>
                </Td>
                <Td>
                  <ScreenLink flow={flow} screen={transition.to} onOpen={onOpenScreenContract} />
                </Td>
                <Td muted>
                  <span className="font-mono text-[11px]">{transition.kind}</span>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}

function DataContract({ flow }: { flow: FlowDefinition }) {
  const fields = dataFields(flow)
  if (fields.length === 0) return null
  return (
    <Panel id="impl-data" title="Data contract">
      <p className="max-w-[820px] uc-type-n5 leading-[20px] text-[var(--uc-text-muted)]">
        Every field the screen contracts declare, merged across screens. Types are the contract's wording; the generated
        interfaces ship in the package as <code className="font-mono text-[12px]">src/models.ts</code>.
      </p>
      <div className="mt-[14px] overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="bg-[var(--uc-surface-muted)]">
              {['Field', 'Type', 'Required', 'Validation / notes', 'Screens'].map((heading) => (
                <Th key={heading}>{heading}</Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fields.map((field) => (
              <tr key={field.name}>
                <Td>
                  <span className="uc-type-n5-strong">{field.name}</span>
                </Td>
                <Td>{field.type}</Td>
                <Td muted>{field.required ? 'Yes' : 'No'}</Td>
                <Td muted>{field.detail || '—'}</Td>
                <Td muted>{field.screens.map((screen) => screenTitle(flow, screen)).join(', ')}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}

function DeliveryPackage({ flow, screenSourceFile }: { flow: FlowDefinition; screenSourceFile?: string }) {
  const [busy, setBusy] = useState(false)
  const starter = useMemo(() => `${sessionSource(flow)}\n${adapterSource(flow)}`, [flow])
  const download = () => {
    if (busy) return
    setBusy(true)
    const url = URL.createObjectURL(buildFlowReferencePackage(flow, FLOW_SCREEN_SOURCES[flow.id]))
    const link = document.createElement('a')
    link.href = url
    link.download = `${flow.id}-reference-package.zip`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => {
      URL.revokeObjectURL(url)
      setBusy(false)
    }, 0)
  }
  const contents = [
    'handoff/rules.md · state-machine.md · frontend-handoff-manifest.json',
    'src/models.ts · session.ts · adapter.ts · mockData.ts',
    ...(screenSourceFile ? [`screens/${screenSourceFile.split('/').pop()} · COMPONENTS.md`] : []),
    'tests/guards.test.ts · acceptance.skeleton.test.ts',
    'README.md · INTEGRATION_CHECKLIST.md',
  ]
  return (
    <Panel id="impl-package" title="Developer delivery package">
      <div className="flex flex-wrap items-start justify-between gap-[12px]">
        <div className="max-w-[720px]">
          <p className="uc-type-n5 leading-[20px] text-[var(--uc-text-muted)]">
            Everything on this tab, as files — generated from the flow definition at the moment you download it, so the
            package cannot lag behind Specification. Scaffolding to adapt, not production code or an approved integration.
          </p>
          <ul className="mt-[10px] grid gap-[4px]">
            {contents.map((line) => (
              <li key={line} className="font-mono text-[11px] leading-[16px] text-[var(--uc-text)]">
                {line}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-wrap gap-[8px]">
          <CopyButton code={starter} label="Copy TypeScript starter" />
          <button
            type="button"
            onClick={download}
            disabled={busy}
            className="rounded-[7px] bg-[var(--uc-action-strong)] px-[12px] py-[8px] uc-type-n6-strong text-[var(--uc-static-white)] disabled:opacity-50"
          >
            {busy ? 'Preparing…' : 'Download developer reference package (.zip)'}
          </button>
        </div>
      </div>
    </Panel>
  )
}

/* ------------------------------------------------------------------------ */

function Panel({ id, title, action, children }: { id?: string; title?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section
      id={id}
      className="scroll-mt-[72px] rounded-[12px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-[20px] shadow-sm"
    >
      {title ? (
        <div className="flex flex-wrap items-center justify-between gap-[12px]">
          <h2 className="uc-type-h2 text-[var(--uc-text)]">{title}</h2>
          {action ?? null}
        </div>
      ) : null}
      <div className={title ? 'mt-[14px]' : ''}>{children}</div>
    </section>
  )
}

function Th({ children }: { children: ReactNode }) {
  return (
    <th className="border border-[var(--uc-border)] px-[10px] py-[7px] uc-type-n6-strong uppercase tracking-[0.03em] text-[var(--uc-text-muted)]">
      {children}
    </th>
  )
}

function Td({ children, muted = false }: { children: ReactNode; muted?: boolean }) {
  return (
    <td className={`border border-[var(--uc-border)] px-[10px] py-[7px] align-top uc-type-n5 ${muted ? 'text-[var(--uc-text-muted)]' : 'text-[var(--uc-text)]'}`}>
      {children}
    </td>
  )
}

function ScreenLink({ flow, screen, onOpen }: { flow: FlowDefinition; screen: FlowScreenKind; onOpen: (screen: FlowScreenKind) => void }) {
  return (
    <button type="button" onClick={() => onOpen(screen)} className="text-left uc-type-n5-strong text-[var(--uc-text)] hover:text-[var(--uc-action)]">
      {screenTitle(flow, screen)}
    </button>
  )
}

function RuleChips({ flow, screen, onOpenRule }: { flow: FlowDefinition; screen: FlowScreenKind; onOpenRule: (ruleId: string) => void }) {
  const rules = rulesForScreen(flow, screen)
  if (rules.length === 0) return null
  return (
    <p className="mt-[8px] flex flex-wrap items-center gap-[6px]">
      <span className="uc-type-n6-strong uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">Governed by</span>
      {rules.map((rule) => (
        <RuleChip key={rule.id} rule={rule} onOpen={onOpenRule} />
      ))}
    </p>
  )
}

function RuleChip({ rule, onOpen }: { rule: FlowRule; onOpen: (ruleId: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(rule.id)}
      title={rule.statement}
      className="inline-flex items-center rounded-[4px] border border-[var(--uc-action)] bg-[color-mix(in_srgb,var(--uc-action)_8%,var(--uc-surface))] px-[6px] py-[1px] font-mono text-[11px] font-bold text-[var(--uc-action)] transition-colors hover:bg-[var(--uc-action)] hover:text-[var(--uc-static-white)]"
    >
      {rule.id}
    </button>
  )
}

function CopyButton({ code, label }: { code: string; label: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard?.writeText(code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }
  return (
    <button
      type="button"
      onClick={() => void copy()}
      className="inline-flex h-[32px] items-center rounded-[7px] border border-[var(--uc-border)] bg-[var(--uc-surface)] px-[10px] uc-type-n6-strong text-[var(--uc-action)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)]"
    >
      {copied ? 'Copied' : label}
    </button>
  )
}

function CodeBlock({ title, code, collapsedHeight }: { title: string; code: string; collapsedHeight?: number }) {
  const [expanded, setExpanded] = useState(!collapsedHeight)
  const lines = code.split('\n').length
  return (
    <div className="overflow-hidden rounded-[8px] border border-[#17202A] bg-[#17202A]">
      <div className="flex flex-wrap items-center justify-between gap-[8px] border-b border-white/15 px-[12px] py-[8px]">
        <span className="min-w-0 truncate font-mono text-[11px] font-bold text-[#EAF2F8]">{title}</span>
        <span className="flex items-center gap-[6px]">
          {collapsedHeight ? (
            <button
              type="button"
              onClick={() => setExpanded((current) => !current)}
              className="rounded-[6px] border border-white/25 px-[8px] py-[4px] uc-type-n6-strong text-[#EAF2F8]"
            >
              {expanded ? 'Collapse' : `Show all ${lines} lines`}
            </button>
          ) : null}
          <CopyButton code={code} label="Copy" />
        </span>
      </div>
      <pre
        className="overflow-auto p-[12px] text-[12px] leading-[18px] text-[#EAF2F8]"
        style={expanded ? undefined : { maxHeight: collapsedHeight }}
      >
        <code>{code}</code>
      </pre>
    </div>
  )
}
