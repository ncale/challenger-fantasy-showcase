import { useEffect, useRef } from "react";
import { ActivityIndicator, Animated, View, type ViewStyle } from "react-native";
import { useThemeColors } from "~/hooks/use-theme-colors";

interface SkeletonBoxProps {
  width?: number | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonBox({ width = "100%", height, borderRadius = 6, style }: SkeletonBoxProps) {
  const { theme, opacity } = useThemeColors();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]),
    ).start();
  }, [anim]);

  const opacity_ = anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.baseContent + opacity[20],
          opacity: opacity_,
        },
        style,
      ]}
    />
  );
}

export function TrackListSkeleton() {
  const { theme } = useThemeColors();
  return (
    <View
      style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16, backgroundColor: theme.base300 }}
    >
      <SkeletonBox width="35%" height={11} borderRadius={4} style={{ marginBottom: 12 }} />
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          style={{
            borderRadius: 10,
            borderWidth: 1,
            borderColor: theme.baseContentExtraMuted,
            padding: 14,
            marginBottom: 6,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View style={{ flex: 1, gap: 6 }}>
            <SkeletonBox width={`${45 + (i % 3) * 15}%`} height={13} borderRadius={4} />
            <SkeletonBox width={`${30 + (i % 2) * 20}%`} height={11} borderRadius={4} />
          </View>
          <SkeletonBox width={48} height={24} borderRadius={12} />
        </View>
      ))}
    </View>
  );
}

export function SubmissionLoadingSkeleton() {
  const { theme } = useThemeColors();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.base300,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ActivityIndicator size="large" color={theme.baseContentMuted} />
    </View>
  );
}
