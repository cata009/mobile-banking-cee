import { describe, expect, it, vi } from 'vitest'
import { beginPrimeCallPlayback, primeCallTimeline, PRIME_ADVISOR_CALL_AUDIO } from '@/features/prime/callAudio'

describe('PRIME call simulation', () => {
  it('keeps distinct advisor recordings and client greetings for all active segments', () => {
    expect(PRIME_ADVISOR_CALL_AUDIO.prime).toEqual({
      audioSource: '/audio/prime-advisor-iacob-call.mp3',
      clientName: 'Marco',
    })
    expect(PRIME_ADVISOR_CALL_AUDIO.private).toEqual({
      audioSource: '/audio/prime-private-anna-call.mp3',
      clientName: 'Mihaela',
    })
    expect(PRIME_ADVISOR_CALL_AUDIO.standard).toEqual({
      audioSource: '/audio/prime-advisor-david-call.mp3',
      clientName: 'Marco',
    })
  })
  it('rings before answering and only starts the call timer after the answer', () => {
    expect(primeCallTimeline(0)).toEqual({ connected: false, seconds: 0 })
    expect(primeCallTimeline(2999)).toEqual({ connected: false, seconds: 0 })
    expect(primeCallTimeline(3000)).toEqual({ connected: true, seconds: 0 })
    expect(primeCallTimeline(6000)).toEqual({ connected: true, seconds: 3 })
  })

  it('stops and rewinds only its own audio when the user ends or leaves the call', async () => {
    const audio = { play: vi.fn().mockResolvedValue(undefined), pause: vi.fn(), currentTime: 4, volume: 1 }
    const blocked = vi.fn()
    const stop = beginPrimeCallPlayback(audio, blocked)
    expect(audio.play).toHaveBeenCalledOnce()
    stop()
    expect(audio.pause).toHaveBeenCalledOnce()
    expect(audio.currentTime).toBe(0)
    await Promise.resolve()
    expect(blocked).not.toHaveBeenCalled()
  })

  it('offers user playback if autoplay is blocked, but ignores a stale rejection after leaving', async () => {
    const blocked = vi.fn()
    const audio = {
      play: vi.fn().mockRejectedValue(new Error('NotAllowedError')),
      pause: vi.fn(),
      currentTime: 0,
      volume: 1,
    }
    beginPrimeCallPlayback(audio, blocked)
    await Promise.resolve()
    expect(blocked).toHaveBeenCalledOnce()
    blocked.mockClear()
    const stop = beginPrimeCallPlayback(audio, blocked)
    stop()
    await Promise.resolve()
    expect(blocked).not.toHaveBeenCalled()
  })
})
