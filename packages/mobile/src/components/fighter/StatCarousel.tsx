import { ChevronRight } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useAppTheme } from "~/providers/app-theme-provider";
import { StatBadge } from "./StatBadge";

export type CarouselStat = {
  label: string;
  value: string;
  onPress?: () => void;
};

export function StatCarousel({ stats }: { stats: CarouselStat[] }) {
  const { theme } = useAppTheme();

  return (
    <View style={{ backgroundColor: theme.base100 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {stats.flatMap((stat, i) => {
          const badge = (
            <StatBadge label={stat.label} value={null} displayValue={stat.value} textAlign="left" />
          );

          const item = stat.onPress ? (
            <Pressable
              key={stat.label}
              onPress={stat.onPress}
              style={({ pressed }) => [styles.item, { opacity: pressed ? 0.7 : 1 }]}
            >
              {badge}
            </Pressable>
          ) : (
            <View key={stat.label} style={styles.item}>
              {badge}
            </View>
          );

          if (i === 0) {
            return [
              item,
              <View key="sep-fights" style={styles.separator}>
                <ChevronRight size={10} color={theme.baseContentMuted} />
              </View>,
            ];
          }
          return [item];
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingTop: 3,
    paddingBottom: 6,
    paddingHorizontal: 2,
  },
  item: {
    paddingHorizontal: 7,
  },
  separator: {
    justifyContent: "flex-end",
    paddingBottom: 7,
    paddingRight: 1,
  },
});
