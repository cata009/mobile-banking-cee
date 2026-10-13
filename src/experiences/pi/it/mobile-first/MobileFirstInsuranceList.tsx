import { useState } from 'react'
import { BottomSheet } from '@/app/components/BottomSheet'
import {
  moveInsuranceFavorite,
  normalizeInsuranceFavorites,
  selectInsuranceFavorite,
  type InsurancePolicy,
} from '@/features/insurance/mobileFirstInsurance'
import { insuranceAssets as a } from './insuranceAssets'
import { InsuranceButton, InsuranceLink, InsurancePage } from './MobileFirstInsurancePrimitives'

export default function MobileFirstInsuranceList({
  policies,
  favorites,
  inactive = false,
  onSave,
  onSelect,
  onClose,
  onInactive,
}: {
  policies: readonly InsurancePolicy[]
  favorites: readonly string[]
  inactive?: boolean
  onSave: (ids: readonly string[]) => void
  onSelect: (policy: InsurancePolicy) => void
  onClose: () => void
  onInactive: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState([...favorites])
  const [confirmation, setConfirmation] = useState<'saved' | 'discard' | null>(null)
  const active = policies.filter((p) => p.status === 'active')
  const ids = normalizeInsuranceFavorites(editing ? draft : favorites, policies)
  const preferred = ids.map((id) => active.find((p) => p.id === id)!).filter(Boolean)
  const others = active
    .filter((p) => !ids.includes(p.id))
    .sort((left, right) => left.name.localeCompare(right.name, 'it'))
  const dirty = JSON.stringify(draft) !== JSON.stringify(favorites)
  const close = () => {
    if (editing && dirty) setConfirmation('discard')
    else if (editing) setEditing(false)
    else onClose()
  }
  const card = (policy: InsurancePolicy, index?: number) => (
    <div className="mf-ins-policy-card" key={policy.id}>
      <button
        type="button"
        className="mf-ins-policy-open"
        aria-label={`Apri polizza ${policy.name} ${policy.number}`}
        disabled={editing}
        onClick={() => onSelect(policy)}
      >
        <strong>{policy.name}</strong>
        <span>Numero polizza {policy.number}</span>
        {policy.status === 'inactive' && <small className="mf-ins-status">Non attiva</small>}
      </button>
      {editing && (
        <>
          <button
            type="button"
            className="mf-ins-favorite"
            aria-label={`Preferita ${policy.name}`}
            aria-pressed={ids.includes(policy.id)}
            onClick={() => setDraft(selectInsuranceFavorite(draft, policy.id, policies))}
          >
            <img src={ids.includes(policy.id) ? a.favorite : a.favoriteOff} alt="" />
          </button>
          {index !== undefined && (
            <div className="mf-ins-order">
              <button
                type="button"
                aria-label={`Sposta in alto ${policy.name}`}
                disabled={index === 0}
                onClick={() => setDraft(moveInsuranceFavorite(draft, index, -1))}
              >
                <img src={index === 0 ? a.upDisabled : a.up} alt="" />
              </button>
              <button
                type="button"
                aria-label={`Sposta in basso ${policy.name}`}
                disabled={index === ids.length - 1}
                onClick={() => setDraft(moveInsuranceFavorite(draft, index, 1))}
              >
                <img src={index === ids.length - 1 ? a.downDisabled : a.down} alt="" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
  return (
    <>
      <div className="mf-ins-list-background" aria-hidden={!!confirmation}>
        <InsurancePage
          title="Tutte le polizze"
          modal={false}
          back
          onClose={close}
          footer={
            !inactive &&
            (editing ? (
              <InsuranceButton
                disabled={!dirty}
                onClick={() => {
                  onSave(draft)
                  setConfirmation('saved')
                }}
              >
                Salva modifica
              </InsuranceButton>
            ) : (
              <InsuranceLink
                icon={a.edit}
                onClick={() => {
                  setDraft([...favorites])
                  setEditing(true)
                }}
              >
                Personalizza vista
              </InsuranceLink>
            ))
          }
        >
          {inactive ? (
            <section aria-label="Polizze non attive">
              <h3>Polizze non attive</h3>
              <div className="mf-ins-policy-list">
                {policies.filter((p) => p.status === 'inactive').map((p) => card(p))}
              </div>
            </section>
          ) : (
            <>
              <section aria-label="Preferite">
                <h3>Preferite</h3>
                {editing && (
                  <p className="mf-ins-instruction">
                    Puoi spostare i tuoi preferiti per posizionarli secondo l'ordine desiderato.
                  </p>
                )}
                <div className="mf-ins-policy-list">{preferred.map((p, i) => card(p, i))}</div>
                {preferred.length === 0 && <p className="mf-ins-instruction">Seleziona le tue polizze preferite.</p>}
              </section>
              <section className="mf-ins-list-section" aria-label="Tutte">
                <h3>Tutte</h3>
                <div className="mf-ins-policy-list">{others.map((p) => card(p))}</div>
              </section>
              {!editing && policies.some((p) => p.status === 'inactive') && (
                <div className="mf-ins-centered">
                  <InsuranceLink onClick={onInactive}>Polizze non attive</InsuranceLink>
                </div>
              )}
            </>
          )}
        </InsurancePage>
      </div>
      {confirmation && (
        <BottomSheet
          title={confirmation === 'saved' ? 'Modifiche salvate' : 'Attenzione'}
          showCloseButton={false}
          className="mf-ins-confirmation"
          onClose={() => setConfirmation(null)}
          footer={
            <div className="mf-ins-confirmation-actions">
              {confirmation === 'saved' ? (
                <InsuranceButton
                  onClick={() => {
                    setConfirmation(null)
                    setEditing(false)
                  }}
                >
                  Chiudi
                </InsuranceButton>
              ) : (
                <>
                  <InsuranceButton
                    onClick={() => {
                      setDraft([...favorites])
                      setConfirmation(null)
                      setEditing(false)
                    }}
                  >
                    Prosegui
                  </InsuranceButton>
                  <InsuranceButton secondary onClick={() => setConfirmation(null)}>
                    Annulla
                  </InsuranceButton>
                </>
              )}
            </div>
          }
        >
          <img className="mf-ins-confirmation-icon" src={confirmation === 'saved' ? a.success : a.warning} alt="" />
          <p>
            {confirmation === 'saved'
              ? 'Le modifiche di personalizzazione delle tue polizze sono avvenute con successo.'
              : 'Le modifiche non sono state salvate. Vuoi uscire senza salvare?'}
          </p>
        </BottomSheet>
      )}
    </>
  )
}
