import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Text } from '../universal/Typography';
import { beginPrimeCallPlayback, PRIME_SERVICE_CALL_CONFIGURATION } from '@/features/prime/callAudio';

export function PrimeCallAudio({ speaker, audioSource = PRIME_SERVICE_CALL_CONFIGURATION.audioSource, onElapsed, onFinished }: { speaker: boolean; audioSource?: string; onElapsed: (milliseconds: number) => void; onFinished: (milliseconds: number) => void }) {
  const [blocked, setBlocked] = useState(false);
  const player = useRef<HTMLAudioElement | null>(null);
  const generation = useRef(0);
  useEffect(() => {
    const audio = player.current;
    if (!audio) return;
    generation.current += 1;
    setBlocked(false);
    audio.volume = 0.6;
    const stop = beginPrimeCallPlayback(audio, () => setBlocked(true));
    return () => { generation.current += 1; stop(); };
  }, [audioSource]);
  useEffect(() => { if (player.current) player.current.volume = speaker ? 1 : 0.6; }, [speaker]);
  return <>
    <audio ref={player} src={audioSource} preload="auto" aria-hidden="true" data-testid="prime-call-audio" style={{ display: 'none' }} onTimeUpdate={event => onElapsed(event.currentTarget.currentTime * 1000)} onEnded={event => onFinished(event.currentTarget.currentTime * 1000)} />
    {blocked && <Pressable accessibilityRole="button" accessibilityLabel="Play call audio" onPress={() => { const request = generation.current; setBlocked(false); player.current?.play()?.catch(() => { if (request === generation.current) setBlocked(true); }); }} style={s.play}><Text style={s.label}>Play call audio</Text></Pressable>}
  </>;
}
const s = StyleSheet.create({ play: { position: 'absolute', top: 240, alignSelf: 'center', padding: 12, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', zIndex: 5 }, label: { color: 'white', fontSize: 16 } });
