import { describe, expect, it } from 'vitest'
import {
  appointmentErrors,
  canSignPractice,
  filterServiceItems,
  documentFilterError,
  updateServiceItems,
  createServiceDemoPdf,
  createProfileServicesStore,
  authorizeServiceSignature,
  restartServiceAuthorization,
  canManageServiceAppointment,
  servicePracticeSignatureError,
  authorizeServicePracticeSignature,
} from '../../src/features/profile/mobileFirstProfileServices'
import { profileSettingsStore } from '../../src/features/profile/mobileFirstProfileSettings'

describe('Mobile First profile service policies', () => {
  it('requires an appointment purpose and notes for other operations', () => {
    expect(
      appointmentErrors({
        branch: 'Milano',
        category: 'Altre operazioni',
        purpose: 'Altro',
        date: '2025-03-06',
        time: '12:00',
        notes: '',
      }),
    ).toContain('Per la categoria selezionata, il campo Note è obbligatorio.')
    expect(
      appointmentErrors({
        branch: 'Milano',
        category: 'Conto, Carte e Servizi digitali',
        purpose: 'Informazioni / apertura',
        date: '2025-03-06',
        time: '12:00',
        notes: '',
      }),
    ).toEqual([])
  })
  it('restricts investment and advice document ranges to one month', () => {
    expect(
      documentFilterError({ category: 'Investimenti e trading', start: '2025-01-01', end: '2025-03-01' }),
    ).toBeTruthy()
    expect(documentFilterError({ category: 'Conti correnti', start: '2025-01-01', end: '2025-03-01' })).toBe('')
    expect(documentFilterError({ category: '', start: '2025-03-01', end: '2025-01-01' })).toBeTruthy()
  })
  it('clamps one calendar month to the destination month end', () => {
    expect(documentFilterError({ category: 'Investimenti e trading', start: '2025-01-31', end: '2025-02-28' })).toBe('')
    expect(
      documentFilterError({ category: 'Investimenti e trading', start: '2025-01-31', end: '2025-03-01' }),
    ).toContain('1 mese')
    expect(documentFilterError({ category: 'Consulenze', start: '2024-01-31', end: '2024-02-29' })).toBe('')
    expect(documentFilterError({ category: 'Consulenze', start: '2024-01-31', end: '2024-03-01' })).toContain('1 mese')
    expect(documentFilterError({ category: 'In primo piano', start: '2024-08-31', end: '2025-03-01' })).toContain(
      '6 mesi',
    )
  })
  it('applies text, category, ownership, dates and archive independently', () => {
    const items = [
      {
        id: '1',
        title: 'Estratto conto',
        category: 'Conti correnti',
        date: '2025-01-13',
        owner: 'Andrea',
        read: false,
        archived: false,
      },
      { id: '2', title: 'Carta', category: 'Carte', date: '2025-03-01', owner: 'Sara', read: false, archived: true },
    ]
    expect(
      filterServiceItems(items, { query: 'estratto', owner: 'Andrea', start: '2025-01-01', end: '2025-02-01' }).map(
        (i) => i.id,
      ),
    ).toEqual(['1'])
    expect(updateServiceItems(items, ['1'], 'read')[0]?.read).toBe(true)
    expect(updateServiceItems(items, ['1'], 'archive')[0]?.archived).toBe(true)
    expect(canSignPractice(false, '246810')).toBe(false)
    expect(canSignPractice(true, '246810')).toBe(true)
    expect(canSignPractice(true, '123')).toBe(false)
  })
  it('uses canonical authorization and does not sign an unread interview', () => {
    restartServiceAuthorization()
    expect(authorizeServiceSignature(false, '12345678').valid).toBe(false)
    expect(authorizeServiceSignature(true, '111111').valid).toBe(false)
    expect(authorizeServiceSignature(true, '12345678').valid).toBe(true)
  })
  it('keeps service updates in the feature store and resets to fixtures', () => {
    const fixtures = { documents: [], notices: [], messages: [], practices: [], appointments: [] }
    const store = createProfileServicesStore(fixtures)
    const changes: number[] = []
    const unsubscribe = store.subscribe(() => changes.push(store.getSnapshot().documents.length))
    store.initialize(fixtures)
    store.update('documents', () => [
      { id: '1', title: 'Demo', category: 'Conti', date: '2025-01-01', read: false, archived: false },
    ])
    expect(store.getSnapshot().documents).toHaveLength(1)
    store.initialize(fixtures)
    expect(store.getSnapshot().documents).toHaveLength(1)
    store.reset()
    expect(store.getSnapshot().documents).toEqual([])
    expect(changes).toEqual([1, 0])
    unsubscribe()
  })
  it('resolves suspended certificate expiry through the canonical 90-day rule', () => {
    const settings = { signature: 'Sospesa' as const, signatureSuspendedAt: '2025-01-01T12:00:00Z' }
    expect(servicePracticeSignatureError(settings, new Date('2025-01-31T12:00:00Z'))).toContain('sospesa')
    expect(servicePracticeSignatureError(settings, new Date('2025-04-01T12:00:00Z'))).toContain('non è attiva')
    expect(servicePracticeSignatureError({ signature: 'Attiva' })).toBe('')
  })
  it('guards actual practice signature without restricting generic delivery authorization', () => {
    profileSettingsStore.reset()
    profileSettingsStore.update({ signature: 'Revocata' })
    expect(authorizeServicePracticeSignature(true, '12345678').valid).toBe(false)
    expect(authorizeServiceSignature(true, '12345678').valid).toBe(true)
    profileSettingsStore.reset()
    expect(authorizeServicePracticeSignature(true, '12345678').valid).toBe(true)
  })
  it('exports a valid local facsimile PDF rather than a real contract', async () => {
    const blob = createServiceDemoPdf('Titolarità conto', ['Andrea Rossini', 'IT 123456789000000012'])
    const pdf = await blob.text()
    expect(blob.type).toBe('application/pdf')
    expect(pdf.startsWith('%PDF-1.4')).toBe(true)
    expect(pdf).toContain('FACSIMILE')
    expect(pdf).toContain('startxref')
    expect(pdf).toContain('%%EOF')
  })
  it('enforces the 24-hour appointment management window', () => {
    const appointment = {
      id: '1',
      branch: 'Milano',
      category: 'Conti',
      purpose: 'Informazioni',
      date: '2025-03-06',
      time: '12:00',
      notes: '',
      status: 'Da eseguire' as const,
    }
    expect(canManageServiceAppointment(appointment, new Date('2025-03-05T11:59:00Z'))).toBe(true)
    expect(canManageServiceAppointment(appointment, new Date('2025-03-05T12:00:00Z'))).toBe(false)
    expect(canManageServiceAppointment({ ...appointment, status: 'Cancellato' })).toBe(false)
  })
})
