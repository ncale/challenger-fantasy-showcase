import type React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useFighterModal } from "~/hooks/use-fighter-modal";
import { useAppTheme } from "~/providers/app-theme-provider";

type FighterNameProps = {
  fighterId: string;
  name: string;
  rank?: number;
  lines?: string[];
  lineNodes?: React.ReactNode[];
};

export function FighterName({ fighterId, name, rank, lines, lineNodes }: FighterNameProps) {
  const { theme } = useAppTheme();
  const { openFighter } = useFighterModal();

  return (
    <View>
      <Pressable hitSlop={6} onPress={() => openFighter(fighterId)} style={styles.namePressable}>
        <View style={styles.nameRow}>
          {rank != null && <Text style={[styles.rank, { color: theme.primary }]}>#{rank}</Text>}
          <Text style={[styles.name, { color: theme.baseContent }]} numberOfLines={1}>
            {name}
          </Text>
        </View>
      </Pressable>
      {lineNodes?.map((node, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static ordered list of display lines
        <Text key={i} style={[styles.line, { color: theme.baseContentMuted }]} numberOfLines={1}>
          {node}
        </Text>
      ))}
      {!lineNodes &&
        lines?.map((line, i) => (
          <Text
            // biome-ignore lint/suspicious/noArrayIndexKey: static ordered list of display lines
            key={i}
            style={[styles.line, { color: theme.baseContentMuted }]}
            numberOfLines={1}
          >
            {line}
          </Text>
        ))}
    </View>
  );
}

type FighterNameSlimProps = {
  fighterId: string;
  name: string;
  rank?: number;
  opponent: string;
  weightClass?: string;
};

export function FighterNameSlim({
  fighterId,
  name,
  rank,
  opponent,
  weightClass,
}: FighterNameSlimProps) {
  const { theme } = useAppTheme();

  const lineNodes = [
    <>
      <Text style={{ color: theme.baseContentMuted }}>v. {opponent}</Text>
      {weightClass ? <Text style={{ color: theme.weightClassBlue }}> @ {weightClass}</Text> : null}
    </>,
  ];

  return <FighterName fighterId={fighterId} name={name} rank={rank} lineNodes={lineNodes} />;
}

type FighterNameDetailedProps = {
  fighterId: string;
  name: string;
  rank?: number;
  opponent?: string;
  weightClass?: string;
};

export function FighterNameDetailed({
  fighterId,
  name,
  rank,
  opponent,
  weightClass,
}: FighterNameDetailedProps) {
  const { theme } = useAppTheme();

  const lineNodes = opponent
    ? [
        <>
          <Text style={{ color: theme.baseContentMuted }}>v. {opponent}</Text>
          {weightClass ? (
            <Text style={{ color: theme.weightClassBlue }}> @ {weightClass}</Text>
          ) : null}
        </>,
      ]
    : [];

  return <FighterName fighterId={fighterId} name={name} rank={rank} lineNodes={lineNodes} />;
}

const styles = StyleSheet.create({
  namePressable: {
    alignSelf: "flex-start",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    flexShrink: 1,
  },
  rank: {
    fontSize: 12,
    fontWeight: "700",
  },
  line: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 1,
  },
});
