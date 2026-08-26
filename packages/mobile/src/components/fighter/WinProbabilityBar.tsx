import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useAppTheme } from "~/providers/app-theme-provider";

export function WinProbabilityBar({
  probability,
  height = 4,
}: {
  probability: number;
  height?: number;
}) {
  const { theme } = useAppTheme();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: probability,
      duration: 0,
      useNativeDriver: false,
    }).start();
  }, [probability, anim]);

  return (
    <View
      style={[
        styles.track,
        { height, borderRadius: height * 3, backgroundColor: theme.accentContent },
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            height,
            backgroundColor: theme.accent,
            width: anim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: "100%",
    overflow: "hidden",
  },
  fill: {},
});
