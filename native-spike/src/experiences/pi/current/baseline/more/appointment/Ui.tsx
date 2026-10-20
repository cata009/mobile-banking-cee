import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  Platform,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type TextStyle,
  type TextProps,
  type ViewStyle,
  type ImageSourcePropType,
} from 'react-native';
import type { CurrentScreenProps } from '../../../contracts';
import { BaselinePageHeader } from '../../../../../../universal/BaselinePageHeader';
import { BaselineTextField } from '../../../../../../universal/BaselineTextField';
import { PrimaryButton } from '../../../../../../universal/PrimaryButton';
import { SourceCustomIcon } from '../../../../../../universal/SourceCustomIcon';
import { Text, TextInput } from '../../../../../../universal/Typography';
import { sourceColor } from '../../../../../../universal/sourceColor';
import { serviceDark } from '../ServicePrimitives';
import { advisorPhoto as sourceAdvisorPhoto } from '../../../profile/assets';

const Host = createContext<
  (CurrentScreenProps & { advisorPhoto?: ImageSourcePropType }) | null
>(null);
export const webInputOutline: TextStyle =
  Platform.OS === 'web' ? { outlineStyle: 'solid', outlineWidth: 0 } : {};
/** Source resets the textarea before measuring, so deleting text also shrinks it. */
export function useAutoGrow(value: string, minimum: number) {
  const ref = useRef<React.ComponentRef<typeof TextInput>>(null);
  const [height, setHeight] = useState(minimum);
  useLayoutEffect(() => {
    const input = ref.current;
    if (
      Platform.OS !== 'web' ||
      typeof HTMLTextAreaElement === 'undefined' ||
      !(input instanceof HTMLTextAreaElement)
    )
      return;
    input.style.overflowY = 'hidden';
    input.style.height = 'auto';
    const computed = getComputedStyle(input);
    // scrollHeight includes padding, but not the border of this border-box field.
    const borders =
      (parseFloat(computed.borderTopWidth) || 0) +
      (parseFloat(computed.borderBottomWidth) || 0);
    const next = Math.max(minimum, Math.ceil(input.scrollHeight + borders));
    input.style.height = `${next}px`;
    setHeight(next);
  }, [value, minimum]);
  return {
    ref,
    height,
    onContentSizeChange: (event: {
      nativeEvent: { contentSize: { height: number } };
    }) => {
      if (Platform.OS !== 'web')
        setHeight(Math.max(minimum, event.nativeEvent.contentSize.height));
    },
  };
}
export function AppointmentHost({
  host,
  children,
  advisorPhoto,
}: {
  host: CurrentScreenProps;
  children: React.ReactNode;
  advisorPhoto?: ImageSourcePropType;
}) {
  return (
    <Host.Provider value={advisorPhoto ? { ...host, advisorPhoto } : host}>
      {children}
    </Host.Provider>
  );
}
export function useAppointmentHost() {
  const host = useContext(Host);
  if (!host) throw new Error('Appointment host is required');
  return host;
}
/** All appointment substeps resolve the portrait from the same optional reference identity. */
export function useAppointmentAdvisorPhoto() {
  return useAppointmentHost().advisorPhoto ?? sourceAdvisorPhoto;
}
export function useColors() {
  const host = useAppointmentHost();
  return (name: string) => sourceColor(`var(${name})`, serviceDark(host));
}
export function Copy({
  children,
  strong = false,
  size = 16,
  color,
  style,
  numberOfLines,
  accessibilityRole,
}: {
  children: React.ReactNode;
  strong?: boolean;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  accessibilityRole?: TextProps['accessibilityRole'];
}) {
  const host = useAppointmentHost();
  const copyStyle = {
    fontFamily: strong ? 'UniCredit-bold' : 'UniCredit-regular',
    fontSize: size,
    color: color ?? host.tokens.text,
  };
  return (
    <Text accessibilityRole={accessibilityRole} numberOfLines={numberOfLines} style={[copyStyle, style]}>
      {children}
    </Text>
  );
}
export function Button({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const host = useAppointmentHost();
  return (
    <PrimaryButton
      label={label}
      labelSize="18"
      disabled={disabled}
      onPress={onPress}
      dark={serviceDark(host)}
    />
  );
}
export function Link({
  label,
  onPress,
  uppercase = false,
  size = 14,
  style,
  expanded,
  href,
}: {
  label: string;
  uppercase?: boolean;
  size?: number;
  style?: StyleProp<ViewStyle>;
  expanded?: boolean;
} & ({ onPress: () => void; href?: string } | { href: string; onPress?: () => void })) {
  const color = useColors();
  return (
    <Pressable
      accessibilityRole={href ? 'link' : 'button'}
      {...(Platform.OS === 'web' && href ? { href } : {})}
      accessibilityLabel={label}
      accessibilityState={expanded === undefined ? undefined : { expanded }}
      onPress={onPress ?? (href && Platform.OS !== 'web' ? () => { void Linking.openURL(href).catch(() => undefined); } : undefined)}
      style={style}
    >
      <Copy strong size={size} color={color('--uc-action')}>
        {uppercase ? label.toUpperCase() : label}
      </Copy>
    </Pressable>
  );
}
export function AppointmentPage({
  title,
  onBack,
  children,
  footer,
  overlays,
  topContent,
  showLargeTitle = true,
  showBack = true,
  headerVariant = 'light',
}: {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  overlays?: React.ReactNode;
  topContent?: React.ReactNode;
  showLargeTitle?: boolean;
  showBack?: boolean;
  headerVariant?: 'light' | 'gray';
}) {
  const host = useAppointmentHost(),
    color = useColors();
  const [progress, setProgress] = useState(0);
  useEffect(() => setProgress(0), [title]);
  return (
    <View style={[s.root, { backgroundColor: color('--uc-surface') }]}>
      <ScrollView
        key={title}
        testID="appointment-page-scroll"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
        scrollEventThrottle={16}
        onScroll={event => {
          const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
          const availableScroll = contentSize && layoutMeasurement
            ? contentSize.height - layoutMeasurement.height
            : 48;
          const distance = availableScroll > 0 ? Math.min(48, availableScroll) : 48;
          setProgress(Math.min(1, Math.max(0, contentOffset.y / distance)));
        }}
        style={Platform.OS === 'web' ? s.webScroll : undefined}
        contentContainerStyle={s.body}
      >
        <View style={{ backgroundColor: color('--uc-surface') }}>
          <BaselinePageHeader
            title={title}
            onBack={onBack}
            showHelp={false}
            showBack={showBack}
            includeSafeArea
            safeAreaReserve={host.screenTopInset}
            renderLargeTitle={false}
            collapsedTitleProgress={showLargeTitle ? progress : 1}
            hideCollapsedTitleWhenHidden
            variant={headerVariant}
            dark={serviceDark(host)}
          />
        </View>
        {showLargeTitle ? (
          <View style={[s.largeTitle, { opacity: 1 - progress }]} aria-hidden={progress >= 1}>
            <Copy strong size={28} numberOfLines={2} accessibilityRole="header">
              {title}
            </Copy>
          </View>
        ) : null}
        {topContent}
        {children}
      </ScrollView>
      {footer ? (
        <View style={[s.footer, { backgroundColor: color('--uc-surface') }]}>
          {footer}
        </View>
      ) : null}
      {overlays}
    </View>
  );
}
export function useFlowBack(back: () => boolean) {
  const host = useAppointmentHost();
  useEffect(() => {
    if (!host.isActive) return;
    host.onBackHandlerChange?.(back);
    return () => host.onBackHandlerChange?.(null);
  }, [host, back]);
}
export function SectionHeading({ children }: { children: React.ReactNode }) {
  const color = useColors();
  return (
    <View
      style={[s.heading, { borderBottomColor: color('--uc-border-muted') }]}
    >
      <Copy strong size={14}>
        {typeof children === 'string' ? children.toUpperCase() : children}
      </Copy>
    </View>
  );
}
export function FieldValue({
  label,
  value = '',
  helper,
  onPress,
  trailingIconName = 'chevron-down-wide',
}: {
  label: string;
  value?: string;
  helper?: string;
  onPress: () => void;
  trailingIconName?: string;
}) {
  const host = useAppointmentHost();
  return (
    <View style={s.field}>
      <BaselineTextField
        label={label}
        value={value}
        onChange={() => undefined}
        readOnly
        onActivate={onPress}
        helperText={helper}
        trailingIconName={trailingIconName}
        trailingIconColor={
          trailingIconName === 'insurance-calendar' ? 'transparent' : undefined
        }
        trailingIconAction={{ ariaLabel: `Open ${label}`, onClick: onPress }}
        dark={serviceDark(host)}
      />
      {trailingIconName === 'insurance-calendar' ? (
        <View
          pointerEvents="none"
          style={[
            s.calendarIcon,
            value.trim() ? s.calendarIconWithValue : undefined,
          ]}
        >
          <SourceCustomIcon
            name="insurance-calendar"
            size={32}
            color={host.tokens.text}
          />
        </View>
      ) : null}
    </View>
  );
}
export function ReviewSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={s.reviewSection}>
      <SectionHeading>{title}</SectionHeading>
      <View style={s.reviewValues}>{children}</View>
    </View>
  );
}
export function ReviewValue({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  const color = useColors();
  return (
    <View>
      <Copy size={14} color={color('--uc-text-muted')}>
        {label}
      </Copy>
      {children ?? (
        <Copy strong style={s.mt2}>
          {value}
        </Copy>
      )}
    </View>
  );
}
export function Notes({
  value,
  onChange,
  text,
}: {
  value: string;
  onChange: (notes: string) => void;
  text: (key: string, fallback: string) => string;
}) {
  const color = useColors();
  const grow = useAutoGrow(value, 25);
  const [focused, setFocused] = useState(false);
  const label = text('additionalNotes', 'Additional notes');
  return (
    <View style={s.notes}>
      <Copy>{label}</Copy>
      <TextInput
        ref={grow.ref}
        accessibilityLabel={label}
        value={value}
        onChangeText={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        multiline
        scrollEnabled={false}
        textAlignVertical="top"
        numberOfLines={1}
        maxLength={500}
        onContentSizeChange={grow.onContentSizeChange}
        style={[
          s.notesInput,
          webInputOutline,
          {
            height: grow.height,
            color: color('--uc-text'),
            borderBottomColor: color(focused ? '--uc-action' : '--uc-border'),
          },
        ]}
      />
      <Copy size={14} color={color('--uc-text-muted')} style={s.notesHelper}>
        {text(
          'notesHelper',
          'Our colleagues will take care of your notes and get prepared with all the requested answers',
        )}
      </Copy>
    </View>
  );
}
export function NotesFooter({
  notes,
  onContinue,
  onSkip,
  text,
}: {
  notes: string;
  onContinue: () => void;
  onSkip: () => void;
  text: (key: string, fallback: string) => string;
}) {
  return (
    <>
      <Button
        label={text('continue', 'Continue')}
        disabled={!notes.trim()}
        onPress={onContinue}
      />
      <Link
        label={text('skipNotes', 'Continue without any notes')}
        onPress={onSkip}
        size={16}
        style={s.skip}
      />
    </>
  );
}
export function Success({
  title,
  thanks,
  paragraphs,
  label,
  onDone,
  feedback = false,
}: {
  title: string;
  thanks: string;
  paragraphs: readonly string[];
  label: string;
  onDone: () => void;
  feedback?: boolean;
}) {
  const host = useAppointmentHost(),
    color = useColors();
  return (
    <View style={[s.root, { backgroundColor: color('--uc-surface') }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={Platform.OS === 'web' ? s.webScroll : undefined}
        contentContainerStyle={[
          s.successContent,
          { paddingTop: host.screenTopInset + 16 },
        ]}
      >
        <Copy strong size={28} accessibilityRole="header">
          {title}
        </Copy>
        <View style={s.markWrap}>
          <View style={s.mark}>
            <SourceCustomIcon name="check" size={56} color="#43854f" />
          </View>
        </View>
        <Copy strong style={feedback ? undefined : s.mb18}>
          {thanks}
        </Copy>
        {paragraphs.map((paragraph, index) => (
          <Copy
            key={paragraph}
            size={18}
            style={
              feedback
                ? s.mt4
                : index < paragraphs.length - 1
                ? s.mb18
                : undefined
            }
          >
            {paragraph}
          </Copy>
        ))}
      </ScrollView>
      <View style={s.footer}>
        <Button label={label} onPress={onDone} />
      </View>
    </View>
  );
}
export const s = StyleSheet.create({
  root: { flex: 1 },
  webScroll: { transform: 'none' },
  body: { paddingBottom: 12 },
  largeTitle: { paddingHorizontal: 16, paddingVertical: 8 },
  footer: { paddingHorizontal: 24, paddingBottom: 32, paddingTop: 12 },
  heading: { marginBottom: 14, borderBottomWidth: 1, paddingBottom: 8 },
  field: { marginRight: -12, minHeight: 96 },
  calendarIcon: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 32,
    height: 32,
  },
  calendarIconWithValue: { top: 19 },
  reviewSection: { marginTop: 28 },
  reviewValues: { gap: 20 },
  mt2: { marginTop: 2 },
  mt4: { marginTop: 4 },
  mt6: { marginTop: 6 },
  mt8: { marginTop: 8 },
  mb18: { marginBottom: 18 },
  mb24: { marginBottom: 24 },
  mb28: { marginBottom: 28 },
  form: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24 },
  review: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24 },
  notes: { paddingHorizontal: 24, paddingTop: 24 },
  notesInput: {
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
    marginTop: 4,
    paddingHorizontal: 0,
    paddingVertical: 4,
    borderBottomWidth: 1,
    outlineWidth: 0,
  },
  skip: {
    marginTop: 12,
    alignItems: 'center',
    height: 24,
    justifyContent: 'flex-start',
    paddingTop: 3,
  },
  notesHelper: { marginTop: 13 },
  successContent: { paddingHorizontal: 24, paddingBottom: 24 },
  markWrap: { marginVertical: 52, alignItems: 'center' },
  mark: {
    width: 96,
    height: 96,
    borderWidth: 6,
    borderColor: '#43854f',
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
