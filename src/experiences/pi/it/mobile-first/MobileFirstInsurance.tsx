import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react'
import { BottomSheet } from '@/app/components/BottomSheet'
import { ScrollableRegion } from '@/app/components/ui/ScrollableRegion'
import { useDemo } from '@/app/state/demoStore'
import {
  getInsuranceActions,
  getInsuranceSnapshot,
  getInsuranceFavorites,
  insurancePremiumCents,
  normalizeInsuranceFavorites,
  saveInsuranceFavorites,
  selectHomepageInsurance,
  subscribeInsurance,
  type InsuranceModule,
  type InsurancePolicy,
  type InsuranceDocument,
} from '@/features/insurance/mobileFirstInsurance'
import { createInsuranceExport } from '@/features/insurance/mobileFirstInsuranceExports'
import { ITALY_INSURANCE_POLICIES, INSURANCE_MANAGEMENT_ACTIONS, insuranceDocuments } from './insuranceContent'
import { insuranceAssets as a } from './insuranceAssets'
import { mobileFirstAssets as shared } from './assets'
import { MOBILE_FIRST_TAB_CONTENT } from './productTabContent'
import {
  InsuranceAmount,
  InsuranceButton,
  InsuranceField,
  InsuranceLink,
  InsurancePage,
  InsuranceQuickAction,
  insuranceDate,
} from './MobileFirstInsurancePrimitives'
import MobileFirstInsuranceList from './MobileFirstInsuranceList'
import MobileFirstInsuranceModule from './MobileFirstInsuranceModule'
import MobileFirstInsuranceDocuments from './MobileFirstInsuranceDocuments'
import MobileFirstInsuranceHelp from './MobileFirstInsuranceHelp'
import MobileFirstDetailHeader from './MobileFirstDetailHeader'
import './mobile-first.css'
import './mobile-first-products.css'
import './mobile-first-insurance.css'

export type InsuranceInitialView = 'detail' | 'list' | 'catalogue' | 'documents'
export interface MobileFirstInsuranceProps {
  initialPolicyId?: string
  initialView?: InsuranceInitialView
  onClose: () => void
  policies?: readonly InsurancePolicy[]
  onContact?: (channel: 'chat' | 'phone', policyId: string) => void
  onManage?: (policyId: string, actionId: string) => void
  onProfile?: () => void
  externalOverlayOpen?: boolean
}
type Overlay =
  | { kind: 'module'; module: InsuranceModule }
  | { kind: 'document'; document: InsuranceDocument }
  | {
      kind: 'history' | 'manage' | 'documents-quick' | 'documents' | 'help' | 'contact' | 'add-module' | 'profile'
      subject?: string
    }
  | null
type PrimaryView = InsuranceInitialView | 'inactive'

export function MobileFirstInsurancePanel({
  onOpen,
  policies = ITALY_INSURANCE_POLICIES,
}: {
  onOpen: (policyId?: string, view?: InsuranceInitialView) => void
  policies?: readonly InsurancePolicy[]
}) {
  const snapshot = useSyncExternalStore(subscribeInsurance, getInsuranceSnapshot, getInsuranceSnapshot)
  const favorites = selectHomepageInsurance(policies, getInsuranceFavorites(policies, snapshot))
  const products = MOBILE_FIRST_TAB_CONTENT['Polizze assicurative']
  return (
    <div className="mf-product-panel mf-insurance-home" data-mobile-first-insurance-panel="true">
      <div className="mf-product-owned">
        <div className="mf-product-owned-list">
          {favorites.map((policy) => (
            <button
              type="button"
              className="mf-product-policy-card"
              aria-label={`Apri polizza ${policy.name}`}
              key={policy.id}
              onClick={() => onOpen(policy.id, 'detail')}
            >
              <span className="mf-product-summary-heading">
                <span>
                  <strong>{policy.name}</strong>
                  <b>Numero polizza {policy.number}</b>
                  <span>Attiva dal {insuranceDate(policy.start)}</span>
                </span>
                <span className="mf-product-chevron" aria-hidden="true">
                  <img src={shared.accountChevron} alt="" width={12} height={22} />
                </span>
              </span>
            </button>
          ))}
        </div>
        {policies.filter((p) => p.status === 'active').length > 2 && (
          <div className="mf-ins-centered">
            <InsuranceLink onClick={() => onOpen(undefined, 'list')}>Tutte le polizze</InsuranceLink>
          </div>
        )}
      </div>
      <section className="mf-product-commercial" aria-label="Le nostre polizze">
        <h2>Le nostre polizze</h2>
        <ScrollableRegion className="mf-product-commercial-rail" aria-label="Le nostre polizze">
          {products.products.map((product) => (
            <button
              type="button"
              className="mf-product-commercial-card"
              key={product.title}
              onClick={() => onOpen(undefined, 'catalogue')}
            >
              <span className="mf-product-commercial-image">
                <img src={product.image} alt="" style={product.crop as CSSProperties} />
              </span>
              <strong>{product.title}</strong>
              <span>{product.description}</span>
            </button>
          ))}
        </ScrollableRegion>
        <div className="mf-ins-centered">
          <InsuranceLink onClick={() => onOpen(undefined, 'catalogue')}>Scopri i nostri prodotti</InsuranceLink>
        </div>
      </section>
    </div>
  )
}

function InsuranceDocumentPreview({
  policy,
  document,
  onClose,
}: {
  policy: InsurancePolicy
  document: InsuranceDocument
  onClose: () => void
}) {
  const { amountsHidden } = useDemo()
  const [url, setUrl] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  useEffect(() => {
    if (typeof URL.createObjectURL !== 'function') return
    const value = URL.createObjectURL(
      new Blob([new Uint8Array(createInsuranceExport(policy, [document], 'pdf', amountsHidden)).buffer], {
        type: 'application/pdf',
      }),
    )
    setUrl(value)
    return () => URL.revokeObjectURL(value)
  }, [policy, document, amountsHidden])
  return (
    <InsurancePage
      title={document.title}
      onClose={onClose}
      footer={
        <InsuranceButton
          disabled={amountsHidden || !url}
          onClick={() => {
            if (!url) return
            const anchor = window.document.createElement('a')
            anchor.href = url
            anchor.download = `polizza-${policy.number}.pdf`
            anchor.click()
            setNotice('Documento scaricato.')
          }}
        >
          Condividi PDF
        </InsuranceButton>
      }
    >
      {url ? (
        <iframe className="mf-ins-pdf" title={`${document.title} PDF`} src={url} />
      ) : (
        <div className="mf-ins-pdf-fallback">FACSIMILE</div>
      )}
      {notice && <p role="status">{notice}</p>}
    </InsurancePage>
  )
}

export default function MobileFirstInsurance({
  initialPolicyId,
  initialView = 'detail',
  onClose,
  policies = ITALY_INSURANCE_POLICIES,
  onContact,
  onManage,
  onProfile,
  externalOverlayOpen = false,
}: MobileFirstInsuranceProps) {
  const { amountsHidden, toggleAmountsHidden } = useDemo()
  const snapshot = useSyncExternalStore(subscribeInsurance, getInsuranceSnapshot, getInsuranceSnapshot)
  const active = policies.filter((p) => p.status === 'active')
  const preferred = selectHomepageInsurance(policies, getInsuranceFavorites(policies, snapshot))
  const primaryId = initialPolicyId ?? preferred[0]?.id ?? active[0]?.id ?? policies[0]?.id
  const [policyId, setPolicyId] = useState(primaryId)
  const [view, setView] = useState<PrimaryView>(initialView)
  const [overlay, setOverlay] = useState<Overlay>(null)
  const [helpParent, setHelpParent] = useState<Overlay>(null)
  const [detailOrigin, setDetailOrigin] = useState<'direct' | 'other' | 'list'>('direct')
  const [listReturn, setListReturn] = useState<{ policyId: string | undefined; origin: 'direct' | 'other' } | null>(
    null,
  )
  const [compact, setCompact] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const policy = policies.find((p) => p.id === policyId) ?? policies[0]
  const favorites = normalizeInsuranceFavorites(
    getInsuranceFavorites(policies, snapshot) ?? active.slice(0, 2).map((p) => p.id),
    policies,
  )
  const help = () => {
    setHelpParent(overlay)
    setOverlay({ kind: 'help' })
  }
  const back = () => {
    if (view === 'inactive') setView('list')
    else if (view === 'list' && listReturn) {
      setPolicyId(listReturn.policyId)
      setDetailOrigin(listReturn.origin)
      setView('detail')
      setListReturn(null)
    } else onClose()
  }
  const closeOverlay = () => {
    if (overlay?.kind === 'help') {
      setOverlay(helpParent)
      setHelpParent(null)
    } else setOverlay(null)
  }
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !overlay && view === 'detail' && !externalOverlayOpen) onClose()
    }
    document.addEventListener('keydown', escape)
    return () => document.removeEventListener('keydown', escape)
  }, [overlay, onClose, view, externalOverlayOpen])
  const contact = (channel: 'chat' | 'phone') => {
    if (policy && onContact) {
      setHelpParent(null)
      setOverlay(null)
      setView('detail')
      onContact(channel, policy.id)
    }
  }
  const openPolicy = (selected: InsurancePolicy) => {
    setPolicyId(selected.id)
    setDetailOrigin('list')
    setView('detail')
    setCompact(false)
    scrollRef.current?.scrollTo?.({ top: 0 })
  }
  const actions = policy ? getInsuranceActions(policy) : []
  const openAction = (action: string) => {
    if (action === 'add-module') setOverlay({ kind: 'add-module' })
    else if (action === 'manage') setOverlay({ kind: 'manage' })
    else if (action === 'documents') setOverlay({ kind: 'documents-quick' })
    else setOverlay({ kind: 'contact' })
  }
  const labels = {
    'add-module': 'Aggiungi modulo',
    manage: 'Gestione polizza',
    documents: 'Documenti',
    contact: 'Contattaci',
  }
  const icons = { 'add-module': a.add, manage: a.settings, documents: a.folder, contact: a.contact }
  const content = () => {
    if (view === 'list' || view === 'inactive')
      return (
        <MobileFirstInsuranceList
          policies={policies}
          favorites={favorites}
          inactive={view === 'inactive'}
          onSave={(ids) => saveInsuranceFavorites(ids, policies)}
          onSelect={openPolicy}
          onClose={back}
          onInactive={() => setView('inactive')}
        />
      )
    if (view === 'catalogue')
      return (
        <InsurancePage title="Le nostre polizze" back onClose={onClose}>
          <div className="mf-ins-catalogue">
            {MOBILE_FIRST_TAB_CONTENT['Polizze assicurative'].products.map((product) => (
              <article key={product.title}>
                <div className="mf-product-commercial-image">
                  <img src={product.image} alt="" style={product.crop as CSSProperties} />
                </div>
                <h3>{product.title}</h3>
                <p>{product.description}</p>
                <InsuranceLink onClick={() => setOverlay({ kind: 'contact', subject: product.title })}>
                  Scopri di più
                </InsuranceLink>
              </article>
            ))}
          </div>
        </InsurancePage>
      )
    if (view === 'documents' && policy)
      return (
        <MobileFirstInsuranceDocuments policy={policy} onClose={onClose} onContact={onContact ? contact : undefined} />
      )
    if (!policy)
      return (
        <InsurancePage title="Polizze assicurative" back onClose={onClose}>
          <p>Scopri le nostre polizze di protezione.</p>
          <InsuranceButton onClick={() => setView('catalogue')}>Scopri i nostri prodotti</InsuranceButton>
        </InsurancePage>
      )
    return (
      <main className="mf-ins-detail" aria-label="Polizza assicurativa">
        <MobileFirstDetailHeader
          className="mf-ins-detail-header"
          onBack={() => (detailOrigin === 'list' ? setView('list') : onClose())}
          amountsHidden={amountsHidden}
          onPrivacy={toggleAmountsHidden}
          onHelp={help}
          onProfile={onProfile ?? (() => setOverlay({ kind: 'profile' }))}
        />
        {compact && (
          <div className="mf-ins-compact" role="region" aria-label="Riepilogo polizza">
            <strong>{policy.name}</strong>
            <span>Numero polizza {policy.number}</span>
          </div>
        )}
        <ScrollableRegion
          ref={scrollRef}
          className="mf-ins-detail-scroll"
          aria-label="Polizza e protezioni"
          onScroll={(event) => setCompact(event.currentTarget.scrollTop >= 330)}
        >
          <div className="mf-ins-detail-tabs" role="tablist" aria-label="Polizze">
            <button
              type="button"
              role="tab"
              aria-selected={detailOrigin === 'direct'}
              onClick={() => {
                setPolicyId(primaryId)
                setDetailOrigin('direct')
                scrollRef.current?.scrollTo?.({ top: 0 })
              }}
            >
              Polizza{detailOrigin === 'direct' && <img src={a.selected} alt="" />}
            </button>
            {active.length === 2 && (
              <button
                type="button"
                role="tab"
                aria-selected={detailOrigin === 'other'}
                onClick={() => {
                  setPolicyId(active.find((p) => p.id !== primaryId)?.id ?? primaryId)
                  setDetailOrigin('other')
                  setCompact(false)
                  scrollRef.current?.scrollTo?.({ top: 0 })
                }}
              >
                Altra polizza{detailOrigin === 'other' && <img src={a.selected} alt="" />}
              </button>
            )}
            {active.length > 2 && (
              <button
                type="button"
                role="tab"
                aria-selected={detailOrigin === 'list'}
                onClick={() => {
                  if (detailOrigin !== 'list') setListReturn({ policyId, origin: detailOrigin })
                  setView('list')
                }}
              >
                Tutte le polizze
                <img src={a.forth} alt="" />
              </button>
            )}
          </div>
          <section className="mf-ins-summary">
            <div>
              <h1>{policy.name}</h1>
              <p>Numero Polizza {policy.number}</p>
              {policy.status === 'inactive' && <span className="mf-ins-status">Non attiva</span>}
            </div>
            <div className="mf-ins-quick-actions">
              {actions.map((action) => (
                <InsuranceQuickAction
                  key={action}
                  label={labels[action]}
                  icon={icons[action]}
                  onClick={() => openAction(action)}
                />
              ))}
            </div>
          </section>
          <section className="mf-ins-detail-section" aria-label="La mia polizza">
            <h2>La mia polizza</h2>
            <div className="mf-ins-field-grid">
              <InsuranceField label="Compagnia">{policy.company}</InsuranceField>
              <InsuranceField label="Numero polizza">{policy.number}</InsuranceField>
              <InsuranceField label="Data decorrenza">{insuranceDate(policy.start)}</InsuranceField>
              <InsuranceField label="Data scadenza">{insuranceDate(policy.expiry)}</InsuranceField>
              <InsuranceField label="Premio">
                <InsuranceAmount value={insurancePremiumCents(policy) / 100} />
              </InsuranceField>
              <InsuranceField label="Tipo premio">{policy.frequency}</InsuranceField>
              <InsuranceField label="Data prossimo pagamento">{insuranceDate(policy.nextPayment)}</InsuranceField>
              <InsuranceField label="Importo prossimo pagamento">
                <InsuranceAmount value={insurancePremiumCents(policy) / 100} />
              </InsuranceField>
              <InsuranceField label="E-mail">{policy.email}</InsuranceField>
            </div>
            <InsuranceLink onClick={() => setOverlay({ kind: 'history' })}>Storico polizza</InsuranceLink>
          </section>
          {policy.modules.length > 0 ? (
            <section className="mf-ins-detail-section" aria-label="I tuoi moduli">
              <h2>I tuoi moduli</h2>
              <div className="mf-ins-module-list">
                {policy.modules.map((module) => (
                  <button
                    type="button"
                    key={module.id}
                    aria-label={`Apri modulo ${module.name}`}
                    onClick={() => setOverlay({ kind: 'module', module })}
                  >
                    <strong>{module.name}</strong>
                    <span>
                      <InsuranceAmount value={module.premium} />
                      <small>Premio</small>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ) : (
            policy.protection && (
              <section className="mf-ins-detail-section mf-ins-protection" aria-label="Dettaglio protezione">
                <h2>Dettaglio protezione</h2>
                <div className="mf-ins-field-grid">
                  <InsuranceField label="Contraente">{policy.protection.holder}</InsuranceField>
                  <InsuranceField label="Assicurato">{policy.protection.insured}</InsuranceField>
                  {policy.protection.capital !== undefined && (
                    <InsuranceField label="Capitale assicurato">
                      <InsuranceAmount value={policy.protection.capital} />
                    </InsuranceField>
                  )}
                  {policy.protection.beneficiary && (
                    <InsuranceField label="Beneficiario">{policy.protection.beneficiary}</InsuranceField>
                  )}
                  <InsuranceField label="Garanzie">{policy.protection.guarantees.join(', ')}</InsuranceField>
                </div>
              </section>
            )
          )}
        </ScrollableRegion>
      </main>
    )
  }
  const quickDocuments = policy ? insuranceDocuments(policy.id).filter((d) => d.date === '2025-04-03') : []
  return (
    <div className="mf-home mf-insurance" lang="it" data-mobile-first-insurance="true">
      {content()}
      {overlay?.kind === 'module' && (
        <MobileFirstInsuranceModule module={overlay.module} onClose={closeOverlay} onHelp={help} />
      )}
      {overlay?.kind === 'history' && policy && (
        <InsurancePage title="Storico polizza" onClose={closeOverlay} onHelp={help}>
          <p>Di seguito sono elencati tutti i tuoi movimenti.</p>
          {policy.history?.map((record) => (
            <div className="mf-ins-history" key={record.id}>
              <span>
                <strong>{record.label}</strong>
                <small>Scadenza il {insuranceDate(record.expiry)}</small>
              </span>
              <span>
                <InsuranceAmount value={record.amount} />
                <small className="mf-ins-collected">{record.status === 'collected' ? 'incassato' : 'in attesa'}</small>
              </span>
            </div>
          ))}
          {!policy.history?.length && <p className="mf-ins-help-copy">Nessun movimento disponibile.</p>}
        </InsurancePage>
      )}
      {overlay?.kind === 'manage' && policy && (
        <InsurancePage title="Gestione Polizza" subtitle={policy.name} onClose={closeOverlay} onHelp={help}>
          <div className="mf-ins-management">
            {INSURANCE_MANAGEMENT_ACTIONS.map((action) => (
              <InsuranceLink
                key={action.id}
                onClick={() =>
                  onManage ? onManage(policy.id, action.id) : setOverlay({ kind: 'contact', subject: action.label })
                }
              >
                {action.label}
              </InsuranceLink>
            ))}
          </div>
        </InsurancePage>
      )}
      {overlay?.kind === 'documents-quick' && (
        <BottomSheet
          title="Documenti"
          showCloseButton={false}
          showDragHandle
          onClose={closeOverlay}
          closeLabel="Chiudi"
          className="mf-ins-quick-documents"
        >
          <div className="mf-ins-quick-document-list">
            {quickDocuments.map((document) => (
              <button type="button" key={document.id} onClick={() => setOverlay({ kind: 'document', document })}>
                <img src={a.document} alt="" />
                <span>
                  <strong>{document.title}</strong>
                  <small>{insuranceDate(document.date)}</small>
                </span>
              </button>
            ))}
          </div>
          <InsuranceLink onClick={() => setOverlay({ kind: 'documents' })}>Vai a tutti i documenti</InsuranceLink>
        </BottomSheet>
      )}
      {overlay?.kind === 'documents' && policy && (
        <MobileFirstInsuranceDocuments
          policy={policy}
          onClose={closeOverlay}
          onContact={onContact ? contact : undefined}
        />
      )}
      {overlay?.kind === 'document' && policy && (
        <InsuranceDocumentPreview
          policy={policy}
          document={overlay.document}
          onClose={() => setOverlay({ kind: 'documents-quick' })}
        />
      )}
      {overlay?.kind === 'help' && (
        <MobileFirstInsuranceHelp onClose={closeOverlay} onContact={onContact ? contact : undefined} />
      )}
      {(overlay?.kind === 'contact' || overlay?.kind === 'add-module') && (
        <MobileFirstInsuranceHelp
          variant="contact"
          subject={overlay.kind === 'add-module' ? 'Aggiungi un modulo alla tua polizza' : overlay.subject}
          onClose={closeOverlay}
          onContact={onContact ? contact : undefined}
        />
      )}
      {overlay?.kind === 'profile' && (
        <InsurancePage title="Profilo" onClose={closeOverlay}>
          <InsuranceButton onClick={toggleAmountsHidden}>
            {amountsHidden ? 'Mostra importi' : 'Nascondi importi'}
          </InsuranceButton>
        </InsurancePage>
      )}
    </div>
  )
}
