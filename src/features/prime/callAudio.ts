export const PRIME_CALL_CONNECT_MS = 3000
export const PRIME_CZ_CONTACT_NUMBER = '+420 221 210 031'
export const PRIME_CZ_CONTACT_SOURCE = 'https://www.unicreditbank.cz/en/obcane/kontakty.html'
export const PRIME_CALL_TRANSCRIPT =
  "Good morning Teodora, I'm Emma from UniCredit and I see you're interested in Prime, a more personal banking experience with dedicated advice. Dear audience, this was a short preview of the Prime experience. Thank you."

export interface PrimeCallConfiguration {
  name: string
  number: string
  clientName: string
  audioSource: string
  subtitle?: string
  contactTitle?: string
}

export const PRIME_SERVICE_CALL_CONFIGURATION: PrimeCallConfiguration = {
  name: 'UniCredit',
  number: PRIME_CZ_CONTACT_NUMBER,
  clientName: 'Teodora',
  audioSource: '/audio/prime-upgrade-call.mp3',
  subtitle: 'UniCredit · Czechia',
  contactTitle: 'UniCredit Customer Service Centre',
}

/** Separate recordings greet the client; the advisor identity still comes from Source. */
export const PRIME_ADVISOR_CALL_AUDIO = {
  prime: { audioSource: '/audio/prime-advisor-iacob-call.mp3', clientName: 'Marco' },
  private: { audioSource: '/audio/prime-private-anna-call.mp3', clientName: 'Mihaela' },
  standard: { audioSource: '/audio/prime-advisor-david-call.mp3', clientName: 'Marco' },
} as const

export function primeCallTimeline(elapsedMilliseconds: number) {
  return {
    connected: elapsedMilliseconds >= PRIME_CALL_CONNECT_MS,
    seconds: Math.max(0, Math.floor((elapsedMilliseconds - PRIME_CALL_CONNECT_MS) / 1000)),
  }
}

export interface PrimeCallAudioPlayer {
  play: () => Promise<void> | undefined
  pause: () => void
  currentTime: number
  volume: number
}

/** One call owns one player; late autoplay rejection cannot revive an ended call. */
export function beginPrimeCallPlayback(audio: PrimeCallAudioPlayer, onBlocked: () => void) {
  let stopped = false
  try {
    audio.play()?.catch(() => {
      if (!stopped) onBlocked()
    })
  } catch {
    onBlocked()
  }
  return () => {
    stopped = true
    audio.pause()
    audio.currentTime = 0
  }
}
