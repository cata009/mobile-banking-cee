import type { ReactNode } from 'react'
import type { PrimeCustomerSegment, PrimeReferenceScreen } from '@/features/prime/reference'

export type PrimePresentationMoment = 'discover' | 'connect' | 'benefits'

export interface PrimePresentationModel {
  segment: PrimeCustomerSegment
  serviceActive: boolean
  screen: PrimeReferenceScreen
  moment: PrimePresentationMoment
  isCalling: boolean
  phone: ReactNode
  selectSegment: (segment: PrimeCustomerSegment) => void
  setStandardServiceActive: (active: boolean) => void
  selectMoment: (moment: PrimePresentationMoment) => void
  restart: () => void
  nextMoment: () => void
  previousMoment: () => void
}

export interface PrimePresentationProps {
  mode: 'modal' | 'page'
  presentationUrl: string
  onClose: () => void
}
