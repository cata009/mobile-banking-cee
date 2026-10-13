import { useState, useSyncExternalStore } from 'react'
import {
  getContactsSnapshot,
  subscribeProfileData,
  saveContact,
  removeContact,
  setContactFavorite,
  mergeContacts,
  validateContact,
  previewContactMerge,
  canAddContactRelationship,
  type ProfileContact,
  type ContactRelationship,
} from '@/features/profile/mobileFirstProfileData'
import { ProfilePage, ProfileButton, ProfileField } from './MobileFirstProfilePrimitives'
import { DataAuthorize, DataCheck, DataSelect, DataSuccess } from './MobileFirstProfileDataPrimitives'
import { providers } from './profileDataContent'
import { profileDataAssets as assets } from './profileDataAssets'

function newContact(): ProfileContact {
  return {
    id: `contact-${Date.now()}`,
    name: '',
    alias: '',
    address: '',
    postal: '',
    city: '',
    province: '',
    favorite: false,
    own: false,
    relationships: [],
  }
}
function relationshipName(type: ContactRelationship['type']) {
  return type === 'account' ? 'Conto' : type === 'card' ? 'Carta prepagata' : 'Cellulare'
}
export function MobileFirstProfileDataContacts({ onBack, onClose }: { onBack: () => void; onClose: () => void }) {
  const contacts = useSyncExternalStore(subscribeProfileData, getContactsSnapshot, getContactsSnapshot)
  const [phase, setPhase] = useState<
      'list' | 'detail' | 'edit' | 'delete' | 'quick' | 'merge' | 'merge-review' | 'auth' | 'success'
    >('list'),
    [contact, setContact] = useState<ProfileContact>(newContact),
    [query, setQuery] = useState(''),
    [error, setError] = useState(''),
    [relationshipType, setRelationshipType] = useState(''),
    [mergeIds, setMergeIds] = useState<string[]>([]),
    [mergeEditing, setMergeEditing] = useState(false),
    [pending, setPending] = useState<'save' | 'quick' | 'merge' | 'delete'>('save')
  const set = <K extends keyof ProfileContact>(key: K, value: ProfileContact[K]) => {
    setContact((c) => ({ ...c, [key]: value }))
    setError('')
  }
  const relation = (index: number, key: keyof ContactRelationship, value: string) =>
    set(
      'relationships',
      contact.relationships.map((r, i) => (i === index ? { ...r, [key]: value } : r)),
    )
  const selected = mergeIds.map((id) => contacts.find((c) => c.id === id)).filter((c): c is ProfileContact => !!c)
  const resetMergeDraft = () => {
    setMergeEditing(false)
    setContact(newContact())
    setError('')
    setRelationshipType('')
  }
  const cancelEdit = () => {
    setError('')
    setRelationshipType('')
    if (mergeEditing) {
      setContact(previewContactMerge(mergeIds[0]!, mergeIds[1]!))
      setMergeEditing(false)
      setPhase('merge-review')
      return
    }
    const saved = contacts.find((c) => c.id === contact.id)
    if (saved) {
      setContact({ ...saved, relationships: saved.relationships.map((r) => ({ ...r })) })
      setPhase('detail')
    } else {
      setContact(newContact())
      back()
    }
  }
  const back = () => {
    setPhase('list')
    setError('')
    setMergeEditing(false)
  }
  const confirm = () => {
    try {
      if (pending === 'save') {
        const issue = saveContact(contact)
        if (issue) {
          setError(issue)
          setPhase('edit')
          return
        }
      } else if (pending === 'quick') setContactFavorite(contact.id, !contact.favorite)
      else mergeContacts(mergeIds[0]!, mergeIds[1]!, mergeEditing ? contact : undefined)
      setPhase('success')
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : 'Controlla i dati del contatto.')
      setPhase('merge-review')
    }
  }
  if (phase === 'auth')
    return (
      <DataAuthorize
        onBack={() => setPhase(pending === 'merge' ? 'merge-review' : pending === 'quick' ? 'quick' : 'edit')}
        onClose={onClose}
        onConfirm={confirm}
      />
    )
  if (phase === 'success')
    return (
      <DataSuccess onClose={onClose} onContinue={back}>
        {pending === 'merge'
          ? 'I contatti sono stati uniti.'
          : pending === 'quick'
            ? `Operazioni veloci ${contact.favorite ? 'disattivate' : 'attivate'}.`
            : pending === 'delete'
              ? 'Il contatto è stato eliminato.'
              : 'Il contatto è stato salvato.'}
      </DataSuccess>
    )
  if (phase === 'delete')
    return (
      <ProfilePage
        title="Sei sicuro di voler eliminare il contatto?"
        onBack={() => setPhase('detail')}
        onClose={onClose}
        footer={
          <>
            <ProfileButton
              onClick={() => {
                removeContact(contact.id)
                setPending('delete')
                setPhase('success')
              }}
            >
              Conferma
            </ProfileButton>
            <ProfileButton secondary onClick={() => setPhase('detail')}>
              Annulla
            </ProfileButton>
          </>
        }
      >
        <p>{contact.name}</p>
      </ProfilePage>
    )
  if (phase === 'quick')
    return (
      <ProfilePage
        title={`Operazioni Veloci: ${contact.favorite ? 'Disabilitazione' : 'Abilitazione'} beneficiario`}
        onBack={() => setPhase('detail')}
        onClose={onClose}
        footer={
          <ProfileButton
            onClick={() => {
              setPending('quick')
              setPhase('auth')
            }}
          >
            Continua
          </ProfileButton>
        }
      >
        <p>
          Stai {contact.favorite ? 'disabilitando' : 'abilitando'} le Operazioni Veloci verso il beneficiario:{' '}
          <strong>{contact.name}</strong>
        </p>
        {contact.relationships.map((r, index) => (
          <div className="mfpd-group" key={index}>
            <strong>{relationshipName(r.type)}</strong>
            <p>{r.value}</p>
            {r.provider && <p>{r.provider}</p>}
            {r.cardType && <p>{r.cardType}</p>}
          </div>
        ))}
      </ProfilePage>
    )
  if (phase === 'merge' || phase === 'merge-review')
    return (
      <ProfilePage
        title="Unisci contatti"
        onBack={() => {
          if (phase === 'merge-review') {
            resetMergeDraft()
            setPhase('merge')
          } else back()
        }}
        onClose={onClose}
        footer={
          <ProfileButton
            disabled={mergeIds.length !== 2}
            onClick={() => {
              if (phase === 'merge') setPhase('merge-review')
              else {
                setPending('merge')
                setPhase('auth')
              }
            }}
          >
            {phase === 'merge' ? 'Continua' : 'Conferma'}
          </ProfileButton>
        }
      >
        {phase === 'merge' ? (
          <>
            <p>Seleziona due contatti da unire. I rapporti saranno associati al primo nominativo selezionato.</p>
            {contacts.map((c) => (
              <DataCheck
                key={c.id}
                checked={mergeIds.includes(c.id)}
                onChange={(checked) => {
                  resetMergeDraft()
                  setMergeIds(checked ? [...mergeIds, c.id].slice(-2) : mergeIds.filter((id) => id !== c.id))
                }}
              >
                {c.name}
              </DataCheck>
            ))}
          </>
        ) : (
          <>
            <h2 className="mfpd-section-title">Riepilogo</h2>
            <p>
              Nominativo: <strong>{mergeEditing ? contact.name : selected[0]?.name}</strong>
            </p>
            <p>
              Contatto da unire: <strong>{selected[1]?.name}</strong>
            </p>
            {selected
              .flatMap((c) => c.relationships)
              .map((r, i) => (
                <div className="mfpd-group" key={i}>
                  <strong>{relationshipName(r.type)}</strong>
                  <p>{r.value}</p>
                  <p>{r.provider ?? r.cardType ?? r.bic}</p>
                </div>
              ))}
            {error && (
              <p role="alert" className="mfpd-error">
                {error}
              </p>
            )}
            <ProfileButton
              secondary
              onClick={() => {
                setContact(previewContactMerge(mergeIds[0]!, mergeIds[1]!))
                setMergeEditing(true)
                setPhase('edit')
              }}
            >
              Modifica
            </ProfileButton>
          </>
        )}
      </ProfilePage>
    )
  if (phase === 'edit')
    return (
      <ProfilePage
        title={contacts.some((c) => c.id === contact.id) ? 'Modifica contatto' : 'Nuovo contatto'}
        onBack={cancelEdit}
        onClose={onClose}
        footer={
          <ProfileButton
            disabled={!contact.name.trim() || !contact.relationships.length}
            onClick={() => {
              const issue = validateContact(contact)
              if (issue) setError(issue)
              else {
                setPending(mergeEditing ? 'merge' : 'save')
                setPhase('auth')
              }
            }}
          >
            Salva
          </ProfileButton>
        }
      >
        <div className="mfpd-form">
          <h2 className="mfpd-section-title">Dati anagrafici</h2>
          {(['name', 'alias', 'address', 'postal', 'city', 'province'] as const).map((key, index) => (
            <ProfileField
              key={key}
              label={['Nominativo', 'Alias', 'Indirizzo', 'Codice Postale', 'Città', 'Provincia'][index]!}
              value={contact[key]}
              onChange={(e) => set(key, e.target.value)}
            />
          ))}
          {contact.relationships.map((r, index) => (
            <div className="mfpd-form" key={index}>
              <div className="mfpd-data-row">
                <h2 className="mfpd-section-title">{relationshipName(r.type)}</h2>
                <button
                  className="mfpd-link"
                  onClick={() =>
                    set(
                      'relationships',
                      contact.relationships.filter((_, i) => i !== index),
                    )
                  }
                >
                  ELIMINA {relationshipName(r.type)}
                </button>
              </div>
              <ProfileField
                label={
                  r.type === 'account'
                    ? 'IBAN o Coordinate bancarie'
                    : r.type === 'card'
                      ? 'Numero di carta UniCredit'
                      : 'Numero di cellulare'
                }
                value={r.value}
                onChange={(e) => relation(index, 'value', e.target.value.toUpperCase())}
              />
              {r.type === 'account' && (
                <>
                  <ProfileField
                    label="BIC"
                    value={r.bic ?? ''}
                    onChange={(e) => relation(index, 'bic', e.target.value.toUpperCase())}
                  />
                  {r.value && !r.value.replace(/\s/g, '').startsWith('IT') && (
                    <>
                      <ProfileField
                        label="Città del conto estero"
                        value={r.city ?? ''}
                        onChange={(e) => relation(index, 'city', e.target.value)}
                      />
                      <DataSelect
                        label="Paese"
                        value={r.country ?? ''}
                        options={[
                          'Stati Uniti',
                          'Romania',
                          'Repubblica Ceca',
                          'Germania',
                          'Francia',
                          'Spagna',
                          'Regno Unito',
                          'Altro',
                        ]}
                        onChange={(v) => relation(index, 'country', v)}
                      />
                    </>
                  )}
                </>
              )}
              {r.type === 'card' && (
                <DataSelect
                  label="Tipo di carta UniCredit"
                  value={r.cardType ?? ''}
                  options={['Genius', 'Genius Pay', 'Genius Card']}
                  onChange={(v) => relation(index, 'cardType', v)}
                />
              )}
              {r.type === 'mobile' && (
                <DataSelect
                  label="Operatore telefonico"
                  value={r.provider ?? ''}
                  options={providers}
                  onChange={(v) => relation(index, 'provider', v)}
                />
              )}
            </div>
          ))}
          <h2 className="mfpd-section-title">Info rapporto</h2>
          <DataSelect
            label="Rapporto"
            value={relationshipType}
            options={['Conto', 'Carta prepagata', 'Cellulare']}
            onChange={setRelationshipType}
          />
          <ProfileButton
            secondary
            disabled={!relationshipType}
            onClick={() => {
              const type =
                relationshipType === 'Conto' ? 'account' : relationshipType === 'Carta prepagata' ? 'card' : 'mobile'
              if (!canAddContactRelationship(contact.relationships, type)) {
                setError('È possibile associare solo IBAN italiani a rapporti di cellulare e/o carta prepagata.')
                return
              }
              set('relationships', [...contact.relationships, { type, value: '' }])
              setRelationshipType('')
            }}
          >
            Aggiungi rapporto
          </ProfileButton>
          {error && (
            <p role="alert" className="mfpd-error">
              {error}
            </p>
          )}
        </div>
      </ProfilePage>
    )
  if (phase === 'detail')
    return (
      <ProfilePage title={contact.name} onBack={back} onClose={onClose}>
        <div className="mfpd-quick-actions">
          <button onClick={() => setPhase('edit')}>
            <img src={assets.contactEdit} alt="" />
            Modifica contatto
          </button>
          <button onClick={() => setPhase('quick')}>
            <img src={assets.contactQuick} alt="" />
            {contact.favorite ? 'Disattiva' : 'Attiva'} operazioni veloci
          </button>
          <button onClick={() => setPhase('delete')}>
            <img src={assets.contactDelete} alt="" />
            Elimina contatto
          </button>
        </div>
        <h2 className="mfpd-section-title">Dati anagrafici</h2>
        <div className="mfpd-group">
          <p>
            Nominativo
            <br />
            <strong>{contact.name}</strong>
          </p>
          <p>
            Alias
            <br />
            <strong>{contact.alias || '---'}</strong>
          </p>
          {contact.address && (
            <p>
              {contact.address}, {contact.postal} {contact.city} {contact.province}
            </p>
          )}
        </div>
        <h2 className="mfpd-section-title">Dati conto</h2>
        {contact.relationships.map((r, index) => (
          <div className="mfpd-group" key={index}>
            <strong>{relationshipName(r.type)}</strong>
            <p>{r.value}</p>
            <p>{r.provider ?? r.cardType ?? r.bic}</p>
          </div>
        ))}
      </ProfilePage>
    )
  const filtered = contacts.filter((c) =>
    `${c.name} ${c.alias} ${c.relationships.map((r) => r.value).join(' ')}`
      .toLocaleLowerCase('it')
      .includes(query.toLocaleLowerCase('it')),
  )
  const card = (c: ProfileContact) => (
    <button
      key={c.id}
      className="mfpd-contact"
      onClick={() => {
        setContact({ ...c, relationships: c.relationships.map((r) => ({ ...r })) })
        setPhase('detail')
      }}
    >
      <span className="mfpd-avatar">
        {c.name
          .split(' ')
          .map((w) => w[0])
          .slice(0, 2)
          .join('')}
      </span>
      <strong>{c.name}</strong>
      {c.favorite && <img src={assets.imgHomeBankingAndPaymentsFastPaymentsK10} alt="Operazioni veloci attive" />}
    </button>
  )
  return (
    <ProfilePage className="mfpd-contacts-page" title="Rubrica" onBack={onBack} onClose={onClose}>
      <div className="mfpd-search">
        <img src={assets.imgNavigationAndActionSearchK10} alt="" />
        <ProfileField
          label="Cerca"
          value={query}
          placeholder="Cerca..."
          type="search"
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="mfpd-quick-actions">
        <button
          onClick={() => {
            setContact(newContact())
            setPhase('edit')
          }}
        >
          <img src={assets.imgNavigationAndActionAddK10} alt="" />
          Nuovo contatto
        </button>
        <button
          onClick={() => {
            setMergeIds([])
            setPhase('merge')
          }}
        >
          <img src={assets.imgNavigationAndActionMergeContactsK10} alt="" />
          Unisci contatti
        </button>
      </div>
      {filtered.length ? (
        <>
          <h2 className="mfpd-section-title">I miei conti</h2>
          {filtered.filter((c) => c.own).map(card)}
          <h2 className="mfpd-section-title">Beneficiari veloci</h2>
          {filtered.filter((c) => c.favorite).map(card)}
          <h2 className="mfpd-section-title">Altri beneficiari</h2>
          {filtered
            .filter((c) => !c.favorite)
            .sort((a, b) => a.name.localeCompare(b.name, 'it'))
            .map((c, index, list) => (
              <div key={c.id}>
                {index === 0 || c.name[0] !== list[index - 1]?.name[0] ? (
                  <p className="mfpd-contact-letter">{c.name[0]}</p>
                ) : null}
                {card(c)}
              </div>
            ))}
        </>
      ) : (
        <p role="status">Nessun contatto trovato</p>
      )}
    </ProfilePage>
  )
}
