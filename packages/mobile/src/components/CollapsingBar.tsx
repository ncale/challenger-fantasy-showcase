import { useCallback, useRef } from "react";
import type { ViewStyle } from "react-native";
import { Animated, StyleSheet } from "react-native";

export function useCollapsingBar(height: number) {
  const animatedHeight = useRef(new Animated.Value(height)).current;
  const lastScrollY = useRef(0);
  const collapsed = useRef(false);

  const onScroll = useCallback(
    (e: { nativeEvent: { contentOffset: { y: number } } }) => {
      const y = e.nativeEvent.contentOffset.y;
      const delta = y - lastScrollY.current;
      lastScrollY.current = y;

      if (delta > 4 && y > 30 && !collapsed.current) {
        collapsed.current = true;
        Animated.timing(animatedHeight, {
          toValue: 0,
          duration: 220,
          useNativeDriver: false,
        }).start();
      } else if (delta < -4 && collapsed.current) {
        collapsed.current = false;
        Animated.timing(animatedHeight, {
          toValue: height,
          duration: 220,
          useNativeDriver: false,
        }).start();
      }
    },
    [animatedHeight, height],
  );

  return { animatedHeight, onScroll, scrollEventThrottle: 16 as const };
}

type CollapsingBarProps = {
  animatedHeight: Animated.Value;
  children: React.ReactNode;
  style?: ViewStyle;
};

export function CollapsingBar({ animatedHeight, children, style }: CollapsingBarProps) {
  return (
    <Animated.View style={[styles.wrapper, { height: animatedHeight }, style]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: "hidden",
  },
});
