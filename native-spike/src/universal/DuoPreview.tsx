import React, { createContext, useContext, type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import {
  resolveDuoContent,
  type DuoPreviewViewport,
} from '@/features/demo-native/duoPreview';

const Context = createContext<DuoPreviewViewport | undefined>(undefined);
export const DuoPreviewProvider = Context.Provider;
export const useDuoPreview = () => useContext(Context);
const LocalContext = createContext<
  ReturnType<typeof resolveDuoContent> | undefined
>(undefined);
/** Allows adaptive experience shells to provide their actual content bounds. */
export const DuoLocalViewportProvider = LocalContext.Provider;
export const useDuoLocalViewport = () => useContext(LocalContext);

/** Adds grouping only in Duo; the normal phone keeps its original native view tree. */
export function DuoOnlyView(props: React.ComponentProps<typeof View>) {
  const preview = useDuoPreview();
  return preview ? <View {...props} /> : <>{props.children}</>;
}

/** Layout only; the actual baseline screen, feature state and callbacks remain mounted. */
export function DuoContentViewport({
  children,
  screen,
}: {
  children: ReactNode;
  screen?: string;
}) {
  const preview = useDuoPreview();
  const frame = preview ? resolveDuoContent(preview, screen) : undefined;
  return (
    <LocalContext.Provider value={frame}>{children}</LocalContext.Provider>
  );
}

/** Constrain a local form/list state independently, without adding or replacing its native root. */
export function DuoReadable({
  children,
  maxWidth = 560,
}: {
  children: React.ReactElement<{ style?: StyleProp<ViewStyle> }>;
  maxWidth?: number;
}) {
  const preview = useDuoPreview();
  const parent = useDuoLocalViewport();
  const width = parent ? Math.min(parent.width, maxWidth) : undefined;
  const frame =
    parent && width !== undefined
      ? { ...parent, width, left: parent.left + (parent.width - width) / 2 }
      : parent;
  return (
    <LocalContext.Provider value={frame}>
      {preview
        ? React.cloneElement(children, {
            style: [
              children.props.style,
              { width: '100%', maxWidth, alignSelf: 'center' },
            ],
          })
        : children}
    </LocalContext.Provider>
  );
}

export function useDuoWide() {
  const preview = useDuoPreview();
  const local = useDuoLocalViewport();
  return !!preview && !!local && local.width >= preview.referenceWidth * 2;
}

/** Full-glass background with foreground gutters derived from the actual preview geometry. */
export function DuoFullWidthSection({
  children,
  backgroundColor,
}: {
  children: ReactNode;
  backgroundColor: string;
}) {
  const preview = useDuoPreview();
  const frame = useDuoLocalViewport();
  return (
    <View
      testID="duo-full-width-section"
      style={{
        width: '100%',
        backgroundColor,
        ...(preview && frame
          ? {
              paddingLeft: frame.left,
              paddingRight: preview.width - frame.left - frame.width,
            }
          : {}),
      }}
    >
      {children}
    </View>
  );
}

/** Keep one mounted tree while switching between stacked and side-by-side compositions. */
export function DuoColumns({
  children,
  rowGap = 0,
}: {
  children: ReactNode;
  rowGap?: number;
}) {
  const preview = useDuoPreview();
  const wide = useDuoWide();
  if (!preview) return <>{children}</>;
  return (
    <View
      testID="duo-columns"
      style={{
        width: '100%',
        flexDirection: wide ? 'row' : 'column',
        flexWrap: wide ? 'wrap' : 'nowrap',
        alignItems: 'flex-start',
        rowGap,
      }}
    >
      {children}
    </View>
  );
}

export function DuoPane({ children }: { children: ReactNode }) {
  const preview = useDuoPreview();
  const frame = useDuoLocalViewport();
  const wide = useDuoWide();
  if (!preview || !frame) return <>{children}</>;
  const width = wide ? preview.referenceWidth : frame.width;
  return (
    <LocalContext.Provider value={{ ...frame, width }}>
      <View
        testID="duo-pane"
        style={{ width: wide ? width : '100%', minWidth: 0 }}
      >
        {children}
      </View>
    </LocalContext.Provider>
  );
}
