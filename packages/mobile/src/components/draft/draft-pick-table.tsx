import type { Drafter } from "@challenger-fantasy/schemas";
import { isNullish } from "@challenger-fantasy/utils";
import { useQuery } from "@tanstack/react-query";
import type { StyleProp, ViewStyle } from "react-native";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { Avatar } from "~/components/Avatar";
import { useDraftSession } from "~/hooks/use-draft-session";
import { useFighterModal } from "~/hooks/use-fighter-modal";
import { useSupabase } from "~/hooks/use-supabase";
import { useUserModal } from "~/hooks/use-user-modal";
import { singleFighterQuery, userProfileQuery } from "~/lib/init-queries";
import { useAppTheme } from "~/providers/app-theme-provider";
import ThemedText from "../ThemedText";

const ROW_HEIGHT = 40;
const CELL_GAP = 3;
const H_PADDING = 16;
const MIN_CELL_WIDTH = 120;

function PlaceholderHeaderCell({ cellWidth }: { cellWidth: number }) {
  const { theme } = useAppTheme();
  return (
    <View style={[styles.headerCell, { width: cellWidth }]}>
      <Avatar url={null} size={20} />
      <ThemedText
        style={[styles.headerLabel, { color: theme.baseContentMuted }]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        Waiting…
      </ThemedText>
    </View>
  );
}

function PlaceholderCell({
  rowIndex,
  columnIndex,
  cellWidth,
}: {
  rowIndex: number;
  columnIndex: number;
  cellWidth: number;
}) {
  const { theme } = useAppTheme();
  return (
    <View style={[styles.cell, { width: cellWidth, backgroundColor: theme.base100 }]}>
      <ThemedText style={[styles.cellPosition, { color: theme.baseContentMuted }]}>
        {rowIndex + 1}.{columnIndex + 1}
      </ThemedText>
      <ThemedText style={{ fontSize: 13, color: theme.baseContentMuted }}>—</ThemedText>
    </View>
  );
}

function PickTableHeaderCell({ drafter, cellWidth }: { drafter: Drafter; cellWidth: number }) {
  const { draftState } = useDraftSession();
  const { userId } = useSupabase();
  const { data: profile } = useQuery(userProfileQuery(drafter.userId));
  const { openUser } = useUserModal();

  const isMe = drafter.userId === userId;

  const label = (() => {
    if (profile?.username) {
      return isMe ? `${profile.username} (you)` : profile.username;
    }
    const draftStateUsername =
      draftState?.users && [...draftState.users].find((u) => u.userId === drafter.userId)?.username;
    if (draftStateUsername) return draftStateUsername;
    return "…";
  })();

  return (
    <Pressable
      style={({ pressed }) => [styles.headerCell, { width: cellWidth, opacity: pressed ? 0.7 : 1 }]}
      onPress={() => openUser(drafter.userId)}
      hitSlop={4}
    >
      <Avatar url={profile?.avatarUrl} size={20} />
      <ThemedText style={styles.headerLabel} numberOfLines={1} ellipsizeMode="tail">
        {label}
      </ThemedText>
    </Pressable>
  );
}

function PickTableCell({
  drafter,
  rowIndex,
  columnIndex,
  cellWidth,
}: {
  drafter: Drafter;
  rowIndex: number;
  columnIndex: number;
  cellWidth: number;
}) {
  const { theme } = useAppTheme();
  const { openFighter } = useFighterModal();
  const { userId } = useSupabase();
  const fighterId = drafter.picks[rowIndex]?.fighterId;
  const { data: fighter } = useQuery(singleFighterQuery(fighterId));
  const { currentPicker, draftState } = useDraftSession();

  const isMe = drafter.userId === userId;

  const isCurrentPickCell = (() => {
    if (isNullish(currentPicker) || isNullish(draftState)) return false;
    if (currentPicker.userId !== drafter.userId) return false;
    if (draftState.status !== "in-progress") return false;
    if (draftState.currentRound !== rowIndex + 1) return false;
    return true;
  })();

  const cellContent = (
    <>
      <ThemedText style={[styles.cellPosition, { color: theme.baseContentMuted }]}>
        {rowIndex + 1}.{columnIndex + 1}
      </ThemedText>
      {isCurrentPickCell && !fighterId ? (
        <ThemedText style={[styles.nextLabel, { color: theme.success }]}>Next</ThemedText>
      ) : (
        <ThemedText
          style={{ fontSize: 13, color: fighterId ? theme.baseContent : theme.baseContentMuted }}
          numberOfLines={1}
        >
          {fighterId ? (fighter?.name ?? "…") : "—"}
        </ThemedText>
      )}
    </>
  );

  const cellStyle = [
    styles.cell,
    {
      width: cellWidth,
      backgroundColor: isCurrentPickCell
        ? `${theme.success}22`
        : isMe
          ? theme.base200
          : theme.base100,
    },
  ];

  if (fighterId) {
    return (
      <Pressable
        style={({ pressed }) => [...cellStyle, { opacity: pressed ? 0.7 : 1 }]}
        onPress={() => openFighter(fighterId)}
      >
        {cellContent}
      </Pressable>
    );
  }

  return <View style={cellStyle}>{cellContent}</View>;
}

export function DraftPickTable({ style }: { style?: StyleProp<ViewStyle> }) {
  const { draftState, drafters } = useDraftSession();
  const { width: screenWidth } = useWindowDimensions();

  if (isNullish(draftState)) {
    // TODO: handle this loading state better
    return null;
  }

  const totalColumns = draftState.draftConfig.draftSize;
  const numPlaceholders = totalColumns - drafters.length;
  const totalGap = CELL_GAP * (totalColumns - 1);
  const cellWidth = Math.min(
    Math.max(Math.floor((screenWidth - H_PADDING * 2 - totalGap) / totalColumns), MIN_CELL_WIDTH),
    Math.floor(screenWidth * 0.38),
  );

  const emptyPickArray = Array.from({ length: draftState.draftConfig.numRounds });

  return (
    <View style={[{ gap: CELL_GAP, paddingHorizontal: H_PADDING, minWidth: screenWidth }, style]}>
      <View style={[styles.row, { gap: CELL_GAP }]}>
        {drafters.map((drafter, index) => (
          <PickTableHeaderCell
            drafter={drafter}
            cellWidth={cellWidth}
            // biome-ignore lint/suspicious/noArrayIndexKey: key is unique
            key={`pick-table-header-${index}`}
          />
        ))}
        {Array.from({ length: numPlaceholders }).map((_, index) => (
          <PlaceholderHeaderCell
            cellWidth={cellWidth}
            // biome-ignore lint/suspicious/noArrayIndexKey: key is unique
            key={`pick-table-header-placeholder-${index}`}
          />
        ))}
      </View>

      <View style={{ gap: CELL_GAP }}>
        {emptyPickArray.map((_, rowIndex) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: key is unique
          <View key={`pick-table-row-${rowIndex}`} style={[styles.row, { gap: CELL_GAP }]}>
            {drafters.map((drafter, columnIndex) => (
              <PickTableCell
                drafter={drafter}
                rowIndex={rowIndex}
                columnIndex={columnIndex}
                cellWidth={cellWidth}
                // biome-ignore lint/suspicious/noArrayIndexKey: key is unique
                key={`pick-table-cell-${rowIndex}-${columnIndex}`}
              />
            ))}
            {Array.from({ length: numPlaceholders }).map((_, placeholderIndex) => (
              <PlaceholderCell
                rowIndex={rowIndex}
                columnIndex={drafters.length + placeholderIndex}
                cellWidth={cellWidth}
                // biome-ignore lint/suspicious/noArrayIndexKey: key is unique
                key={`pick-table-placeholder-${rowIndex}-${placeholderIndex}`}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
  headerCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  headerLabel: {
    fontWeight: "600",
    fontSize: 13,
    flexShrink: 1,
  },
  cell: {
    height: ROW_HEIGHT,
    justifyContent: "center",
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingTop: 12,
    paddingBottom: 4,
  },
  cellPosition: {
    position: "absolute",
    top: 3,
    right: 5,
    fontSize: 9,
    fontWeight: "700",
  },
  nextLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
});
