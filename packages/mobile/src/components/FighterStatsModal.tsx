import { formatWeightRange } from "@challenger-fantasy/shared";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { singleFighterAnalyticsQuery, singleFighterQuery } from "~/lib/init-queries";
import { useAppTheme } from "~/providers/app-theme-provider";
import { FighterModalHeader } from "./fighter-modal/FighterModalHeader";
import { FighterModalTabs, type ModalTab } from "./fighter-modal/FighterModalTabs";
import { AnalyticsTab } from "./fighter-modal/tabs/AnalyticsTab";

const TABS: [ModalTab, ...ModalTab[]] = [{ id: "analytics", label: "Analytics" }];

export function FighterSheetContent({ fighterId }: { fighterId: string }) {
  const { theme } = useAppTheme();
  const { bottom } = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<string>(TABS[0].id);

  const { data: fighter, isLoading } = useQuery(singleFighterQuery(fighterId));

  // TODO: replace with a dedicated fighter profile endpoint that has its own
  // cache invalidation rules — the analytics endpoint caches for 24h, which
  // is appropriate for stats but not for profile data like weight class.
  const { data: analytics } = useQuery(singleFighterAnalyticsQuery(fighterId));

  const weightDisplay = formatWeightRange(analytics?.lowestWeightKey, analytics?.highestWeightKey);

  return (
    <View style={[styles.container, { backgroundColor: theme.base300 }]}>
      <FighterModalHeader fighter={fighter} isLoading={isLoading} weightDisplay={weightDisplay} />
      <FighterModalTabs tabs={TABS} activeId={activeTab} onPress={setActiveTab} />
      <BottomSheetScrollView
        contentContainerStyle={{ paddingBottom: bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "analytics" && <AnalyticsTab fighterId={fighterId} />}
      </BottomSheetScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
