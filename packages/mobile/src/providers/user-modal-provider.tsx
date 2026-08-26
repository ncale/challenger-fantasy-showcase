import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { type ReactNode, useCallback, useRef, useState } from "react";
import { UserSheetContent } from "~/components/UserProfileModal";
import { UserModalContext } from "~/contexts/user-modal-context";
import { useThemeColors } from "~/hooks/use-theme-colors";

export function UserModalProvider({ children }: { children: ReactNode }) {
  const { theme } = useThemeColors();
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const openUser = useCallback((userId: string) => {
    setActiveUserId(userId);
    bottomSheetRef.current?.present();
  }, []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.52} />
    ),
    [],
  );

  return (
    <UserModalContext.Provider value={{ openUser }}>
      {children}
      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={["40%"]}
        enablePanDownToClose
        enableDynamicSizing={false}
        enableOverDrag={false}
        handleComponent={null}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: theme.base200 }}
        onDismiss={() => setActiveUserId(null)}
      >
        {activeUserId != null && <UserSheetContent userId={activeUserId} />}
      </BottomSheetModal>
    </UserModalContext.Provider>
  );
}
