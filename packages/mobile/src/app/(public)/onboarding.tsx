import { router } from "expo-router";
import type { LucideIcon } from "lucide-react-native";
import { ListChecks, TrendingUp, Trophy } from "lucide-react-native";
import { useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import PagerView from "react-native-pager-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ThemedText from "~/components/ThemedText";
import ThemedView from "~/components/ThemedView";
import { useThemeColors } from "~/hooks/use-theme-colors";
import { onboardingStorage } from "~/lib/storage";

const SLIDES: { Icon: LucideIcon; title: string; body: string }[] = [
  {
    Icon: ListChecks,
    title: "Pick your fighters",
    body: "Draft real combat sports athletes before each event. Your lineup, your call.",
  },
  {
    Icon: TrendingUp,
    title: "Score points",
    body: "Earn points based on real fight outcomes — KOs, decisions, rounds dominated.",
  },
  {
    Icon: Trophy,
    title: "Beat the competition",
    body: "Compete in contests and climb the leaderboard. Best draft wins.",
  },
];

async function finish() {
  await onboardingStorage.markOnboardingComplete();
  router.replace("/welcome");
}

export default function OnboardingScreen() {
  const { theme } = useThemeColors();
  const insets = useSafeAreaInsets();
  const pagerRef = useRef<PagerView>(null);
  const [page, setPage] = useState(0);
  const isLast = page === SLIDES.length - 1;

  const next = () => {
    if (isLast) {
      finish();
    } else {
      pagerRef.current?.setPage(page + 1);
    }
  };

  return (
    <ThemedView
      style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 }]}
    >
      {/* Skip */}
      <Pressable style={styles.skip} onPress={finish} hitSlop={16}>
        <ThemedText style={[styles.skipText, { color: theme.baseContentMuted }]}>Skip</ThemedText>
      </Pressable>

      {/* Slides */}
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        onPageSelected={(e) => setPage(e.nativeEvent.position)}
      >
        {SLIDES.map(({ Icon, title, body }) => (
          <View key={title} style={styles.slide}>
            <View style={[styles.iconWrap, { backgroundColor: theme.base300 }]}>
              <Icon size={40} color={theme.primary} strokeWidth={1.5} />
            </View>
            <ThemedText style={styles.title}>{title}</ThemedText>
            <ThemedText style={styles.body} opacity={60}>
              {body}
            </ThemedText>
          </View>
        ))}
      </PagerView>

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((s, i) => (
          <View
            key={s.title}
            style={[
              styles.dot,
              { backgroundColor: i === page ? theme.baseContent : theme.baseContentMuted },
            ]}
          />
        ))}
      </View>

      {/* CTA */}
      <Pressable
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: theme.primary, opacity: pressed ? 0.8 : 1 },
        ]}
        onPress={next}
      >
        <ThemedText style={[styles.buttonText, { color: theme.primaryContent }]}>
          {isLast ? "Get Started" : "Next"}
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  skip: {
    alignSelf: "flex-end",
  },
  skipText: {
    fontSize: 15,
  },
  pager: {
    flex: 1,
    width: "100%",
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    paddingHorizontal: 8,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  body: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  dots: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  button: {
    width: "100%",
    borderRadius: 100,
    paddingVertical: 18,
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "700",
    fontSize: 18,
  },
});
