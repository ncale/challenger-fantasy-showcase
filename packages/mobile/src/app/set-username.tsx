import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar, resolveAvatarUrl } from "~/components/Avatar";
import ThemedText from "~/components/ThemedText";
import { UsernameField, useUsernameField } from "~/components/UsernameField";
import { useSupabase } from "~/hooks/use-supabase";
import { useThemeColors } from "~/hooks/use-theme-colors";

export default function SetUsername() {
  const { theme } = useThemeColors();
  const { profile, updateUsername } = useSupabase();
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState("");

  const { isFormatValid, isAvailable, isChecking } = useUsernameField(username);
  const canSubmit = isFormatValid && !isChecking && isAvailable === true;

  const { mutate, isPending, error } = useMutation({
    mutationFn: updateUsername,
    onSuccess: () => {
      router.replace("/(protected)/(tabs)/browse");
    },
  });

  return (
    <View style={[styles.root, { backgroundColor: theme.base300, paddingTop: insets.top + 48 }]}>
      <View style={styles.content}>
        <Avatar url={resolveAvatarUrl(profile?.avatarUrl ?? null)} size={72} />
        <ThemedText style={styles.title}>Choose a username</ThemedText>
        <ThemedText style={styles.subtitle} opacity={60}>
          This is how other players will see you.
        </ThemedText>
        <UsernameField value={username} onChange={setUsername} autoFocus />
        {/* Fixed-height slot so the button never shifts when the error appears */}
        <View style={styles.errorSlot}>
          {error ? (
            <ThemedText style={[styles.errorText, { color: theme.error }]}>
              {error instanceof Error ? error.message : "Something went wrong. Please try again."}
            </ThemedText>
          ) : null}
        </View>
        <Pressable
          onPress={() => mutate(username.trim())}
          disabled={!canSubmit || isPending}
          style={[
            styles.button,
            { backgroundColor: theme.primary, opacity: canSubmit && !isPending ? 1 : 0.45 },
          ]}
        >
          {isPending ? (
            <ActivityIndicator color={theme.primaryContent} />
          ) : (
            <ThemedText style={[styles.buttonText, { color: theme.primaryContent }]}>
              Continue
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
    paddingHorizontal: 32,
  },
  content: {
    alignItems: "center",
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 4,
  },
  errorSlot: {
    height: 18,
    width: "100%",
    justifyContent: "center",
  },
  errorText: {
    fontSize: 13,
    textAlign: "center",
  },
  button: {
    width: "100%",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
