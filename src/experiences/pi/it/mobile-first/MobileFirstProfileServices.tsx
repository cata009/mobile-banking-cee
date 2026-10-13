import { useState } from 'react'
import { profileServicesStore } from '../../../../features/profile/mobileFirstProfileServices'
import {
  initialServiceDocuments,
  initialProfileNotices,
  initialProfileMessages,
  initialProfilePractices,
  initialServiceAppointments,
} from './profileServicesContent'
import MobileFirstProfileServicesBank from './MobileFirstProfileServicesBank'
import MobileFirstProfileServicesDocuments from './MobileFirstProfileServicesDocuments'
import MobileFirstProfileServicesCommunications from './MobileFirstProfileServicesCommunications'
import MobileFirstProfileServicesSupport from './MobileFirstProfileServicesSupport'
import './mobile-first-profile-services.css'

profileServicesStore.initialize({
  documents: initialServiceDocuments,
  notices: initialProfileNotices,
  messages: initialProfileMessages,
  practices: initialProfilePractices,
  appointments: initialServiceAppointments,
})

export type ProfileServiceEntry = 'support' | 'bank' | 'appointments' | 'documents' | 'communications'
export type ProfileAdvisorKind = 'branch' | 'remote' | 'private' | 'cfe'
export type ProfileServicesNavigate = (target: string, id?: string) => void
export interface MobileFirstProfileServicesProps {
  entry?: ProfileServiceEntry
  communicationTab?: number
  initialItemId?: string
  initialDetail?: string
  advisorKind?: ProfileAdvisorKind
  onNavigate?: ProfileServicesNavigate
  onBack: () => void
  onClose: () => void
}
export default function MobileFirstProfileServices({
  entry = 'support',
  communicationTab = 0,
  initialItemId,
  initialDetail,
  advisorKind = 'branch',
  onNavigate,
  onBack,
  onClose,
}: MobileFirstProfileServicesProps) {
  const [area, setArea] = useState(entry)
  const back = () => (area === entry ? onBack() : setArea(entry))
  const navigate = (target: string, id?: string) => {
    if (['support', 'bank', 'appointments', 'documents', 'communications'].includes(target))
      setArea(target as ProfileServiceEntry)
    else onNavigate?.(target, id)
  }
  if (area === 'documents')
    return (
      <MobileFirstProfileServicesDocuments privateClient={advisorKind === 'private'} onBack={back} onClose={onClose} />
    )
  if (area === 'communications')
    return (
      <MobileFirstProfileServicesCommunications
        initialTab={communicationTab}
        initialItemId={initialItemId ?? initialDetail}
        onBack={back}
        onClose={onClose}
        onNavigate={onNavigate ? navigate : undefined}
      />
    )
  if (area === 'bank' || area === 'appointments')
    return (
      <MobileFirstProfileServicesBank
        key={area}
        initialBooking={area === 'appointments'}
        advisorKind={advisorKind}
        onBack={back}
        onClose={onClose}
      />
    )
  return <MobileFirstProfileServicesSupport onBack={back} onClose={onClose} onNavigate={navigate} />
}
