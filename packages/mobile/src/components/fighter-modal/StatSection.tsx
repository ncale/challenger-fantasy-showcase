import { StyleSheet, View } from "react-native";
import { useAppTheme } from "~/providers/app-theme-provider";
import ThemedText from "../ThemedText";
import { StatRow } from "./StatRow";

type Stat = {
  label: string;
  value: string | null | undefined;
  explanation?: string;
};

type Props = {
  title: string;
  stats: Stat[];
};

export function StatSection({ title, stats }: Props) {
  const { theme } = useAppTheme();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={[styles.title, { color: theme.baseContentExtraMuted }]}>
          {title}
        </ThemedText>
      </View>
      {stats.map((stat, i) => (
        <StatRow
          key={stat.label}
          label={stat.label}
          value={stat.value}
          explanation={stat.explanation}
          showDivider={i < stats.length - 1}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 0,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 6,
  },
  title: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
});
