import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { forwardRef, Suspense, useCallback } from "react";
import { StyleSheet } from "react-native";
import { GameInfoContent } from "~/components/GameInfoContent";
import ThemedText from "~/components/ThemedText";
import { useThemeColors } from "~/hooks/use-theme-colors";

type Props = {
  gameId: string | undefined;
  gameName: string | undefined;
};

export const SubmissionGameRulesSheet = forwardRef<BottomSheetModal, Props>(
  ({ gameId, gameName }, ref) => {
    const { theme } = useThemeColors();

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
      ),
      [],
    );

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={["85%"]}
        enableDynamicSizing={false}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: theme.base200 }}
      >
        <BottomSheetScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {gameName && <ThemedText style={styles.title}>{gameName}</ThemedText>}
          <Suspense fallback={null}>
            <GameInfoContent gameId={gameId} />
          </Suspense>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);

SubmissionGameRulesSheet.displayName = "SubmissionGameRulesSheet";

const styles = StyleSheet.create({
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 24,
  },
});
