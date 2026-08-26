import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ThemedText from "~/components/ThemedText";
import { UsernameField, useUsernameField } from "~/components/UsernameField";
import { useSupabase } from "~/hooks/use-supabase";
import { useThemeColors } from "~/hooks/use-theme-colors";

export default function EditUsername() {
  const { theme } = useThemeColors();
  const { profile, updateUsername } = useSupabase();
  const insets = useSafeAreaInsets();

  const currentUsername = profile?.username ?? undefined;
  const [value, setValue] = useState(currentUsername ?? "");

  const { isFormatValid, isAvailable, isChecking, isUnchanged } = useUsernameField(
    value,
    currentUsername,
  );
  const canSave = isFormatValid && !isChecking && !isUnchanged && isAvailable === true;

  const { mutate, isPending, error } = useMutation({
    mutationFn: updateUsername,
    onSuccess: () => router.back(),
  });

  return (
    <View style={[styles.root, { backgroundColor: theme.base300 }]}>
      <View style={[styles.form, { paddingBottom: insets.bottom + 24 }]}>
        <UsernameField
          value={value}
          onChange={setValue}
          currentUsername={currentUsername}
          autoFocus
        />
        <View style={styles.errorSlot}>
          {error ? (
            <ThemedText style={[styles.error, { color: theme.error }]}>
              {error instanceof Error ? error.message : "Something went wrong. Please try again."}
            </ThemedText>
          ) : null}
        </View>
        <Pressable
          onPress={() => mutate(value.trim())}
          disabled={!canSave || isPending}
          style={[
            styles.button,
            { backgroundColor: theme.primary, opacity: canSave && !isPending ? 1 : 0.45 },
          ]}
        >
          {isPending ? (
            <ActivityIndicator color={theme.primaryContent} />
          ) : (
            <ThemedText style={[styles.buttonText, { color: theme.primaryContent }]}>
              Save
            </ThemedText>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 16,
  },
  form: {
    flex: 1,
    paddingTop: 24,
    gap: 12,
  },
  errorSlot: {
    height: 18,
    justifyContent: "center",
    marginTop: -4,
  },
  error: {
    fontSize: 13,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
