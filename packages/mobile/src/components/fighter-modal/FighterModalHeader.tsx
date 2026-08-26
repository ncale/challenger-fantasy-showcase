import { getAge } from "@challenger-fantasy/core";
import { formatFighterRecord } from "@challenger-fantasy/shared";
import { StyleSheet, View } from "react-native";
import { useAppTheme } from "~/providers/app-theme-provider";
import ThemedText from "../ThemedText";

function formatHeight(inches: number | null | undefined): string {
  if (!inches) return "—";
  const feet = Math.floor(inches / 12);
  const rem = inches % 12;
  return `${feet}'${rem}"`;
}

type Fighter = {
  name?: string | null;
  heightIn?: number | null;
  reachIn?: number | null;
  dob?: string | null;
  stance?: string | null;
  wins?: number;
  losses?: number;
  draws?: number;
  noContests?: number;
};

function AttrDivider() {
  const { theme } = useAppTheme();
  return <View style={[styles.divider, { backgroundColor: theme.baseContentExtraMuted }]} />;
}

function AttrItem({ label, value, flex = 2 }: { label: string; value: string; flex?: number }) {
  const { theme } = useAppTheme();
  return (
    <View style={[styles.attrItem, { flex }]}>
      <ThemedText style={[styles.attrLabel, { color: theme.baseContentMuted }]}>{label}</ThemedText>
      <ThemedText style={styles.attrValue}>{value}</ThemedText>
    </View>
  );
}

type Props = {
  fighter: Fighter | undefined;
  isLoading: boolean;
  weightDisplay?: string;
};

export function FighterModalHeader({ fighter, isLoading, weightDisplay = "—" }: Props) {
  const { theme } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.base200 }]}>
      {isLoading ? (
        <ThemedText style={styles.name}>Loading…</ThemedText>
      ) : (
        <>
          <ThemedText style={styles.name}>{fighter?.name ?? "—"}</ThemedText>
          <View style={styles.attrRows}>
            <View style={styles.attrRow}>
              <AttrItem
                label="Record"
                value={
                  formatFighterRecord({
                    wins: fighter?.wins,
                    losses: fighter?.losses,
                    draws: fighter?.draws,
                    noContests: fighter?.noContests,
                  }) ?? "—"
                }
                flex={3}
              />
              <AttrDivider />
              <AttrItem label="Weight" value={weightDisplay} flex={3} />
              <AttrDivider />
              <AttrItem label="Age" value={fighter?.dob ? getAge(fighter.dob, 1) : "—"} flex={2} />
            </View>
            <View style={styles.attrRow}>
              <AttrItem label="Height" value={formatHeight(fighter?.heightIn)} flex={2} />
              <AttrDivider />
              <AttrItem
                label="Reach"
                value={fighter?.reachIn ? `${fighter.reachIn}"` : "—"}
                flex={2}
              />
              <AttrDivider />
              <AttrItem label="Stance" value={fighter?.stance ?? "—"} flex={3} />
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    gap: 14,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  attrRows: {
    gap: 14,
  },
  attrRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  attrItem: {
    gap: 3,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 28,
    marginHorizontal: 12,
  },
  attrLabel: {
    fontSize: 9,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  attrValue: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
});
