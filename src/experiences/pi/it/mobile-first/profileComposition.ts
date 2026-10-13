import { profileServicesStore } from '@/features/profile/mobileFirstProfileServices'
import {
  initialServiceDocuments,
  initialProfileNotices,
  initialProfileMessages,
  initialProfilePractices,
  initialServiceAppointments,
} from './profileServicesContent'
import { PROFILE_ACTIVITIES } from './profileContent'

const activities = PROFILE_ACTIVITIES.Notifiche!
const messages = PROFILE_ACTIVITIES.Messaggi!

// Select a coherent initial customer snapshot for the hub and its detail areas.
// Individual Figma frames use illustrative snapshots; the composed session shares IDs.
export function initializeProfileComposition() {
  profileServicesStore.initialize({
    documents: initialServiceDocuments.map((item) => (item.id === 'f24' ? { ...item, read: true } : item)),
    notices: [
      ...initialProfileNotices.map((item) => {
        const activity = activities.find((activity) => activity.id === item.id)
        return activity
          ? { ...item, title: activity.title, category: activity.category, read: item.id === 'bank-access' }
          : item
      }),
      ...[
        { id: 'approve-transfer', title: 'Autorizza Bonifico Sepa', category: 'Pagamenti', date: '2025-03-14' },
        { id: 'approve-card', title: 'Autorizza Transazione', category: 'Pagamenti', date: '2025-03-14' },
        {
          id: 'master',
          title: 'Autorizza Bonifico Sepa da dispositivo secondario',
          category: 'Sicurezza',
          date: '2025-03-14',
        },
        { id: 'slave', title: 'Notifica inviata al dispositivo principale', category: 'Sicurezza', date: '2025-03-14' },
      ].map((item) => ({ ...item, read: true, archived: false })),
    ],
    messages: [
      ...initialProfileMessages.map((item) => {
        const activity = messages.find((activity) => activity.id === item.id)
        return activity ? { ...item, title: activity.title, date: `2025-01-${activity.day}` } : item
      }),
      {
        id: 'message-croatia',
        title: messages[0]!.title,
        body: messages[0]!.title,
        category: 'Comunicazioni',
        date: '2025-01-23',
        read: false,
        archived: false,
      },
    ],
    practices: initialProfilePractices,
    appointments: initialServiceAppointments,
  })
}
