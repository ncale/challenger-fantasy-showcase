import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import type { StyleProp, ViewStyle } from "react-native";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ThemedText from "~/components/ThemedText";
import { useDraftSession } from "~/hooks/use-draft-session";
import { usePickRanking } from "~/hooks/use-pick-ranking";
import { useSupabase } from "~/hooks/use-supabase";
import { useThemeColors } from "~/hooks/use-theme-colors";
import { type QueuedFighter, useDraftTab } from "./draft-context";
import { DraftFighterItem } from "./draft-fighter-item";

export function DraftQueueList({
  style,
  extraBottomPadding = 0,
}: {
  style?: StyleProp<ViewStyle>;
  extraBottomPadding?: number;
}) {
  const { theme } = useThemeColors();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const { queue, removeFromQueue } = useDraftTab();
  const { pickFighter, currentPicker, game } = useDraftSession();
  const { userId } = useSupabase();
  const isCurrentPicker = userId === currentPicker?.userId;

  const { getRank } = usePickRanking(game?.eventId);

  return (
    <View style={[style, { overflow: "hidden" }]}>
      <BottomSheetFlatList
        data={queue}
        keyExtractor={(item: QueuedFighter) => `queue-item-${item.id}`}
        showsVerticalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={{ paddingBottom: bottomInset + extraBottomPadding }}
        ListHeaderComponent={
          <View style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
            <ThemedText style={{ fontWeight: "600", fontSize: 14 }}>
              Queue ({queue.length})
            </ThemedText>
          </View>
        }
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingTop: 32 }}>
            <ThemedText style={{ color: theme.baseContentMuted, fontSize: 14 }}>
              Queue is empty
            </ThemedText>
          </View>
        }
        renderItem={({ item }: { item: QueuedFighter }) => (
          <DraftFighterItem
            variant="queue"
            fighterId={item.id}
            rankPosition={getRank(item.id)}
            fullName={item.name}
            opponent={item.opponent}
            weightClass={item.weightClass}
            onDraft={() => {
              pickFighter(item.id);
              removeFromQueue(item.id);
            }}
            draftDisabled={!isCurrentPicker}
            onRemove={() => removeFromQueue(item.id)}
          />
        )}
      />
    </View>
  );
}
