import React from 'react';
import {
  Platform,
  StyleSheet,
  View as NativeView,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { getApp2027Theme } from '@/features/products/evoAppearance';
import { themeChoices, type HomeTheme } from '../../../profile/preferences';
import { Text } from '../../../../../../universal/Typography';
import { SourceCustomIcon } from '../../../../../../universal/SourceCustomIcon';
import { ThemeArtwork } from '../../../profile/ThemeArtwork';
import { SourceLogo } from '../../../profile/SourceLogo';
/** CSS variables keep Source colour syntax intact through RN Web's colour normalizer. */
export function appearanceWebStyle(style: React.CSSProperties) {
  if (Platform.OS !== 'web') return undefined;
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(style)) {
    const preserved =
      typeof value === 'string'
        ? value.replace(
            /rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/g,
            'rgb($1 $2 $3 / $4)',
          )
        : value;
    if (
      typeof preserved === 'string' &&
      !key.startsWith('--') &&
      (key === 'color' || key.endsWith('Color')) &&
      !preserved.startsWith('var(')
    ) {
      const slot = `--preview-paint-${key}`;
      result[slot] = preserved;
      result[key] = `var(${slot})`;
    } else result[key] = preserved;
  }
  return result as unknown as ViewStyle;
}
const webStyle = appearanceWebStyle;
/** Native layout nodes retain ordinary browser stacking for the Source preview. */
function View(props: React.ComponentProps<typeof NativeView>) {
  const flat = StyleSheet.flatten(props.style) ?? {};
  const defaults = webStyle({
    alignContent: 'normal',
    position: flat.position ?? 'static',
    zIndex: flat.zIndex ?? 'auto',
    display:
      flat.flexDirection || flat.alignItems || flat.justifyContent
        ? 'flex'
        : 'block',
    flexShrink: 1,
  });
  const round =
    typeof flat.width === 'number' &&
    typeof flat.height === 'number' &&
    typeof flat.borderRadius === 'number' &&
    flat.borderRadius >= Math.min(flat.width, flat.height) / 2;
  return (
    <NativeView
      {...props}
      style={[
        defaults,
        props.style,
        webStyle(flat as React.CSSProperties),
        round ? webStyle({ borderRadius: 33554400 }) : undefined,
      ]}
    />
  );
}
function QuickIcon({ name, color }: { name: string; color: string }) {
  return (
    <View
      style={[
        styles.quickGlyph,
        webStyle({ filter: 'drop-shadow(0 5px 8px rgb(0 0 0 / .2))' }),
      ]}
    >
      <SourceCustomIcon name={name} color={color} size={22} />
    </View>
  );
}
/** Browser CSS gradients retain Source atmospheric parameters; devices use Native artwork. */
function Wallpaper({ theme, light }: { theme: HomeTheme; light: boolean }) {
  if (Platform.OS !== 'web') return <ThemeArtwork theme={theme} wallpaper />;
  const definition = getApp2027Theme(theme);
  const backgroundImage = definition.image
    ? `url(${definition.image})`
    : wallpaperBackgrounds[theme as keyof typeof wallpaperBackgrounds];
  return (
    <>
      <View
        pointerEvents="none"
        style={[
          styles.atmosphere,
          webStyle({
            backgroundImage,
            backgroundPosition: definition.position ?? 'center',
            backgroundSize:
              theme === 'blockcraft' ? 'cover,118px 118px' : 'cover',
            filter: 'saturate(1.06) contrast(1.03)',
            transform: 'scale(1.04)',
            transformOrigin: '52% 45%',
            backfaceVisibility: 'hidden',
            zIndex: -2,
            willChange: 'transform',
          }),
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.atmosphere,
          webStyle({
            background: light ? 'rgba(245,245,245,.88)' : undefined,
            backgroundImage: light
              ? undefined
              : wallpaperVeils.dark[theme as keyof typeof wallpaperVeils.light],
            backgroundSize: 'auto',
            mixBlendMode: 'normal',
            transform: 'none',
            zIndex: -1,
            willChange: 'transform, opacity',
          }),
        ]}
      />
    </>
  );
}
const wallpaperBackgrounds = {
  nordlys:
    'radial-gradient(circle at 76% 72%, rgb(251 184 0 / 0.64), transparent 24%), radial-gradient(ellipse at 30% 34%, rgb(62 214 200 / 0.76), transparent 38%), linear-gradient(118deg, #03141c 4%, #0a3a4a 50%, #124f58 72%, #09222b 100%)',
  'blue-lines':
    'repeating-linear-gradient(124deg, transparent 0 18px, rgb(79 198 221 / 0.58) 19px 21px, transparent 22px 40px), radial-gradient(circle at 72% 22%, rgb(0 161 151 / 0.56), transparent 34%), linear-gradient(135deg, #061a36 4%, #0e4779 46%, #075f70 100%)',
  blockcraft:
    'linear-gradient(135deg, rgb(9 25 21 / 0.20), rgb(5 16 13 / 0.36)), conic-gradient(from 45deg at 50% 50%, #9aa82f 0 25%, #174c3c 0 50%, #d3a02c 0 75%, #748320 0)',
  magenta:
    'radial-gradient(circle at 78% 24%, rgb(247 155 199 / 0.44), transparent 28%), radial-gradient(circle at 18% 72%, rgb(0 161 151 / 0.26), transparent 34%), linear-gradient(135deg, #32182d 2%, #8e234e 50%, #c5235f 74%, #711d3f 100%)',
  garden:
    'repeating-radial-gradient(ellipse at 14% 82%, transparent 0 34px, rgb(251 184 0 / 0.15) 35px 37px, transparent 38px 68px), radial-gradient(ellipse at 72% 34%, rgb(112 187 72 / 0.70), transparent 38%), linear-gradient(135deg, #0d3028 2%, #245f3f 50%, #315f2b 76%, #132a21 100%)',
  solar:
    'radial-gradient(circle at 72% 26%, rgb(251 184 0 / 0.96), transparent 22%), radial-gradient(circle at 20% 78%, rgb(0 122 145 / 0.28), transparent 32%), linear-gradient(135deg, #711a28 2%, #b81f2f 42%, #df5a1d 70%, #8f261e 100%)',
} as const;
const wallpaperVeils = {
  light: {
    aurora:
      'radial-gradient(circle at 74% 28%, rgb(0 122 145 / 0.12), transparent 30%), linear-gradient(180deg, rgb(250 254 253 / 0.62), rgb(243 248 247 / 0.76))',
    porcelain:
      'radial-gradient(circle at 76% 64%, rgb(0 106 115 / 0.07), transparent 28%), radial-gradient(circle at 16% 74%, rgb(208 0 26 / 0.06), transparent 30%), linear-gradient(180deg, rgb(255 252 248 / 0.68), rgb(246 240 234 / 0.74))',
    obsidian:
      'radial-gradient(circle at 78% 30%, rgb(0 122 145 / 0.10), transparent 30%), linear-gradient(180deg, rgb(246 249 249 / 0.69), rgb(239 244 244 / 0.80))',
    nordlys:
      'radial-gradient(circle at 74% 72%, rgb(251 184 0 / 0.08), transparent 24%), linear-gradient(180deg, rgb(245 252 251 / 0.63), rgb(236 246 245 / 0.77))',
    'blue-lines':
      'radial-gradient(circle at 70% 24%, rgb(0 122 145 / 0.09), transparent 30%), linear-gradient(180deg, rgb(244 250 252 / 0.65), rgb(236 246 248 / 0.78))',
    blockcraft:
      'radial-gradient(circle at 22% 74%, rgb(116 131 32 / 0.09), transparent 30%), linear-gradient(180deg, rgb(250 250 242 / 0.68), rgb(242 244 231 / 0.80))',
    magenta:
      'radial-gradient(circle at 78% 24%, rgb(190 39 100 / 0.08), transparent 30%), linear-gradient(180deg, rgb(253 247 250 / 0.66), rgb(248 238 243 / 0.79))',
    garden:
      'radial-gradient(circle at 72% 34%, rgb(76 159 56 / 0.08), transparent 32%), linear-gradient(180deg, rgb(247 251 245 / 0.65), rgb(238 246 235 / 0.79))',
    solar:
      'radial-gradient(circle at 72% 26%, rgb(251 184 0 / 0.10), transparent 26%), linear-gradient(180deg, rgb(254 249 242 / 0.66), rgb(249 239 229 / 0.79))',
  },
  dark: {
    aurora:
      'radial-gradient(circle at 74% 26%, rgb(101 217 210 / 0.09), transparent 28%), linear-gradient(180deg, rgb(5 7 9 / 0.56), rgb(5 7 9 / 0.67))',
    porcelain:
      'radial-gradient(circle at 76% 30%, rgb(101 217 210 / 0.08), transparent 30%), linear-gradient(180deg, rgb(8 10 11 / 0.60), rgb(5 7 9 / 0.73))',
    obsidian:
      'radial-gradient(circle at 74% 26%, rgb(101 217 210 / 0.07), transparent 28%), linear-gradient(180deg, rgb(3 5 6 / 0.51), rgb(3 5 6 / 0.64))',
    nordlys:
      'radial-gradient(circle at 76% 72%, rgb(251 184 0 / 0.06), transparent 25%), linear-gradient(180deg, rgb(3 11 15 / 0.54), rgb(3 8 11 / 0.68))',
    'blue-lines':
      'radial-gradient(circle at 72% 22%, rgb(101 217 210 / 0.07), transparent 30%), linear-gradient(180deg, rgb(3 9 18 / 0.56), rgb(3 8 13 / 0.69))',
    blockcraft:
      'radial-gradient(circle at 24% 76%, rgb(251 184 0 / 0.05), transparent 28%), linear-gradient(180deg, rgb(5 10 8 / 0.59), rgb(4 8 7 / 0.72))',
    magenta:
      'radial-gradient(circle at 78% 24%, rgb(247 155 199 / 0.06), transparent 28%), linear-gradient(180deg, rgb(12 5 10 / 0.58), rgb(8 4 7 / 0.71))',
    garden:
      'radial-gradient(circle at 72% 34%, rgb(101 217 210 / 0.06), transparent 30%), linear-gradient(180deg, rgb(4 11 8 / 0.58), rgb(4 8 6 / 0.71))',
    solar:
      'radial-gradient(circle at 72% 26%, rgb(251 184 0 / 0.05), transparent 26%), linear-gradient(180deg, rgb(13 6 5 / 0.59), rgb(8 5 4 / 0.72))',
  },
} as const;

export function PhonePreview({
  theme,
  light,
}: {
  theme: HomeTheme;
  light: boolean;
}) {
  const ink = light ? '#222426' : '#ffffff',
    muted = light ? '#565b5d' : 'rgba(255,255,255,.72)',
    surface = light ? 'rgba(255,255,255,.76)' : 'rgba(16,23,25,.78)',
    todayColor = light ? 'rgba(255,247,245,.78)' : 'rgba(87,28,38,.72)';
  const moneyBorder = light ? 'rgba(255,255,255,.65)' : 'rgba(255,255,255,.14)';
  const storyBorder = light ? 'rgba(255,255,255,.65)' : 'rgba(255,255,255,.12)';
  const transactionBorder = light ? 'rgba(0,0,0,.1)' : 'rgba(255,255,255,.14)';
  const moneyBackground = Platform.OS === 'web' ? 'transparent' : surface;
  const storyBackground = Platform.OS === 'web' ? 'transparent' : todayColor;
  const previewBackground = light ? '#f5f5f5' : '#12171a';
  const previewAction = light ? '#007a91' : '#65d9d2';
  const text = (
    value: string,
    size = 14,
    strong = false,
    color = ink,
    extra?: TextStyle,
    clipping?: 'truncate' | 'clamp',
  ) => {
    const fontFamily = strong ? 'UniCredit-bold' : 'UniCredit-regular';
    const lineHeight =
      size === 32 ? 38 : size === 19 ? 24 : size === 18 ? 23 : 18;
    return (
      <Text
        numberOfLines={1}
        style={[
          {
            fontFamily,
            fontSize: size,
            color,
            lineHeight,
            ...extra,
          },
          webStyle({
            position: 'static',
            zIndex: 'auto',
            display: clipping === 'clamp' ? '-webkit-box' : 'block',
            // A clip on every scaled Text changes Chromium's glyph paint bounds.
            // Only Source's metric, transaction and story fields clip their text.
            ...(clipping === 'truncate'
              ? undefined
              : {
                  overflow: clipping === 'clamp' ? 'hidden' : 'visible',
                  textOverflow: 'clip',
                  whiteSpace: 'normal',
                  maxWidth: 'none',
                  unicodeBidi: 'normal',
                }),
            ...(clipping === 'clamp'
              ? { WebkitBoxOrient: 'vertical', WebkitLineClamp: 1 }
              : undefined),
            fontFamily: `${fontFamily}, sans-serif`,
            fontWeight: strong ? 700 : 400,
            color:
              color === muted && !light
                ? 'color-mix(in oklab,white 72%,transparent)'
                : color,
          }) as TextStyle,
        ]}
      >
        {value}
      </Text>
    );
  };
  return (
    <View
      style={[
        styles.phone,
        webStyle({
          boxShadow: '0 22px 58px rgb(0 0 0 / 0.34)',
          fontSynthesis: 'none',
          textRendering: 'optimizeLegibility',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        }),
      ]}
      testID="app-2027-phone-theme-preview"
      accessibilityLabel={`${
        themeChoices.find(item => item.id === theme)!.name
      } Home preview in ${light ? 'light' : 'dark'} mode`}
    >
      <View style={styles.previewMask}>
        <View
          style={[
            styles.previewScene,
            { backgroundColor: previewBackground },
            webStyle({
              perspective: 1100,
              transform: 'none',
              scale: '0.405333',
              fontFamily: 'UniCredit',
              fontSize: 16,
              lineHeight: '24px',
              color: ink,
              isolation: 'isolate',
              containerName: 'home',
              containerType: 'size',
            }),
          ]}
        >
          {theme === 'standard' ? (
            <>
              <View
                testID="ro-appearance-classic-background"
                style={[
                  styles.atmosphere,
                  { backgroundColor: previewBackground },
                  styles.classicPlane,
                  webStyle({
                    willChange: 'transform',
                    backfaceVisibility: 'hidden',
                  }),
                ]}
              />
              <View
                pointerEvents="none"
                style={[
                  styles.atmosphere,
                  webStyle({ zIndex: -1, willChange: 'transform, opacity' }),
                ]}
              />
            </>
          ) : (
            <Wallpaper theme={theme} light={light} />
          )}
          <View style={styles.previewContent}>
            <View style={styles.status}>
              {text('14:24', 14, true, ink, { lineHeight: 21 })}
              <View style={styles.statusMarks}>
                <View style={styles.signal}>
                  {[5, 8, 11, 14].map(height => (
                    <View
                      key={height}
                      style={[
                        styles.signalBar,
                        { height, backgroundColor: ink },
                      ]}
                    />
                  ))}
                </View>
                {text('⌁', 16, true, ink, { lineHeight: 16 })}
                <View style={[styles.battery, { borderColor: ink }]}>
                  <View
                    style={[styles.batteryFill, { backgroundColor: ink }]}
                  />
                </View>
              </View>
            </View>
            <View style={styles.previewHeader}>
              <View style={styles.logo}>
                <SourceLogo
                  color={light ? '#202426' : '#ffffff'}
                  width={188.5}
                  height={26}
                />
              </View>
              <View style={[styles.horizontal, styles.headerActions]}>
                <View
                  style={[
                    styles.palette,
                    light ? stateStyles.paletteLight : stateStyles.paletteDark,
                    webStyle({
                      backdropFilter: 'blur(14px)',
                      backgroundColor: light
                        ? 'color-mix(in oklab,white 68%,transparent)'
                        : 'color-mix(in oklab,black 28%,transparent)',
                      borderColor: light
                        ? 'color-mix(in oklab,black 10%,transparent)'
                        : 'color-mix(in oklab,white 16%,transparent)',
                    }),
                  ]}
                >
                  <SourceCustomIcon name="palette" size={20} color={ink} />
                </View>
                <View
                  style={[
                    styles.avatar,
                    light ? stateStyles.avatarLight : stateStyles.avatarDark,
                  ]}
                >
                  {text('PR', 14, true, light ? '#ffffff' : '#16191a', {
                    lineHeight: 21,
                    width: '100%',
                    textAlign: 'center',
                  })}
                </View>
              </View>
            </View>
            <View style={styles.previewMain}>
              <View
                style={[
                  styles.money,
                  {
                    backgroundColor: moneyBackground,
                    borderColor: moneyBorder,
                  },
                  webStyle({
                    backgroundImage: light
                      ? 'linear-gradient(135deg,rgba(255,255,255,.94),rgba(248,244,240,.88))'
                      : 'linear-gradient(105deg,rgba(16,21,22,.94) 0%,rgba(19,26,27,.9) 58%,rgba(20,34,34,.88) 100%)',
                    backdropFilter: 'blur(24px) saturate(1.15)',
                    transform: 'translateZ(0)',
                    isolation: 'isolate',
                    position: 'relative',
                    zIndex: 'auto',
                    transformOrigin: '50% 76%',
                    boxShadow: light
                      ? 'inset 0 1px 0 rgba(255,255,255,.88),0 20px 44px rgba(65,47,35,.12)'
                      : 'inset 0 1px 0 rgba(255,255,255,.18),inset 0 -1px 0 rgba(255,255,255,.035),0 22px 52px rgba(0,0,0,.28)',
                  }),
                ]}
              >
                <View
                  pointerEvents="none"
                  style={[
                    styles.moneyShine,
                    webStyle({
                      backgroundImage:
                        'linear-gradient(106deg,transparent 38%,rgba(255,255,255,.025) 44%,rgba(255,255,255,.18) 49%,rgba(255,255,255,.045) 54%,transparent 61%)',
                      mixBlendMode: 'screen',
                      opacity: 0,
                      transform: 'translate3d(-42%,0,0) rotate(-7deg)',
                      zIndex: 3,
                      willChange: 'transform, opacity',
                    }),
                  ]}
                />
                <View style={[styles.spread, styles.moneyHeading]}>
                  <View>
                    {text('Good morning, Peter', 14, false, muted)}
                    {text('Your money, at a glance', 18, true, ink, {
                      marginTop: 2,
                    })}
                  </View>
                  <View
                    style={[
                      styles.info,
                      light ? stateStyles.infoLight : stateStyles.infoDark,
                      webStyle({
                        backgroundColor: light
                          ? 'color-mix(in oklab,black 6%,transparent)'
                          : 'color-mix(in oklab,white 10%,transparent)',
                      }),
                    ]}
                  >
                    <SourceCustomIcon
                      name="account-info"
                      color={ink}
                      size={18}
                    />
                  </View>
                </View>
                <View style={styles.available}>
                  {text('Available now', 14, false, muted)}
                  {text('59 902.86 CZK', 32, true, ink, {
                    marginTop: 2,
                    letterSpacing: -1.12,
                    fontVariant: ['tabular-nums'],
                  })}
                </View>
                <View
                  style={[
                    styles.bar,
                    webStyle({
                      backgroundColor: light
                        ? 'color-mix(in oklab,black 8%,transparent)'
                        : 'color-mix(in oklab,white 12%,transparent)',
                      borderRadius: 33554400,
                    }),
                  ]}
                >
                  <View style={fidelityStyles.s0} />
                  <View style={fidelityStyles.s1} />
                  <View style={fidelityStyles.s2} />
                </View>
                <View
                  style={[
                    styles.metrics,
                    webStyle({
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3,minmax(0,1fr))',
                    }),
                  ]}
                >
                  {[
                    ['Total wealth', '308 816'],
                    ['Total debt', '2 895 000'],
                    ['Invested', '42 500'],
                  ].map(([label, value], index) => (
                    <View
                      key={label}
                      style={[
                        styles.grow,
                        index ? styles.metricDivision : undefined,
                        index
                          ? webStyle({
                              borderLeftColor:
                                'color-mix(in oklab,currentColor 10%,transparent)',
                            })
                          : undefined,
                      ]}
                    >
                      {text(label, 14, false, muted, undefined, 'truncate')}
                      {text(value, 14, true, ink, { marginTop: 2 }, 'truncate')}
                    </View>
                  ))}
                </View>
                <View
                  pointerEvents="none"
                  style={[
                    styles.moneyGlow,
                    webStyle({
                      backgroundImage:
                        'radial-gradient(circle at 24% 34%,rgba(101,217,210,.13),transparent 27%),radial-gradient(circle at 76% 69%,rgba(227,0,28,.08),transparent 25%)',
                      filter: 'blur(20px)',
                      zIndex: 0,
                      willChange: 'transform, opacity',
                      transform: 'translate3d(-2%,1%,0) scale(1.01)',
                      opacity: 0.58,
                    }),
                  ]}
                />
              </View>
              <View style={styles.block}>
                <View style={[styles.spread, styles.moveHeading]}>
                  {text('Move money', 19, true)}
                  {text('Customise', 14, true, muted, { lineHeight: 21 })}
                </View>
                <View
                  style={[
                    styles.quick,
                    webStyle({
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4,minmax(0,1fr))',
                    }),
                  ]}
                >
                  {[
                    ['nav-payments', 'Pay'],
                    ['payment-scan-qr', 'Scan'],
                    ['transaction-transfer', 'Transfer'],
                    ['add-money', 'Save'],
                  ].map(([icon, label]) => (
                    <View key={label} style={styles.quickItem}>
                      <View
                        style={[
                          styles.quickIcon,
                          light
                            ? stateStyles.quickLight
                            : stateStyles.quickDark,
                          webStyle({
                            backdropFilter: 'blur(16px)',
                            backgroundColor: light
                              ? 'color-mix(in oklab,white 72%,transparent)'
                              : 'color-mix(in oklab,white 10%,transparent)',
                            display: 'grid',
                            placeItems: 'center',
                            alignContent: 'normal',
                            justifyContent: 'normal',
                            position: 'relative',
                            isolation: 'isolate',
                            overflow: 'hidden',
                            transform: 'translateZ(0)',
                            transformOrigin: '50% 74%',
                            backgroundSize: '180% 180%',
                            willChange: 'translate, box-shadow',
                          }),
                        ]}
                      >
                        <View
                          pointerEvents="none"
                          style={[
                            styles.quickShine,
                            webStyle({
                              backgroundImage:
                                'linear-gradient(112deg,transparent 38%,rgba(255,255,255,.2) 50%,transparent 62%)',
                              opacity: 0,
                              transform: 'translate3d(-58%,0,0) rotate(8deg)',
                              zIndex: 0,
                            }),
                          ]}
                        />
                        <View
                          pointerEvents="none"
                          style={[
                            styles.quickGlow,
                            webStyle({
                              backgroundImage:
                                'radial-gradient(circle at 68% 22%,rgba(255,255,255,.13),transparent 48%)',
                              opacity: 0.46,
                              zIndex: 0,
                            }),
                          ]}
                        />
                        <QuickIcon name={icon} color={ink} />
                      </View>
                      {text(label, 14, true, ink, { lineHeight: 17 })}
                    </View>
                  ))}
                </View>
              </View>
              <View style={styles.block}>
                {text('Today', 19, true)}
                <View
                  style={[
                    styles.today,
                    {
                      backgroundColor: storyBackground,
                      borderColor: storyBorder,
                    },
                    webStyle({
                      backgroundImage: light
                        ? 'linear-gradient(135deg,rgba(255,239,238,.96),rgba(255,250,249,.94))'
                        : 'radial-gradient(circle at 92% 8%,rgba(227,0,28,.24),transparent 34%),linear-gradient(135deg,rgba(66,23,29,.96),rgba(30,27,29,.94))',
                      backdropFilter: 'blur(22px) saturate(1.14)',
                      transform: 'translateZ(0)',
                      transformOrigin: '50% 78%',
                      isolation: 'isolate',
                      overflow: 'visible',
                      position: 'static',
                      zIndex: 'auto',
                      boxShadow: light
                        ? 'inset 0 1px 0 rgba(255,255,255,.88),0 20px 44px rgba(65,47,35,.12)'
                        : 'inset 0 1px 0 rgba(255,255,255,.12),0 18px 40px rgba(0,0,0,.22)',
                    }),
                  ]}
                >
                  <View
                    pointerEvents="none"
                    style={[
                      StyleSheet.absoluteFill,
                      webStyle({
                        backgroundImage:
                          'linear-gradient(112deg,transparent 24%,rgba(255,255,255,.02) 39%,rgba(255,255,255,.14) 47%,rgba(255,255,255,.025) 55%,transparent 70%)',
                        mixBlendMode: 'screen',
                        opacity: 0,
                        transform: 'translate3d(-118%,0,0) skewX(-12deg)',
                        zIndex: 2,
                        willChange: 'transform, opacity',
                      }),
                    ]}
                  />
                  <View style={styles.due}>
                    <View
                      style={[
                        styles.dueIcon,
                        light ? stateStyles.dueLight : stateStyles.dueDark,
                        !light
                          ? webStyle({
                              backgroundColor:
                                'color-mix(in oklab,white 12%,transparent)',
                            })
                          : undefined,
                      ]}
                    >
                      <SourceCustomIcon
                        name="nav-payments"
                        size={19}
                        color={ink}
                      />
                    </View>
                    <View>
                      {text(
                        'Due tomorrow',
                        14,
                        true,
                        muted,
                        {
                          textTransform: 'uppercase',
                          marginTop: 3,
                        },
                        'clamp',
                      )}
                      {text(
                        '1 of 4',
                        14,
                        false,
                        ink,
                        { marginTop: 3 },
                        'clamp',
                      )}
                    </View>
                  </View>
                  {text(
                    '3 500 CZK mortgage payment',
                    18,
                    true,
                    ink,
                    {
                      marginTop: 3,
                    },
                    'clamp',
                  )}
                  {text(
                    'Your everyday balance comfortably covers it.',
                    14,
                    false,
                    muted,
                    { marginTop: 3, lineHeight: 19 },
                    'clamp',
                  )}
                  {text(
                    'Review payment ›',
                    14,
                    true,
                    ink,
                    { marginTop: 3 },
                    'clamp',
                  )}
                  <View
                    pointerEvents="none"
                    style={[
                      StyleSheet.absoluteFill,
                      webStyle({
                        backgroundImage:
                          'radial-gradient(circle at 88% 18%,rgba(227,63,83,.19),transparent 34%),linear-gradient(180deg,rgba(255,255,255,.035),transparent 42%)',
                        opacity: 0.54,
                        zIndex: 0,
                        willChange: 'opacity',
                      }),
                    ]}
                  />
                </View>
              </View>
              <View style={styles.block}>
                <View style={styles.spread}>
                  {text('Your recent transactions', 19, true)}
                  {text('See all ›', 14, true, muted, { lineHeight: 21 })}
                </View>
                <View
                  style={[
                    styles.transactions,
                    {
                      backgroundColor: surface,
                      borderColor: transactionBorder,
                    },
                    webStyle({
                      boxShadow: light
                        ? '0 18px 44px rgba(25,31,32,.14)'
                        : '0 18px 44px rgba(0,0,0,.38)',
                      backdropFilter: 'blur(22px)',
                      backgroundColor: light
                        ? 'color-mix(in oklab,white 76%,transparent)'
                        : 'rgba(16,23,25,.78)',
                      borderColor: light
                        ? 'color-mix(in oklab,black 10%,transparent)'
                        : 'color-mix(in oklab,white 14%,transparent)',
                    }),
                  ]}
                >
                  {[
                    [
                      'Salary',
                      'UniCredit payroll · Today, 08:05',
                      '+62 500 CZK',
                    ],
                    ['McDonald’s', 'Lunch · Today, 12:31', '−248.90 CZK'],
                    [
                      'Spotify',
                      'Monthly plan · Yesterday, 18:07',
                      '−169.00 CZK',
                    ],
                  ].map(([title, detail, amount], index) => (
                    <View
                      key={title}
                      style={[
                        styles.transaction,
                        index === 0
                          ? light
                            ? stateStyles.firstTransactionLight
                            : stateStyles.firstTransactionDark
                          : undefined,
                        index === 0
                          ? webStyle({
                              borderBottomColor:
                                'color-mix(in oklab,currentColor 10%,transparent)',
                            })
                          : undefined,
                      ]}
                    >
                      <View
                        style={[
                          styles.transactionMark,
                          index === 0
                            ? stateStyles.salary
                            : index === 1
                            ? stateStyles.mcdonald
                            : stateStyles.spotify,
                        ]}
                      >
                        {text(
                          index === 0 ? '+' : index === 1 ? 'M' : 'S',
                          16,
                          true,
                          index === 0
                            ? '#ffffff'
                            : index === 1
                            ? '#ffc72c'
                            : '#151515',
                          {
                            lineHeight: 24,
                            width: '100%',
                            textAlign: 'center',
                          },
                        )}
                      </View>
                      <View style={[styles.grow, styles.transactionCopy]}>
                        {text(title, 14, true, ink, undefined, 'truncate')}
                        {text(detail, 14, false, muted, undefined, 'truncate')}
                      </View>
                      {text(
                        amount,
                        14,
                        true,
                        index === 0 ? previewAction : ink,
                        { fontVariant: ['tabular-nums'], lineHeight: 21 },
                      )}
                    </View>
                  ))}
                </View>
              </View>
            </View>
            <View style={[styles.previewNav, { backgroundColor: surface }]}>
              {[
                ['nav-home', 'Home'],
                ['nav-analytics', 'Spending'],
                ['nav-payments', 'Payments'],
                ['nav-products', 'Products'],
                ['nav-more', 'More'],
              ].map(([icon, label]) => (
                <View key={label} style={styles.navItem}>
                  <SourceCustomIcon
                    name={icon}
                    color={label === 'Home' ? '#008c95' : muted}
                    size={21}
                  />
                  {text(label, 14, false, label === 'Home' ? '#008c95' : muted)}
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
      <View
        style={[
          styles.notch,
          webStyle({
            left: '50%',
            translate: '-50%',
            borderRadius: 33554400,
            zIndex: 30,
          }),
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  classicPlane: { zIndex: -2 },
  grow: { flex: 1 },
  horizontal: { flexDirection: 'row', alignItems: 'center' },
  headerActions: { gap: 8 },
  logo: { width: 150, height: 26 },
  phone: {
    position: 'relative',
    flexShrink: 0,
    height: 339,
    width: 162,
    borderRadius: 35,
    borderWidth: 5,
    borderColor: '#17191a',
    backgroundColor: '#17191a',
    overflow: 'hidden',
  },
  previewMask: {
    backgroundColor: '#080a0b',
    position: 'absolute',
    left: 5,
    top: 5,
    width: 152,
    height: 329,
    overflow: 'hidden',
    borderRadius: 29,
  },
  previewScene: {
    overflow: 'hidden',
    position: 'absolute',
    left: 0,
    top: 0,
    width: 375,
    height: 812,
    transform: [{ scale: 0.405333 }],
    transformOrigin: [0, 0, 0],
  },
  previewContent: {
    height: '100%',
    position: 'relative',
    zIndex: 1,
    paddingBottom: 8,
  },
  notch: {
    position: 'absolute',
    top: 10,
    left: 53.5,
    height: 8,
    width: 45,
    borderRadius: 4,
    backgroundColor: '#17191a',
  },
  status: {
    height: 42,
    paddingHorizontal: 28,
    paddingBottom: 7,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  previewHeader: {
    height: 66,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#222426',
    alignItems: 'center',
    justifyContent: 'center',
  },
  palette: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  due: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dueIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionMark: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewMain: { paddingHorizontal: 16, paddingBottom: 96 },
  money: {
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderRadius: 23,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ffffff36',
  },
  spread: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  available: { marginTop: 13 },
  bar: {
    height: 5,
    marginTop: 14,
    flexDirection: 'row',
    borderRadius: 3,
    overflow: 'hidden',
  },
  metrics: { marginTop: 8, flexDirection: 'row', gap: 9 },
  block: { marginTop: 18 },
  quick: {
    gap: 7,
    marginTop: 9,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickItem: { flex: 1, alignItems: 'center', gap: 7 },
  quickIcon: {
    borderWidth: 1,
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  today: {
    minHeight: 162,
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderRadius: 21,
    overflow: 'hidden',
  },
  transactions: {
    marginTop: 9,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
  },
  transaction: {
    minHeight: 67,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  previewNav: {
    position: 'relative',
    bottom: 12,
    left: 12,
    right: 12,
    height: 68,
    borderRadius: 27,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  navItem: { width: 66, alignItems: 'center', gap: 2 },
  moneyHeading: { alignItems: 'flex-start' },
  moveHeading: { minHeight: 32 },
  metricDivision: {
    borderLeftWidth: 1,
    borderLeftColor: '#0000001a',
    paddingLeft: 9,
  },
  transactionCopy: { minWidth: 0 },
  statusMarks: { flexDirection: 'row', alignItems: 'flex-end', gap: 5 },
  signal: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  signalBar: { width: 3, borderRadius: 999 },
  battery: { height: 11, width: 22, borderRadius: 4, borderWidth: 2 },
  batteryFill: { height: 3, width: 14, margin: 2, borderRadius: 999 },
  atmosphere: {
    position: 'absolute',
    top: '-7%',
    bottom: '-7%',
    left: '-7%',
    right: '-7%',
  },
  moneyGlow: {
    position: 'absolute',
    top: '-34%',
    bottom: '-34%',
    left: '-34%',
    right: '-34%',
  },
  moneyShine: {
    position: 'absolute',
    top: '-58%',
    bottom: '-58%',
    left: '-82%',
    right: '-82%',
  },
  quickShine: {
    position: 'absolute',
    top: '-45%',
    bottom: '-45%',
    left: '-45%',
    right: '-45%',
  },
  quickGlow: {
    position: 'absolute',
    top: 5,
    bottom: 5,
    left: 5,
    right: 5,
    borderRadius: 16,
  },
  quickGlyph: {
    position: 'relative',
    zIndex: 2,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
const stateStyles = StyleSheet.create({
  firstTransactionLight: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(34,36,38,.1)',
  },
  firstTransactionDark: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,.1)',
  },
  quickLight: {
    backgroundColor: 'rgba(255,255,255,.72)',
    borderColor: 'rgba(255,255,255,.12)',
  },
  quickDark: {
    backgroundColor: 'rgba(255,255,255,.1)',
    borderColor: 'rgba(255,255,255,.12)',
  },
  paletteLight: {
    backgroundColor: 'rgba(255,255,255,.68)',
    borderColor: 'rgba(0,0,0,.1)',
  },
  paletteDark: {
    backgroundColor: 'rgba(0,0,0,.28)',
    borderColor: 'rgba(255,255,255,.16)',
  },
  avatarLight: { backgroundColor: '#222426' },
  avatarDark: { backgroundColor: '#ffffff' },
  infoLight: { backgroundColor: '#0000000f' },
  infoDark: { backgroundColor: '#ffffff1a' },
  dueLight: { backgroundColor: '#f3e8e8' },
  dueDark: { backgroundColor: '#ffffff1f' },
  salary: { backgroundColor: '#157f83' },
  mcdonald: { backgroundColor: '#da291c' },
  spotify: { backgroundColor: '#1db954' },
});
const fidelityStyles = StyleSheet.create({
  s0: { width: '34%', backgroundColor: '#00a6a6' },
  s1: { width: '12%', backgroundColor: '#60c8c5' },
  s2: { flex: 1, backgroundColor: '#d0001a' },
});
