import { useState } from 'react'
import { MobileFirstProfileDataPersonal } from './MobileFirstProfileDataPersonal'
import { MobileFirstProfileDataContacts } from './MobileFirstProfileDataContacts'
import { MobileFirstProfileDataIdentity } from './MobileFirstProfileDataIdentity'
import './mobile-first-profile-data.css'
export default function MobileFirstProfileData({
  entry = 'personal',
  onBack,
  onClose,
}: {
  entry?: 'personal' | 'contacts' | 'identity'
  onBack: () => void
  onClose: () => void
}) {
  const [section, setSection] = useState(entry)
  const [identityDocumentId, setIdentityDocumentId] = useState<string>()
  if (section === 'contacts') return <MobileFirstProfileDataContacts onBack={onBack} onClose={onClose} />
  if (section === 'identity')
    return (
      <MobileFirstProfileDataIdentity
        initialDocumentId={identityDocumentId}
        onBack={() => (entry === 'identity' ? onBack() : setSection('personal'))}
        onClose={onClose}
      />
    )
  return (
    <MobileFirstProfileDataPersonal
      onBack={onBack}
      onClose={onClose}
      onIdentity={(documentId) => {
        setIdentityDocumentId(documentId)
        setSection('identity')
      }}
    />
  )
}
