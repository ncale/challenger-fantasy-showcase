import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "~/providers/app-theme-provider";
import { WinProbabilityBar } from "./WinProbabilityBar";

type Props = { probability: number | null; onPress?: () => void };

export function WinProbabilityDisplay({ probability, onPress }: Props) {
  const { theme } = useAppTheme();

  if (probability === null) {
    return (
      <View style={styles.container}>
        <Text style={[styles.pct, { color: theme.baseContentMuted }]}>-</Text>
      </View>
    );
  }

  const content = (
    <>
      <Text style={[styles.pct, { color: theme.baseContent }]}>
        {Math.round(probability * 100)}%
      </Text>
      <WinProbabilityBar probability={probability} />
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={1} style={styles.container}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.container}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    width: 52,
    justifyContent: "center",
    gap: 3,
    paddingLeft: 10,
  },
  pct: {
    fontSize: 13,
    fontWeight: "800",
    textAlign: "right",
  },
});
