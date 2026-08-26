import * as Haptics from "expo-haptics";
import { BookmarkPlusIcon, XIcon } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CircleButton } from "~/components/fighter/CircleButton";
import { FighterNameSlim } from "~/components/fighter/FighterName";
import { useAppTheme } from "~/providers/app-theme-provider";

type SelectorVariant = {
  variant: "selector";
  queuePosition: number | null;
  onToggleQueue: () => void;
};

type QueueVariant = {
  variant: "queue";
  onRemove: () => void;
};

type Props = {
  fighterId: string;
  fullName: string;
  opponent: string;
  weightClass?: string;
  onDraft: () => void;
  draftDisabled: boolean;
  rankPosition?: number;
} & (SelectorVariant | QueueVariant);

export function DraftFighterItem(props: Props) {
  const { theme } = useAppTheme();
  const { fighterId, fullName, opponent, weightClass, onDraft, draftDisabled, rankPosition } =
    props;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onDraft}
        disabled={draftDisabled}
        style={[styles.draftBtn, { backgroundColor: draftDisabled ? theme.base100 : theme.accent }]}
        accessibilityLabel="Draft fighter"
      >
        <Text
          style={[
            styles.draftBtnText,
            { color: draftDisabled ? theme.baseContentExtraMuted : theme.accentContent },
          ]}
        >
          Draft
        </Text>
      </TouchableOpacity>

      <View style={styles.info}>
        <FighterNameSlim
          fighterId={fighterId}
          name={fullName}
          rank={rankPosition}
          opponent={opponent}
          weightClass={weightClass}
        />
      </View>

      {props.variant === "selector" ? (
        <CircleButton
          onPress={() => {
            Haptics.impactAsync(
              props.queuePosition != null
                ? Haptics.ImpactFeedbackStyle.Light
                : Haptics.ImpactFeedbackStyle.Medium,
            );
            props.onToggleQueue();
          }}
          active={props.queuePosition != null}
          inactiveColor={theme.base100}
          size={36}
          accessibilityLabel={props.queuePosition != null ? "Remove from queue" : "Add to queue"}
          icon={
            props.queuePosition != null ? (
              <Text style={[styles.queuePosition, { color: theme.baseContent }]}>
                {props.queuePosition}
              </Text>
            ) : (
              <BookmarkPlusIcon size={18} color={theme.baseContent} />
            )
          }
        />
      ) : (
        <CircleButton
          onPress={props.onRemove}
          inactiveColor={theme.base100}
          size={36}
          accessibilityLabel="Remove from queue"
          icon={<XIcon size={18} color={theme.baseContent} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
  },
  draftBtn: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  draftBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },
  info: {
    flex: 1,
    paddingVertical: 2,
  },
  queuePosition: {
    fontSize: 14,
    fontWeight: "700",
  },
});
