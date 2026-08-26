import BottomSheet, { type BottomSheetModal } from "@gorhom/bottom-sheet";
import { router, useRouter } from "expo-router";
import { LogOut, ScrollText } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TabView } from "react-native-tab-view";
import { Clock } from "~/components/draft/clock";
import {
  type DraftTab,
  DraftTabContext,
  type QueuedFighter,
  useDraftTab,
} from "~/components/draft/draft-context";
import { DraftFighterList } from "~/components/draft/draft-fighter-list";
import { DraftPickTable } from "~/components/draft/draft-pick-table";
import { DraftQueueList } from "~/components/draft/draft-queue-list";
import { SettingsSheet } from "~/components/SettingsSheet";
import { SubmissionGameRulesSheet } from "~/components/submission-route/SubmissionGameRulesSheet";
import ThemedText from "~/components/ThemedText";
import { useDraftRegistry } from "~/hooks/use-draft-registry";
import { useDraftSession } from "~/hooks/use-draft-session";
import { useThemeColors } from "~/hooks/use-theme-colors";

function SheetHandle() {
  const { theme } = useThemeColors();
  const { activeTab, setActiveTab, queue } = useDraftTab();

  return (
    <View style={[styles.tabBar, { borderBottomColor: theme.baseContentExtraMuted }]}>
      <Pressable style={styles.tab} onPress={() => setActiveTab("fighters")}>
        <ThemedText
          style={[
            styles.tabLabel,
            { color: activeTab === "fighters" ? theme.baseContent : theme.baseContentMuted },
          ]}
        >
          Fighters
        </ThemedText>
        {activeTab === "fighters" && (
          <View style={[styles.tabIndicator, { backgroundColor: theme.baseContent }]} />
        )}
      </Pressable>
      <Pressable style={styles.tab} onPress={() => setActiveTab("queue")}>
        <ThemedText
          style={[
            styles.tabLabel,
            { color: activeTab === "queue" ? theme.baseContent : theme.baseContentMuted },
          ]}
        >
          Queue{queue.length > 0 ? ` (${queue.length})` : ""}
        </ThemedText>
        {activeTab === "queue" && (
          <View style={[styles.tabIndicator, { backgroundColor: theme.baseContent }]} />
        )}
      </Pressable>
    </View>
  );
}

const SNAP_POINTS = ["12%", "36%", "60%", "82%"];
const SNAP_BOTTOM_PADDING = 380;
const ROUTES = [
  { key: "fighters", title: "Fighters" },
  { key: "queue", title: "Queue" },
];

function DraftScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useThemeColors();
  const { width } = useWindowDimensions();

  const [tabIndex, setTabIndex] = useState(0);
  const [queue, setQueue] = useState<QueuedFighter[]>([]);

  const settingsSheetRef = useRef<BottomSheetModal>(null);
  const rulesSheetRef = useRef<BottomSheetModal>(null);
  const { availableFighters } = useDraftSession();
  const { sessions, selectedDraftGroupId, leaveDraft } = useDraftRegistry();

  const session = selectedDraftGroupId ? sessions[selectedDraftGroupId] : null;
  const draftState = session?.draftState ?? null;
  const activeGameId = session?.gameId ?? null;
  const canLeave = draftState?.status === "pending" || draftState?.status === "initializing";

  const activeTab: DraftTab = tabIndex === 0 ? "fighters" : "queue";
  const setActiveTab = useCallback((tab: DraftTab) => {
    setTabIndex(tab === "fighters" ? 0 : 1);
  }, []);

  const addToQueue = useCallback((fighter: QueuedFighter) => {
    setQueue((prev) => (prev.some((q) => q.id === fighter.id) ? prev : [...prev, fighter]));
  }, []);

  const removeFromQueue = useCallback((id: string) => {
    setQueue((prev) => prev.filter((q) => q.id !== id));
  }, []);

  useEffect(() => {
    if (availableFighters.length === 0) return;
    const availableIds = new Set(availableFighters.map((f) => f.id));
    setQueue((prev) => prev.filter((item) => availableIds.has(item.id)));
  }, [availableFighters]);

  useEffect(() => {
    if (draftState?.status === "in-progress" || draftState?.status === "completed") {
      settingsSheetRef.current?.dismiss();
    }
  }, [draftState?.status]);

  const handleLeave = useCallback(() => {
    Alert.alert("Leave draft?", "You will be removed from the draft lobby.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: () => {
          settingsSheetRef.current?.dismiss();
          if (selectedDraftGroupId) leaveDraft(selectedDraftGroupId);
          router.back();
        },
      },
    ]);
  }, [leaveDraft, selectedDraftGroupId]);

  const settingsSections = useMemo(
    () => [
      {
        items: [
          {
            icon: ScrollText,
            label: "View game rules",
            onPress: () => {
              settingsSheetRef.current?.dismiss();
              rulesSheetRef.current?.present();
            },
          },
          ...(canLeave
            ? [
                {
                  icon: LogOut,
                  label: "Leave draft",
                  onPress: handleLeave,
                  destructive: true as const,
                },
              ]
            : []),
        ],
      },
    ],
    [canLeave, handleLeave],
  );

  const openOptions = useCallback(() => {
    settingsSheetRef.current?.present();
  }, []);

  const renderScene = useCallback(({ route }: { route: { key: string } }) => {
    if (route.key === "fighters") {
      return <DraftFighterList style={{ flex: 1 }} extraBottomPadding={SNAP_BOTTOM_PADDING} />;
    }
    if (route.key === "queue") {
      return <DraftQueueList style={{ flex: 1 }} extraBottomPadding={SNAP_BOTTOM_PADDING} />;
    }
    return null;
  }, []);

  return (
    <DraftTabContext.Provider
      value={{ activeTab, setActiveTab, queue, addToQueue, removeFromQueue }}
    >
      <View style={{ flex: 1, backgroundColor: theme.base300, paddingTop: insets.top }}>
        <Clock onOpenOptions={openOptions} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexShrink: 0 }}>
          <DraftPickTable
            style={{
              borderBottomWidth: 1,
              borderBottomColor: theme.baseContentExtraMuted,
              paddingBottom: 8,
            }}
          />
        </ScrollView>

        <BottomSheet
          snapPoints={SNAP_POINTS}
          index={1}
          enablePanDownToClose={false}
          enableOverDrag={false}
          enableDynamicSizing={false}
          handleComponent={SheetHandle}
          enableContentPanningGesture={false}
          backgroundStyle={{ backgroundColor: theme.base200 }}
        >
          <TabView
            navigationState={{ index: tabIndex, routes: ROUTES }}
            renderScene={renderScene}
            onIndexChange={setTabIndex}
            renderTabBar={() => null}
            initialLayout={{ width }}
            lazy
            style={{ flex: 1 }}
          />
        </BottomSheet>

        <SettingsSheet ref={settingsSheetRef} sections={settingsSections} />
        <SubmissionGameRulesSheet
          ref={rulesSheetRef}
          gameId={activeGameId ?? undefined}
          gameName={undefined}
        />
      </View>
    </DraftTabContext.Provider>
  );
}

export default function Draft() {
  const { theme } = useThemeColors();
  const insets = useSafeAreaInsets();
  const { selectedDraftGroupId, selectDraft } = useDraftRegistry();
  const { draftState } = useDraftSession();

  const router = useRouter();

  const isCompletingRef = useRef(false);

  useEffect(() => {
    if (draftState?.status !== "completed" || !selectedDraftGroupId) return;
    isCompletingRef.current = true;
    router.replace("/(protected)/draft-complete");
  }, [draftState?.status, selectedDraftGroupId, router]);

  // When leaving via the back/X button (not via completion), clear the selection so
  // the registry knows this draft is no longer being actively viewed.
  useEffect(() => {
    return () => {
      if (!isCompletingRef.current) selectDraft(null);
    };
  }, [selectDraft]);

  if (!selectedDraftGroupId) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.base300,
          paddingTop: insets.top,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color={theme.baseContent} />
      </View>
    );
  }

  return <DraftScreen />;
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    position: "relative",
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    left: "20%",
    right: "20%",
    height: 2,
    borderRadius: 1,
  },
});
