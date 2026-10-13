import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
  type StyleProp,
  type TextStyle,
} from 'react-native';
import { Text } from '../../../../universal/Typography';
import { s } from './Primitives';
type Heading = { children: React.ReactNode; style?: StyleProp<TextStyle> };
const HeadingSetter = createContext<React.Dispatch<
  React.SetStateAction<Heading | null>
> | null>(null);
const HeadingContent = createContext<Heading | null>(null);
const FooterSlot = createContext<React.Dispatch<
  React.SetStateAction<React.ReactNode>
> | null>(null);
/** Its own state keeps the page children stable when footer actions change. */
export function InvestmentPageLayout({
  children,
  pinHeading = false,
  onHeadingChange,
}: {
  children: React.ReactNode;
  pinHeading?: boolean;
  onHeadingChange?: () => void;
}) {
  const [footer, setFooter] = useState<React.ReactNode>(null);
  const [heading, setHeading] = useState<Heading | null>(null);
  const headingText = heading?.children;
  useEffect(() => {
    if (headingText != null && pinHeading) onHeadingChange?.();
  }, [headingText, pinHeading, onHeadingChange]);
  return (
    <FooterSlot.Provider value={setFooter}>
      <HeadingSetter.Provider value={pinHeading ? setHeading : null}>
        <HeadingContent.Provider value={pinHeading ? heading : null}>
          <View style={styles.page}>
            {children}
            {footer && <View style={styles.footer}>{footer}</View>}
          </View>
        </HeadingContent.Provider>
      </HeadingSetter.Provider>
    </FooterSlot.Provider>
  );
}
/** Place only the primary heading into the scroll's sticky host; controllers stay mounted. */
export function PageTitle({ children, style = s.pageTitle }: Heading) {
  const setHeading = useContext(HeadingSetter);
  useEffect(() => {
    setHeading?.({ children, style });
    return () => setHeading?.(null);
  }, [setHeading, children, style]);
  return setHeading ? null : (
    <Text accessibilityRole="header" style={style}>
      {children}
    </Text>
  );
}
export const InvestmentPageScroll = React.forwardRef<
  React.ElementRef<typeof ScrollView>,
  ScrollViewProps
>(function InvestmentScrollControl({ children, ...props }, ref) {
  const heading = useContext(HeadingContent);
  return (
    <ScrollView
      {...props}
      ref={ref}
      stickyHeaderIndices={heading ? [0] : undefined}
    >
      {heading && (
        <View>
          <StickyHeading style={heading.style}>
            {heading.children}
          </StickyHeading>
        </View>
      )}
      {children}
    </ScrollView>
  );
});
export function StickyHeading({ children, style = s.pageTitle }: Heading) {
  return (
    <View style={styles.heading}>
      <View pointerEvents="none" style={styles.beforeHeading} />
      <Text accessibilityRole="header" style={style}>
        {children}
      </Text>
      <View pointerEvents="none" style={styles.afterHeading} />
    </View>
  );
}
export function InvestmentFooter({ children }: { children: React.ReactNode }) {
  const setFooter = useContext(FooterSlot);
  useEffect(() => {
    setFooter?.(children);
    return () => setFooter?.(null);
  }, [setFooter, children]);
  return setFooter ? null : <View style={styles.footer}>{children}</View>;
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#fff' },
  heading: {
    backgroundColor: '#fff',
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  beforeHeading: {
    position: 'absolute',
    top: -16,
    left: 0,
    right: 0,
    height: 16,
    backgroundColor: '#fff',
  },
  afterHeading: {
    position: 'absolute',
    bottom: -24,
    left: 0,
    right: 0,
    height: 24,
    backgroundColor: '#fff',
  },
  footer: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 28,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    flexShrink: 0,
  },
});
