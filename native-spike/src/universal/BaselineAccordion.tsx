import React, {
  Children,
  cloneElement,
  isValidElement,
  useState,
  useRef,
  useEffect,
} from 'react';
import { Animated, Easing, Pressable, View } from 'react-native';
import { resolveAccordion } from '@/app/components/contracts/accordion';
import { Text } from './Typography';
import { SourceCustomIcon } from './SourceCustomIcon';
import { sourceColor } from './sourceColor';
type ChildProps = { children?: React.ReactNode; isOpen?: boolean };
export function BaselineAccordion({
  title,
  children,
  defaultOpen = true,
  dark = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  dark?: boolean;
}) {
  const [isOpen, setOpen] = useState(defaultOpen),
    first = Children.toArray(children)[0],
    productCount =
      isValidElement<ChildProps>(first) && first.props.children
        ? Children.toArray(first.props.children).length
        : 0,
    state = resolveAccordion({ productCount, isOpen });
  const [hovered, setHovered] = useState(false);
  const rotation = useRef(new Animated.Value(isOpen ? 1 : 0)).current;
  const [x1, y1, x2, y2] = state.easing;
  useEffect(() => {
    const motion = Animated.timing(rotation, {
      toValue: isOpen ? 1 : 0,
      duration: state.durationMs,
      easing: Easing.bezier(x1, y1, x2, y2),
      useNativeDriver: true,
    });
    motion.start();
    return () => motion.stop();
  }, [isOpen, rotation, state.durationMs, x1, y1, x2, y2]);
  const header = {
    height: state.headerHeight,
    paddingHorizontal: state.gutter,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  };
  const textStyle1 = {
    fontFamily: 'UniCredit-bold',
    fontSize: 24,
    color: sourceColor(`var(${state.textToken})`, dark),
  } as const;
  const label = <Text style={textStyle1}>{title}</Text>;
  const slots = Children.map(children, child =>
    isValidElement<ChildProps>(child) && typeof child.type !== 'string'
      ? cloneElement(child, { isOpen })
      : child,
  );
  const viewStyle2 = {
    width: state.iconSlot,
    height: state.iconSlot,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [
      {
        rotate: rotation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '180deg'],
        }),
      },
    ],
  } as const;
  const viewStyle3 = { paddingTop: state.contentPaddingTop } as const;
  const pressableStyle1 = [
    header,
    { opacity: hovered ? state.hoverOpacity : 1 },
  ] as const;
  return (
    <View>
      {state.single ? (
        <View style={header}>{label}</View>
      ) : (
        <Pressable
          accessibilityRole="button"
          onPress={() => setOpen(!isOpen)}
          onHoverIn={() => setHovered(true)}
          onHoverOut={() => setHovered(false)}
          style={pressableStyle1}
        >
          {label}
          <Animated.View style={viewStyle2}>
            <SourceCustomIcon
              name={state.chevron}
              size={20}
              color={sourceColor(`var(${state.iconToken})`, dark)}
            />
          </Animated.View>
        </Pressable>
      )}
      <View style={viewStyle3}>{slots}</View>
    </View>
  );
}
