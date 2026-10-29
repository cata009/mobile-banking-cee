import React, { useId } from 'react';
import {
  View,
  Image,
  Platform,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Svg, {
  Circle,
  ClipPath,
  Defs,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text,
} from 'react-native-svg';
import {
  CARD_ARTWORK,
  resolveCardArtwork,
  type CardVariant,
  type CardSize,
} from '@/app/components/contracts/cardArtwork';
/** Original Source paths, tones, logo and dimensions; shared data, Native SVG renderer. */
export function BaselineCardArtwork({
  variant,
  size,
  ariaLabel,
  style,
  clipGeometry = false,
  backgroundRadius = 0,
  transparentCanvas = false,
  backgroundPhoto,
  labelFontFamily = 'Arial, Helvetica, sans-serif',
}: {
  variant?: CardVariant;
  size?: CardSize;
  ariaLabel?: string;
  style?: StyleProp<ViewStyle>;
  clipGeometry?: boolean;
  /** Compatibility geometry for the existing banking adapter; the shared viewBox stays 64×40. */
  backgroundRadius?: number;
  transparentCanvas?: boolean;
  /** Optional original photo beneath the executable card marks. */
  backgroundPhoto?: ImageSourcePropType;
  labelFontFamily?: string;
}) {
  const state = resolveCardArtwork({ variant, size }),
    { tone } = state,
    id = useId().replace(/:/g, '');
  const fill = tone.backgroundEnd ? `url(#${id}bg)` : tone.background,
    pattern = tone.patternEnd ? `url(#${id}pattern)` : tone.pattern;
  const shell = {
    width: state.width,
    height: state.height,
    borderRadius: state.radius,
    overflow: 'hidden' as const,
    backgroundColor:
      clipGeometry || transparentCanvas ? undefined : tone.background,
    ...(Platform.OS === 'web' && !clipGeometry && !transparentCanvas
      ? {
          transform: 'translateZ(0)',
          backgroundImage: tone.backgroundEnd
            ? `linear-gradient(135deg, ${tone.background} 0%, ${tone.backgroundEnd} 100%)`
            : undefined,
        }
      : {}),
  };
  const viewStyle1 = [shell as ViewStyle, style] as const;
  return (
    <View
      accessibilityRole={ariaLabel ? 'image' : undefined}
      accessibilityLabel={ariaLabel}
      accessible={Boolean(ariaLabel)}
      style={viewStyle1}
    >
      {backgroundPhoto ? (
        <Image
          source={backgroundPhoto}
          resizeMode="cover"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{ position: 'absolute', width: '100%', height: '100%' }}
        />
      ) : null}
      <Svg
        width="100%"
        height="100%"
        viewBox={state.viewBox}
        preserveAspectRatio="none"
        style={[
          Platform.OS === 'web' && !clipGeometry
            ? ({ borderRadius: 'inherit' } as unknown as ViewStyle)
            : undefined,
          backgroundPhoto ? { position: 'relative', zIndex: 1 } : undefined,
        ]}
      >
        <Defs>
          {backgroundPhoto ? (
            <LinearGradient
              id={`${id}photoShade`}
              gradientUnits="userSpaceOnUse"
              x1="0"
              x2="64"
              y1="0"
              y2="0"
            >
              <Stop offset="0.35" stopColor="#000000" stopOpacity="0" />
              <Stop offset="1" stopColor="#000000" stopOpacity="0.62" />
            </LinearGradient>
          ) : null}
          {clipGeometry ? (
            <ClipPath id={`${id}clip`}>
              <Rect width="64" height="40" rx="4" />
            </ClipPath>
          ) : null}
          {tone.backgroundEnd ? (
            <LinearGradient id={`${id}bg`} x1="0" x2="64" y1="0" y2="40">
              <Stop offset="0" stopColor={tone.background} />
              <Stop offset="1" stopColor={tone.backgroundEnd} />
            </LinearGradient>
          ) : null}
          {tone.patternEnd ? (
            <LinearGradient id={`${id}pattern`} x1="0" x2="32" y1="0" y2="40">
              <Stop offset="0" stopColor={tone.pattern} />
              <Stop offset="1" stopColor={tone.patternEnd} />
            </LinearGradient>
          ) : null}
        </Defs>
        <G clipPath={clipGeometry ? `url(#${id}clip)` : undefined}>
          {backgroundPhoto ? (
            <Rect width="64" height="40" fill={`url(#${id}photoShade)`} />
          ) : null}
          {!backgroundPhoto ? (
            <>
              <Rect
                width="64"
                height="40"
                rx={backgroundRadius || undefined}
                fill={fill}
              />
              <Path
                d={CARD_ARTWORK.edgeArrowPath}
                fill={pattern}
                opacity={state.firstArrowOpacity}
              />
              <Path
                d={CARD_ARTWORK.arrowPath}
                fill={pattern}
                opacity={state.secondArrowOpacity}
              />
              <Path
                d={CARD_ARTWORK.detailPath}
                fill="none"
                stroke="#FFFFFF"
                strokeOpacity="0.1"
                strokeWidth="0.4"
              />
            </>
          ) : null}
          <G transform={CARD_ARTWORK.logoTransform}>
            {[
              CARD_ARTWORK.logoPaths.p2cef6600,
              CARD_ARTWORK.logoPaths.p27e9da00,
            ].map((d, i) => (
              <Path
                key={i}
                d={d}
                fill={tone.brandMark}
                clipRule="evenodd"
                fillRule="evenodd"
              />
            ))}
            <Path
              d={CARD_ARTWORK.logoPaths.p2e662b0}
              fill="#FFFFFF"
              clipRule="evenodd"
              fillRule="evenodd"
            />
            {[
              CARD_ARTWORK.logoPaths.p3d56e1f0,
              CARD_ARTWORK.logoPaths.p18a76220,
              CARD_ARTWORK.logoPaths.p2205fa00,
              CARD_ARTWORK.logoPaths.p4138200,
              CARD_ARTWORK.logoPaths.p120fd332,
              CARD_ARTWORK.logoPaths.p3558cb00,
              CARD_ARTWORK.logoPaths.p29646d00,
              CARD_ARTWORK.logoPaths.p3ed7ba20,
              CARD_ARTWORK.logoPaths.p4240280,
            ].map((d, i) => (
              <Path key={i} d={d} fill={tone.logoText} />
            ))}
          </G>
          <G transform={CARD_ARTWORK.networkTransform}>
            <Circle
              cx="4.1"
              cy="4.1"
              r="4.05"
              fill={tone.mastercardRed}
              stroke={tone.mastercardStroke}
              strokeWidth={tone.mastercardStroke === 'transparent' ? 0 : 0.42}
            />
            <Circle
              cx="9.1"
              cy="4.1"
              r="4.05"
              fill={tone.mastercardYellow}
              stroke={tone.mastercardStroke}
              strokeWidth={tone.mastercardStroke === 'transparent' ? 0 : 0.42}
            />
            <Path
              d={CARD_ARTWORK.networkCenterPath}
              fill={tone.mastercardCenter}
              opacity="0.92"
            />
          </G>
          <Text
            fill={tone.labelColor}
            fontFamily={labelFontFamily}
            fontSize="2.55"
            fontWeight="700"
            letterSpacing="0.18"
            textAnchor="end"
            x="61.1"
            y="22.1"
          >
            {tone.typeLabel}
          </Text>
        </G>
      </Svg>
    </View>
  );
}
