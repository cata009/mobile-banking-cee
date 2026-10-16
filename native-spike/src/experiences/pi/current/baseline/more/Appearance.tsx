import React, { useRef, useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useColorScheme,
  Platform,
} from 'react-native';
import { SourceCustomIcon } from '../../../../../universal/SourceCustomIcon';
import { Text } from '../../../../../universal/Typography';
import {
  themeChoices,
  type HomeTheme,
  type AppearanceMode,
} from '../../profile/preferences';
import { Copy, s } from '../../profile/Primitives';
import { PrimaryButton } from '../../../../../universal/PrimaryButton';
import { ProfileHost } from '../../profile/Host';
import type { CurrentScreenProps } from '../../contracts';
import { sourceColor } from '../../../../../universal/sourceColor';
import { ThemeArtwork } from '../../profile/ThemeArtwork';
import {
  PhonePreview,
  appearanceWebStyle as webStyle,
} from './appearance/Preview';
type Props = {
  applied: HomeTheme;
  draft: HomeTheme;
  mode: AppearanceMode;
  onSelect: (theme: HomeTheme) => void;
  onMode: (mode: AppearanceMode) => void;
  onApply: () => void;
  onBack: () => void;
};
function AppearanceContent({
  applied,
  draft,
  mode,
  onSelect,
  onMode,
  onApply,
  onBack,
}: Props) {
  const system = useColorScheme(),
    light = mode === 'light' || (mode === 'system' && system !== 'dark'),
    carousel = useRef<React.ElementRef<typeof ScrollView>>(null);
  const [carouselWidth, setCarouselWidth] = useState(0);
  const drag = useRef({ active: false, left: 0, x: 0 });
  useEffect(() => {
    const index = themeChoices.findIndex(theme => theme.id === draft);
    carousel.current?.scrollTo({
      x: Math.max(0, index * 96 + 46 - carouselWidth / 2),
      animated: true,
    });
  }, [draft, carouselWidth]);
  const theme = themeChoices.find(item => item.id === draft)!;
  return (
    <View
      style={[
        styles.page,
        { backgroundColor: sourceColor('var(--uc-app-bg)', !light) },
      ]}
      testID="ro-baseline-appearance"
    >
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to Home"
          onPress={onBack}
          style={styles.back}
        >
          <SourceCustomIcon
            name="back-heavy"
            size={22}
            color={light ? '#262626' : '#ffffff'}
          />
        </Pressable>
        <View style={s.grow}>
          <Copy strong size={20} textAlign="center" lineHeight={24}>
            Home appearance
          </Copy>
        </View>
        <View style={styles.back} />
      </View>
      <ScrollView
        style={webStyle({ transform: 'none' })}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View
          style={[
            styles.preview,
            {
              backgroundColor: sourceColor('var(--uc-surface)', !light),
              borderColor: sourceColor('var(--uc-border-muted)', !light),
            },
            webStyle({ boxShadow: '0 18px 44px rgba(0,0,0,.15)' }),
            webStyle({ position: 'static', zIndex: 'auto' }),
          ]}
        >
          <PhonePreview theme={draft} light={light} />
        </View>
        <View
          style={[
            styles.heading,
            webStyle({ position: 'static', zIndex: 'auto' }),
          ]}
        >
          <Text
            style={[
              styles.headingTitle,
              { color: sourceColor('var(--uc-text)', !light) },
              webStyle({ position: 'static', zIndex: 'auto' }),
            ]}
          >
            Home visual style
          </Text>
          <Text
            style={[
              styles.headingDescription,
              { color: sourceColor('var(--uc-text-muted)', !light) },
              webStyle({ position: 'static', zIndex: 'auto' }),
            ]}
          >
            Choose the visual character of your Home.
          </Text>
        </View>
        <ScrollView
          ref={carousel}
          onLayout={event => setCarouselWidth(event.nativeEvent.layout.width)}
          onPointerDown={
            Platform.OS === 'web'
              ? event => {
                  if (
                    event.nativeEvent.pointerType !== 'mouse' ||
                    event.nativeEvent.button !== 0
                  )
                    return;
                  const viewport = carousel.current?.getScrollableNode() as
                    | HTMLElement
                    | undefined;
                  drag.current = {
                    active: true,
                    left: viewport?.scrollLeft ?? 0,
                    x: event.nativeEvent.clientX,
                  };
                }
              : undefined
          }
          onPointerMove={
            Platform.OS === 'web'
              ? event => {
                  const viewport = carousel.current?.getScrollableNode() as
                    | HTMLElement
                    | undefined;
                  if (drag.current.active && viewport)
                    viewport.scrollLeft =
                      drag.current.left -
                      (event.nativeEvent.clientX - drag.current.x);
                }
              : undefined
          }
          onPointerUp={
            Platform.OS === 'web'
              ? () => {
                  drag.current.active = false;
                }
              : undefined
          }
          onPointerLeave={
            Platform.OS === 'web'
              ? () => {
                  drag.current.active = false;
                }
              : undefined
          }
          horizontal
          style={[
            styles.themeCarousel,
            webStyle({
              transform: 'none',
              cursor: 'grab',
              touchAction: 'pan-x',
              userSelect: 'none',
            }),
          ]}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carousel}
        >
          {themeChoices.map(item => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={`Select ${item.name} theme`}
              accessibilityState={{ selected: draft === item.id }}
              aria-pressed={draft === item.id}
              onPress={() => onSelect(item.id)}
              style={styles.choice}
            >
              <View
                style={[
                  styles.swatch,
                  draft === item.id
                    ? light
                      ? stateStyles.selectedLight
                      : stateStyles.selectedDark
                    : stateStyles.unselected,
                  webStyle({
                    background: item.swatch,
                    transform: 'none',
                    scale: draft === item.id ? '1.04' : undefined,
                    borderColor:
                      draft === item.id
                        ? light
                          ? '#262626'
                          : '#ffffff'
                        : light
                        ? 'rgba(38,38,38,.18)'
                        : 'rgba(255,255,255,.18)',
                    boxShadow:
                      draft === item.id
                        ? `0 0 0 3px ${
                            light
                              ? 'rgba(38,38,38,.18)'
                              : 'rgba(255,255,255,.18)'
                          }`
                        : undefined,
                  }),
                ]}
              >
                {Platform.OS !== 'web' && (
                  <View style={styles.swatchArtwork}>
                    <ThemeArtwork theme={item.id} />
                  </View>
                )}
                {draft === item.id ? (
                  <View
                    style={[
                      styles.check,
                      webStyle({ backgroundColor: 'rgb(38 38 38 / .46)' }),
                    ]}
                  >
                    <SourceCustomIcon
                      name="prime-check"
                      color="#ffffff"
                      size={18}
                    />
                  </View>
                ) : null}
                {draft !== item.id && applied === item.id ? (
                  <View
                    style={[
                      styles.applied,
                      {
                        backgroundColor: sourceColor('var(--uc-text)', !light),
                      },
                    ]}
                  >
                    <SourceCustomIcon
                      name="prime-check"
                      color={sourceColor('var(--uc-app-bg)', !light)}
                      size={13}
                    />
                  </View>
                ) : null}
              </View>
              <Copy
                strong={draft === item.id}
                size={14}
                lineHeight={18}
                textAlign="center"
                color={sourceColor(
                  draft === item.id ? 'var(--uc-text)' : 'var(--uc-text-muted)',
                  !light,
                )}
              >
                {item.name}
              </Copy>
            </Pressable>
          ))}
        </ScrollView>
        <View
          style={[
            styles.modes,
            {
              backgroundColor: sourceColor('var(--uc-surface-muted)', !light),
              borderColor: sourceColor('var(--uc-border-muted)', !light),
            },
          ]}
        >
          {(['light', 'dark', 'system'] as const).map(value => (
            <Pressable
              key={value}
              accessibilityRole="button"
              accessibilityLabel={value}
              accessibilityState={{ selected: mode === value }}
              aria-pressed={mode === value}
              onPress={() => onMode(value)}
              style={[
                styles.mode,
                mode === value
                  ? light
                    ? stateStyles.modeLight
                    : stateStyles.modeDark
                  : stateStyles.modeInactive,
                webStyle({
                  boxShadow:
                    mode === value ? '0 3px 10px rgba(0,0,0,.12)' : undefined,
                  backgroundColor:
                    mode === value
                      ? sourceColor('var(--uc-surface)', !light)
                      : 'transparent',
                }),
              ]}
            >
              <Copy
                strong
                size={14}
                lineHeight={21}
                color={sourceColor(
                  mode === value ? 'var(--uc-text)' : 'var(--uc-text-muted)',
                  !light,
                )}
              >
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </Copy>
            </Pressable>
          ))}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton
          dark={!light}
          label={
            applied === draft
              ? 'Apply current theme'
              : draft === 'standard'
              ? 'Apply without theme'
              : `Apply ${theme.name}`
          }
          onPress={onApply}
        />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1 },
  footer: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 20 },
  header: {
    height: 54,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  back: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { paddingHorizontal: 18, paddingBottom: 20, alignItems: 'center' },
  preview: {
    marginTop: 6,
    width: '100%',
    alignItems: 'center',
    paddingVertical: 13,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  heading: { marginTop: 15, width: '100%', gap: 2 },
  headingTitle: { fontFamily: 'UniCredit-bold', fontSize: 18, lineHeight: 23 },
  headingDescription: {
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    lineHeight: 19,
  },
  carousel: { gap: 14, paddingHorizontal: 5, paddingVertical: 8, marginTop: 8 },
  themeCarousel: { width: '100%', flexGrow: 0, flexShrink: 0 },
  choice: { width: 82, alignItems: 'center', gap: 8 },
  swatch: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'visible',
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(38,38,38,.46)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchArtwork: {
    ...StyleSheet.absoluteFill,
    borderRadius: 32,
    overflow: 'hidden',
  },
  applied: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#262626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modes: {
    marginTop: 9,
    flexDirection: 'row',
    gap: 2,
    borderRadius: 30,
    padding: 4,
    backgroundColor: '#e5e5e5',
    borderWidth: 1,
    borderColor: '#cccccc',
  },
  mode: {
    minHeight: 44,
    paddingHorizontal: 15,
    borderRadius: 24,
    justifyContent: 'center',
  },
});
const stateStyles = StyleSheet.create({
  selectedLight: {
    borderColor: '#262626',
    borderWidth: 1,
    transform: [{ scale: 1.04 }],
  },
  selectedDark: {
    borderColor: '#ffffff',
    borderWidth: 1,
    transform: [{ scale: 1.04 }],
  },
  unselected: { borderColor: '#999999', borderWidth: 1 },
  modeLight: { backgroundColor: '#ffffff' },
  modeDark: { backgroundColor: '#1e2529' },
  modeInactive: { backgroundColor: 'transparent' },
});

/** Source mode choices apply immediately; the caller owns the theme draft. */
export default function Appearance({
  host,
  ...props
}: Omit<Props, 'mode' | 'onMode'> & { host: CurrentScreenProps }) {
  const system = useColorScheme() === 'dark' ? 'dark' : 'light';
  const effectiveMode = host.mode === 'system' ? system : host.mode;
  const [appearance, setAppearance] = useState<AppearanceMode>(() => {
    const stored = globalThis.localStorage?.getItem('app-2027-appearance-mode');
    return stored === 'system' && system === effectiveMode
      ? 'system'
      : effectiveMode;
  });
  const internal = useRef<'light' | 'dark' | null>(null);
  const latest = useRef(effectiveMode);
  const skipSystem = useRef(false);
  useEffect(() => {
    if (internal.current === effectiveMode) {
      internal.current = null;
      latest.current = effectiveMode;
      return;
    }
    if (latest.current !== effectiveMode) {
      if (!(appearance === 'system' && effectiveMode === system)) {
        skipSystem.current = true;
        setAppearance(effectiveMode);
        globalThis.localStorage?.setItem(
          'app-2027-appearance-mode',
          effectiveMode,
        );
      }
      latest.current = effectiveMode;
    }
  }, [appearance, effectiveMode, system]);
  useEffect(() => {
    if (appearance !== 'system') return;
    if (skipSystem.current) {
      skipSystem.current = false;
      return;
    }
    if (effectiveMode !== system) {
      internal.current = system;
      host.onModeChange(system);
    }
  }, [appearance, effectiveMode, system, host]);
  const dark = effectiveMode === 'dark';
  return (
    <ProfileHost host={host}>
      <View
        style={[
          styles.page,
          {
            paddingTop: host.screenTopInset,
            backgroundColor: sourceColor('var(--uc-app-bg)', dark),
          },
        ]}
      >
        <AppearanceContent
          {...props}
          mode={appearance}
          onMode={mode => {
            setAppearance(mode);
            globalThis.localStorage?.setItem('app-2027-appearance-mode', mode);
            const target = mode === 'system' ? system : mode;
            if (target !== effectiveMode) {
              internal.current = target;
              host.onModeChange(target);
            }
          }}
        />
      </View>
    </ProfileHost>
  );
}
