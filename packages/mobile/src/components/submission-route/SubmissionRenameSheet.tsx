import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ThemedText from "~/components/ThemedText";
import { useSupabase } from "~/hooks/use-supabase";
import { useThemeColors } from "~/hooks/use-theme-colors";
import { updateSubmissionNameMutation } from "~/lib/init-queries";

type Props = {
  submissionId: string | undefined;
  currentName: string | undefined;
};

export const SubmissionRenameSheet = forwardRef<BottomSheetModal, Props>(
  ({ submissionId, currentName }, ref) => {
    const { theme } = useThemeColors();
    const { top } = useSafeAreaInsets();
    const { session } = useSupabase();
    const accessToken = session?.access_token ?? "";
    const queryClient = useQueryClient();

    const sheetRef = ref as React.RefObject<BottomSheetModal>;

    const [renameValue, setRenameValue] = useState(currentName ?? "");
    const renameInputRef = useRef<React.ComponentRef<typeof BottomSheetTextInput>>(null);

    useEffect(() => {
      setRenameValue(currentName ?? "");
    }, [currentName]);

    const dismiss = useCallback(() => {
      sheetRef.current?.dismiss();
    }, [sheetRef]);

    const { mutate: save, isPending: isSaving } = useMutation({
      ...updateSubmissionNameMutation(accessToken),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["submissions", submissionId] });
        dismiss();
      },
    });

    const handleSave = useCallback(() => {
      if (!submissionId || renameValue.trim() === "" || isSaving) return;
      save({ submissionId, name: renameValue.trim() });
    }, [submissionId, renameValue, isSaving, save]);

    const handleChange = useCallback((index: number) => {
      if (index >= 0) {
        renameInputRef.current?.focus();
      }
    }, []);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
      ),
      [],
    );

    const isSaveDisabled = renameValue.trim() === "" || isSaving;

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={["100%"]}
        enableDynamicSizing={false}
        enablePanDownToClose={false}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: theme.base200 }}
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
        topInset={0}
        onChange={handleChange}
      >
        <BottomSheetView style={styles.flex}>
          <View
            style={[
              styles.header,
              {
                paddingTop: top + 8,
                borderBottomColor: theme.base300,
              },
            ]}
          >
            <Pressable onPress={dismiss}>
              <ThemedText style={[styles.cancelText, { color: theme.baseContentMuted }]}>
                Cancel
              </ThemedText>
            </Pressable>

            <ThemedText style={styles.headerTitle}>Submission Name</ThemedText>

            <Pressable onPress={handleSave} disabled={isSaveDisabled}>
              <ThemedText
                style={[
                  styles.saveText,
                  { color: theme.primary, opacity: isSaveDisabled ? 0.4 : 1 },
                ]}
              >
                {isSaving ? "Saving…" : "Save"}
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.body}>
            <BottomSheetTextInput
              ref={renameInputRef}
              value={renameValue}
              onChangeText={setRenameValue}
              placeholder="Submission name"
              returnKeyType="done"
              onSubmitEditing={handleSave}
              selectTextOnFocus
              style={[
                styles.input,
                {
                  backgroundColor: theme.base300,
                  color: theme.baseContent,
                },
              ]}
            />
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

SubmissionRenameSheet.displayName = "SubmissionRenameSheet";

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  cancelText: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600",
  },
  body: {
    padding: 16,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 17,
  },
});
