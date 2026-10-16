import React, { useId } from 'react';
import { Image, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import {
  resolveProfileAvatar,
  PROFILE_AVATAR_AI_PATHS,
  type ProfileAvatarVariant,
  type ProfileAvatarPhotoStyle,
} from '@/app/components/contracts/profileAvatar';
import { Text } from './Typography';
import { sourceColor } from './sourceColor';
/** DS/Kids avatar; the baseline header profile glyph remains a separate component. */
export function BaselineProfileAvatar({
  ariaLabel,
  imageAlt = '',
  imageSrc,
  initials,
  photoStyle,
  showNotification,
  size,
  variant,
  dark = false,
}: {
  ariaLabel?: string;
  imageAlt?: string;
  imageSrc?: string;
  initials?: string;
  photoStyle?: ProfileAvatarPhotoStyle;
  showNotification?: boolean;
  size?: number;
  variant?: ProfileAvatarVariant;
  dark?: boolean;
}) {
  const state = resolveProfileAvatar({
      variant,
      imageSrc,
      initials,
      photoStyle,
      showNotification,
      size,
    }),
    id = useId().replace(/:/g, ''),
    color = (token: string) => sourceColor(`var(${token})`, dark),
    shell = {
      width: state.size,
      height: state.size,
      borderRadius: state.size / 2,
      overflow: 'hidden' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    };
  const initialsStyle = {
    fontFamily: 'UniCredit-bold',
    fontSize: state.initialsFontSize,
    lineHeight: state.initialsLineHeight,
    color: color('--uc-static-white'),
  };
  const fill = {
      ...shell,
      backgroundColor: color(
        state.resolvedVariant === 'ai' ? '--uc-neutral-100' : '--uc-primary-k1',
      ),
    },
    photoSize =
      state.photoStyle === 'profile' ? state.profileImageSize : state.size,
    photo = {
      width: photoSize,
      height: photoSize,
      borderRadius: photoSize / 2,
    };
  const viewStyle1 = {
    position: 'absolute',
    top: 0,
    right: state.notificationRight,
    width: state.notificationSize,
    height: state.notificationSize,
    borderRadius: state.notificationSize / 2,
    backgroundColor: color('--uc-red-main'),
  } as const;
  return (
    <View
      accessibilityLabel={ariaLabel}
      accessible={Boolean(ariaLabel)}
      accessibilityElementsHidden={!ariaLabel}
      style={shell}
    >
      {state.resolvedVariant === 'ai' ? (
        <View style={fill}>
          <Svg
            width={state.aiGlyphSize}
            height={state.aiGlyphSize}
            viewBox="0 0 24 24"
          >
            <Defs>
              <LinearGradient
                id={id}
                x1="0"
                x2="24"
                y1="0"
                y2="0.65"
                gradientUnits="userSpaceOnUse"
              >
                <Stop stopColor="#004F95" />
                <Stop offset="1" stopColor="#007A91" />
              </LinearGradient>
            </Defs>
            {PROFILE_AVATAR_AI_PATHS.map((d, i) => (
              <Path key={i} d={d} fill={`url(#${id})`} />
            ))}
          </Svg>
        </View>
      ) : state.resolvedVariant === 'photo' ? (
        <Image
          source={{ uri: imageSrc }}
          resizeMode="cover"
          accessibilityLabel={imageAlt || undefined}
          accessible={Boolean(imageAlt)}
          style={photo}
        />
      ) : (
        <View style={fill}>
          <Text style={initialsStyle}>{state.resolvedInitials}</Text>
        </View>
      )}
      {state.showNotification ? <View style={viewStyle1} /> : null}
    </View>
  );
}
