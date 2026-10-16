import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { SourceTextField } from './SourceTextField';
import { Copy, useCurrentTokens, useSourceColors } from './Primitives';
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
  return (
    <View style={styles.field}>
      <SourceTextField
        label={label}
        value={value}
        onChange={() => {}}
        helperText={helper}
        onActivate={onPress}
        trailingIconName={trailingIconName}
        inputProps={{ editable: false }}
      />
    </View>
  );
}
export function FormHeading({ children }: { children: React.ReactNode }) {
  const color = useSourceColors();
  return (
    <View
      style={[
        styles.heading,
        { borderBottomColor: color('--uc-border-muted') },
      ]}
    >
      <Copy strong size={14} lineHeight={15.5}>
        {typeof children === 'string' ? children.toUpperCase() : children}
      </Copy>
    </View>
  );
}
export function ReviewValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const tokens = useCurrentTokens();
  return (
    <View>
      <Copy size={14} lineHeight={15.5} color={tokens.muted}>
        {label}
      </Copy>
      <View style={styles.value}>
        <Copy strong lineHeight={17.5}>
          {value}
        </Copy>
      </View>
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
    <View style={styles.section}>
      <FormHeading>{title}</FormHeading>
      <View style={styles.values}>{children}</View>
    </View>
  );
}
const styles = StyleSheet.create({
  field: { minHeight: 96, marginRight: -12 },
  heading: { borderBottomWidth: 1, paddingBottom: 8, marginBottom: 14 },
  value: { marginTop: 2 },
  section: { marginTop: 28 },
  values: { gap: 20 },
});
export function MeetingIcon({ type }: { type: 'branch' | 'online' }) {
  return type === 'branch' ? (
    <Svg width={32} height={32} viewBox="0 0 32 32" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.25 9.75C17.25 9.06 16.69 8.5 16 8.5C15.31 8.5 14.75 9.06 14.75 9.75C14.75 10.44 15.31 11 16 11C16.69 11 17.25 10.44 17.25 9.75ZM9.125 12.875H8.5C7.11937 12.875 6 11.7556 6 10.375L16 6L26 10.375C26 11.7556 24.8806 12.875 23.5 12.875H22.875V21.625H20.375V12.875H17.25V21.625H14.75V12.875H11.625V21.625H9.125V12.875ZM20.375 22.875H22.875H23.5H25.375V25.375H6.625V22.875H8.5H9.125H11.625H14.75H17.25H20.375Z"
        fill="#262626"
      />
    </Svg>
  ) : (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.875 2.0625V6.1875H15.8125V4.125H2.0625V13.75H13.0625V16.5H0V4.125C0 2.98581 0.923313 2.0625 2.0625 2.0625H17.875ZM18.4552 19.3751C17.9891 19.3751 17.611 18.997 17.611 18.5309C17.611 18.0654 17.9891 17.688 18.4552 17.688C18.9214 17.688 19.2988 18.0654 19.2988 18.5309C19.2988 18.997 18.9214 19.3751 18.4552 19.3751ZM15.95 7.5625C15.1147 7.5625 14.4375 8.25481 14.4375 9.10938V19.9375H20.4875C21.3235 19.9375 22 19.2445 22 18.3906V7.5625H15.95ZM8.9375 17.875C7.39819 17.875 5.98263 18.2868 4.8125 18.9722V19.9375H13.0625V18.9722C11.8938 18.2868 10.4768 17.875 8.9375 17.875Z"
        fill="#262626"
      />
    </Svg>
  );
}
