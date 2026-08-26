import type { ScoringProfile } from "@challenger-fantasy/schemas";
import { getActiveScoringCategories, SCORING_PROFILES } from "@challenger-fantasy/shared";
import type { StatPointsBreakdown } from "@challenger-fantasy/types";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useQuery } from "@tanstack/react-query";
import { Check, X } from "lucide-react-native";
import { type ReactNode, useCallback, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import ThemedText from "~/components/ThemedText";
import { FighterScoringModalContext } from "~/contexts/fighter-scoring-modal-context";
import { fighterScoringQuery } from "~/lib/init-queries";
import { useAppTheme } from "./app-theme-provider";

type Props = {
  children: ReactNode;
  scoringProfile: string;
};

type ActiveIds = {
  fighterId: string;
  fightId: string;
  fighterName: string;
};

type BreakdownRow =
  | { kind: "numbered"; label: string; count: number; pts: number }
  | { kind: "occurrence"; label: string; occurred: boolean; pts: number };

function buildRows(profile: ScoringProfile, breakdown: StatPointsBreakdown): BreakdownRow[] {
  const config = SCORING_PROFILES[profile];
  if (!config) return [];

  return getActiveScoringCategories(config).map(({ key, label }) => {
    const entry = breakdown[key];
    if ("count" in entry) {
      return { kind: "numbered" as const, label, count: entry.count, pts: entry.pointsEarned };
    }
    return {
      kind: "occurrence" as const,
      label,
      occurred: entry.occurred,
      pts: entry.pointsEarned,
    };
  });
}

function formatPts(pts: number): string {
  return pts > 0 ? `+${pts} pts` : `${pts} pts`;
}

export function FighterScoringModalProvider({ children, scoringProfile }: Props) {
  const { theme } = useAppTheme();
  const [activeIds, setActiveIds] = useState<ActiveIds | null>(null);
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const openScoringBreakdown = useCallback(
    (fighterId: string, fightId: string, fighterName: string) => {
      setActiveIds({ fighterId, fightId, fighterName });
      bottomSheetRef.current?.present();
    },
    [],
  );

  const { data: scoring, isPending } = useQuery(
    fighterScoringQuery(activeIds?.fighterId, { scoringProfile, fightId: activeIds?.fightId }),
  );

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.52} />
    ),
    [],
  );

  const rows = scoring ? buildRows(scoringProfile as ScoringProfile, scoring.breakdown) : [];

  return (
    <>
      <FighterScoringModalContext.Provider value={{ openScoringBreakdown }}>
        {children}
      </FighterScoringModalContext.Provider>
      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={["60%"]}
        enablePanDownToClose
        enableDynamicSizing={false}
        enableOverDrag={false}
        handleComponent={null}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: theme.base200 }}
        onDismiss={() => setActiveIds(null)}
      >
        {isPending ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={theme.baseContent} />
          </View>
        ) : scoring && activeIds ? (
          <BottomSheetScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <ThemedText style={styles.fighterName} numberOfLines={1}>
                {activeIds.fighterName}
              </ThemedText>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.baseContentExtraMuted }]} />

            {rows.map((row) => {
              const active = row.pts > 0;
              const rowColor = active ? theme.baseContent : theme.baseContentMuted;
              return (
                <View
                  key={row.label}
                  style={[styles.dataRow, { borderBottomColor: theme.baseContentExtraMuted }]}
                >
                  <ThemedText style={[styles.dataLabel, { color: rowColor }]}>
                    {row.label}
                  </ThemedText>
                  <View style={styles.valueCell}>
                    {row.kind === "occurrence" ? (
                      row.occurred ? (
                        <Check size={14} color={rowColor} strokeWidth={2.5} />
                      ) : (
                        <X size={14} color={rowColor} strokeWidth={2.5} />
                      )
                    ) : (
                      <ThemedText style={[styles.dataValue, { color: rowColor }]}>
                        {row.count}
                      </ThemedText>
                    )}
                  </View>
                  <ThemedText style={[styles.ptsValue, { color: rowColor }]}>
                    {formatPts(row.pts)}
                  </ThemedText>
                </View>
              );
            })}

            <View style={[styles.totalRow, { borderTopColor: theme.baseContentMuted }]}>
              <ThemedText style={styles.totalLabel}>Total</ThemedText>
              <ThemedText style={[styles.totalValue, { color: theme.success }]}>
                {scoring.score} pts
              </ThemedText>
            </View>
          </BottomSheetScrollView>
        ) : (
          <View style={styles.centered}>
            <ThemedText style={{ color: theme.baseContentMuted }}>No scoring data</ThemedText>
          </View>
        )}
      </BottomSheetModal>
    </>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 12,
    paddingBottom: 12,
  },
  fighterName: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  divider: {
    height: 1,
    marginBottom: 4,
  },
  dataRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dataLabel: {
    flex: 1,
    fontSize: 14,
  },
  valueCell: {
    width: 40,
    alignItems: "flex-end",
    justifyContent: "center",
    marginRight: 16,
  },
  dataValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  ptsValue: {
    width: 72,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "right",
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    marginTop: 4,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "800",
  },
});
