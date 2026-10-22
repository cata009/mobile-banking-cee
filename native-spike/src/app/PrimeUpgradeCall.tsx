import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { Text } from '../universal/Typography';
import { ModalPanel } from '../universal/ModalPanel';
import { CallIcon } from '../experiences/pi/current/baseline/more/PrimeContact';
import type { CurrentScreenProps } from '../experiences/pi/current/contracts';
import { PRIME_SERVICE_CALL_CONFIGURATION, primeCallTimeline, type PrimeCallConfiguration } from '@/features/prime/callAudio';
import { PrimeCallAudio } from './PrimeCallAudio';

/** iOS calling/answered simulation composed from the user's two visual references. */
export function PrimeUpgradeCall({ host, onEnd, playAudio, call = PRIME_SERVICE_CALL_CONFIGURATION }: { host: CurrentScreenProps; onEnd: () => void; playAudio: boolean; call?: PrimeCallConfiguration }) {
  const [startedAt] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [ended, setEnded] = useState(false);
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const [speaker, setSpeaker] = useState(false);
  const [muted, setMuted] = useState(false);
  const [keypad, setKeypad] = useState(false);
  const [digits, setDigits] = useState('');
  const [more, setMore] = useState(false);
  useEffect(() => {
    if (playAudio && Platform.OS === 'web') return;
    const timer = setInterval(() => setElapsed(Date.now() - startedAt), 200);
    return () => clearInterval(timer);
  }, [startedAt, playAudio]);
  useEffect(() => {
    if (!ended) return;
    const fade = Animated.timing(controlsOpacity, { toValue: 0.3, duration: 450, delay: 500, useNativeDriver: false });
    fade.start();
    const timer = setTimeout(onEnd, 1600);
    return () => { clearTimeout(timer); fade.stop(); };
  }, [ended, onEnd, controlsOpacity]);
  const { connected, seconds } = primeCallTimeline(elapsed);
  const time = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  const control = (label: string, icon: string, onPress: () => void, selected = false, disabled = false, end = false) => (
    <View style={s.control}>
      <Pressable accessibilityRole="button" accessibilityLabel={label === 'End' ? 'End call' : label} accessibilityState={{ selected, disabled: disabled || (ended && !end) }} disabled={disabled || (ended && !end)} onPress={onPress} style={[s.circle, selected && s.selected, disabled && s.disabled, end && s.end]}>
        {icon === 'more' ? <Text style={s.dots}>•••</Text> : <View style={[s.icon, end && s.hangup]}><CallIcon name={icon} color={selected ? '#242428' : 'white'} /></View>}
      </Pressable><Text style={[s.label, disabled && s.disabledLabel]}>{label}</Text>
    </View>
  );
  return (
    <View testID="source-prime-call-active" accessibilityLabel={`${call.name} call simulation`} style={s.page}>
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, s.backdrop]} />
      <View style={[s.identity, { paddingTop: host.screenTopInset + 58 }]}>
        <Text accessibilityLiveRegion="polite" style={s.status}>{ended ? 'Call ended' : connected ? time : 'Calling…'}</Text>
        <Text style={s.number}>{call.number}</Text>
        <Text style={s.destination}>{ended ? `Demo complete · Thank you, ${call.clientName}` : call.subtitle ?? call.name}</Text>
      </View>
      {playAudio && <PrimeCallAudio speaker={speaker} audioSource={call.audioSource} onElapsed={setElapsed} onFinished={milliseconds => { setElapsed(milliseconds); setEnded(true); }} />}
      <Animated.View style={[s.controls, { opacity: controlsOpacity }]}>
        {keypad ? <>
          <Text accessibilityLabel="Dialled digits" style={s.dialled}>{digits || ' '}</Text>
          {['123', '456', '789', '*0#'].map(row => <View key={row} style={s.row}>{[...row].map(digit => <Pressable key={digit} accessibilityRole="button" accessibilityLabel={`Dial ${digit}`} onPress={() => setDigits(value => value + digit)} style={s.digit}><Text style={s.digitLabel}>{digit}</Text></Pressable>)}</View>)}
          <View style={s.row}>{control('Hide', 'keypad', () => setKeypad(false))}{control('End', 'hangup', onEnd, false, false, true)}<View style={s.control} /></View>
        </> : <>
          <View style={s.row}>{control('Speaker', 'speaker', () => setSpeaker(value => !value), speaker)}{control('FaceTime', 'video', () => {}, false, true)}{control('Mute', 'mic', () => setMuted(value => !value), muted)}</View>
          <View style={s.row}>{control('More', 'more', () => setMore(true))}{control('End', 'hangup', onEnd, false, false, true)}{control('Keypad', 'keypad', () => setKeypad(true))}</View>
        </>}
      </Animated.View>
      <View pointerEvents="none" style={s.homeIndicator} />
      <ModalPanel tokens={host.tokens} visible={more} title={call.contactTitle ?? call.name} onClose={() => setMore(false)}><Text style={{ color: host.tokens.text, fontSize: 18 }}>{call.number}</Text></ModalPanel>
    </View>
  );
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#35383e' },
  backdrop: Platform.OS === 'web' ? { backgroundImage: 'radial-gradient(ellipse at 83% 42%, rgba(103,78,42,0.55), transparent 56%), radial-gradient(ellipse at 29% 73%, rgba(98,48,43,0.45), transparent 60%), linear-gradient(160deg, #45494f, #30383c)' } as ViewStyle : { backgroundColor: '#414449' },
  identity: { alignItems: 'center', gap: 3, paddingHorizontal: 16 }, status: { fontFamily: 'System', fontSize: 20, lineHeight: 26, fontWeight: '500', color: 'rgba(255,255,255,0.56)' },
  number: { fontFamily: 'System', fontSize: 30, lineHeight: 38, fontWeight: '600', color: 'white', letterSpacing: -0.6 }, destination: { fontFamily: 'System', fontSize: 19, lineHeight: 25, color: 'rgba(255,255,255,0.55)' },
  controls: { position: 'absolute', left: 32, right: 32, bottom: 50, gap: 26 }, row: { flexDirection: 'row', justifyContent: 'space-between' }, control: { width: 78, alignItems: 'center', gap: 6 },
  circle: { width: 74, height: 74, borderRadius: 37, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' }, selected: { backgroundColor: 'rgba(255,255,255,0.9)' }, disabled: { opacity: 0.45 }, disabledLabel: { opacity: 0.6 }, end: { backgroundColor: '#eb0907', borderColor: 'rgba(255,80,80,0.6)' },
  icon: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', transform: [{ scale: 1.25 }] }, hangup: { transform: [{ rotate: '135deg' }, { scale: 1.15 }] }, dots: { fontSize: 25, letterSpacing: 3, color: 'white', lineHeight: 30 }, label: { fontFamily: 'System', color: 'white', fontSize: 16, lineHeight: 22 },
  digit: { width: 58, height: 58, borderRadius: 29, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }, digitLabel: { color: 'white', fontSize: 28 }, dialled: { color: 'white', textAlign: 'center', fontSize: 22 },
  homeIndicator: { position: 'absolute', bottom: 10, alignSelf: 'center', width: 134, height: 5, borderRadius: 3, backgroundColor: 'white' },
});
