import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { type ReactNode, useCallback, useRef, useState } from "react";
import { FighterSheetContent } from "~/components/FighterStatsModal";
import { FighterModalContext } from "~/contexts/fighter-modal-context";
import { useAppTheme } from "./app-theme-provider";

export function FighterModalProvider({ children }: { children: ReactNode }) {
  const { theme } = useAppTheme();
  const [activeFighterId, setActiveFighterId] = useState<string | null>(null);
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const openFighter = useCallback((fighterId: string) => {
    setActiveFighterId(fighterId);
    bottomSheetRef.current?.present();
  }, []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.52} />
    ),
    [],
  );

  return (
    <>
      <FighterModalContext.Provider value={{ openFighter }}>
        {children}
      </FighterModalContext.Provider>
      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={["82%"]}
        enablePanDownToClose
        enableDynamicSizing={false}
        enableOverDrag={false}
        handleComponent={null}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: theme.base200 }}
        onDismiss={() => setActiveFighterId(null)}
      >
        {activeFighterId != null && <FighterSheetContent fighterId={activeFighterId} />}
      </BottomSheetModal>
    </>
  );
}
