import { router } from "expo-router";
import { ChevronRightIcon } from "lucide-react-native";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import type { StatusType } from "~/components/StatusDot";
import { StatusDot } from "~/components/StatusDot";
import ThemedText from "~/components/ThemedText";
import { typography } from "~/lib/typography";
import { useAppTheme } from "~/providers/app-theme-provider";

export function SectionHeader({
  title,
  count,
  href,
  loading,
  status,
}: {
  title: string;
  count?: number;
  href?: string;
  loading?: boolean;
  status?: StatusType;
}) {
  const { theme } = useAppTheme();
  const isEmpty = count !== undefined && count === 0;
  const isNavigable = !!href && !isEmpty;

  const inner = (
    <>
      <View style={styles.titleRow}>
        {status && <StatusDot status={status} />}
        <ThemedText style={typography.sectionTitle}>{title}</ThemedText>
        {count !== undefined && !loading && (
          <ThemedText style={[styles.count, { color: theme.baseContentMuted }]}>
            ({count})
          </ThemedText>
        )}
      </View>
      {href && (
        <View style={styles.right}>
          {loading ? (
            <ActivityIndicator size="small" color={theme.baseContentMuted} />
          ) : (
            <ChevronRightIcon size={18} color={theme.baseContentMuted} />
          )}
        </View>
      )}
    </>
  );

  if (href) {
    return (
      <Pressable
        onPress={isNavigable ? () => router.push(href as never) : undefined}
        disabled={!isNavigable}
        style={() => [styles.container, { opacity: isEmpty ? 0.4 : 1 }]}
      >
        {inner}
      </Pressable>
    );
  }

  return <View style={styles.container}>{inner}</View>;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginHorizontal: -10,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  count: {
    fontSize: 13,
    fontWeight: "500",
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
  },
});
