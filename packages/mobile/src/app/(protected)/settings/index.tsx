import Constants from "expo-constants";
import * as Updates from "expo-updates";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ThemedText from "~/components/ThemedText";
import { useSupabase } from "~/hooks/use-supabase";
import { useThemeColors } from "~/hooks/use-theme-colors";

export default function Settings() {
  const { theme } = useThemeColors();
  const { signOut, deleteAccount, isDeletingAccount, session } = useSupabase();
  const insets = useSafeAreaInsets();

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: signOut,
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account and all your data. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          style: "destructive",
          onPress: confirmDeleteAccount,
        },
      ],
    );
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      "Are you absolutely sure?",
      "Your account and all associated data will be permanently deleted. There is no way to recover it.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete My Account",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAccount();
            } catch {
              Alert.alert("Error", "Failed to delete account. Please try again.");
            }
          },
        },
      ],
    );
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.base300 }}
      contentContainerStyle={[
        styles.container,
        { paddingTop: 24, paddingBottom: insets.bottom + 24 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Account section */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionLabel} opacity={60}>
          ACCOUNT
        </ThemedText>
        <View style={[styles.card, { backgroundColor: theme.base200 }]}>
          <View style={[styles.row, styles.emailRow]}>
            <ThemedText style={[styles.emailLabel, { color: theme.baseContentMuted }]}>
              Email
            </ThemedText>
            <ThemedText style={styles.emailValue} numberOfLines={1}>
              {session?.user?.email}
            </ThemedText>
          </View>
          <View style={[styles.rowDivider, { backgroundColor: theme.base100 }]} />
          <Pressable
            style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}
            onPress={handleSignOut}
          >
            <ThemedText style={[styles.rowText, { color: theme.error }]}>Sign Out</ThemedText>
          </Pressable>
        </View>
      </View>

      {/* App info */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionLabel} opacity={60}>
          APP INFO
        </ThemedText>
        <View style={[styles.card, { backgroundColor: theme.base200 }]}>
          <View style={[styles.row, styles.infoRow]}>
            <ThemedText style={[styles.infoLabel, { color: theme.baseContentMuted }]}>
              Version
            </ThemedText>
            <ThemedText style={styles.infoValue}>{Constants.expoConfig?.version ?? "—"}</ThemedText>
          </View>
          <View style={[styles.rowDivider, { backgroundColor: theme.base100 }]} />
          <View style={[styles.row, styles.infoRow]}>
            <ThemedText style={[styles.infoLabel, { color: theme.baseContentMuted }]}>
              Channel
            </ThemedText>
            <ThemedText style={styles.infoValue}>{Updates.channel ?? "—"}</ThemedText>
          </View>
          <View style={[styles.rowDivider, { backgroundColor: theme.base100 }]} />
          <View style={[styles.row, styles.infoRow]}>
            <ThemedText style={[styles.infoLabel, { color: theme.baseContentMuted }]}>
              Runtime Version
            </ThemedText>
            <ThemedText style={styles.infoValue}>{Updates.runtimeVersion ?? "—"}</ThemedText>
          </View>
          <View style={[styles.rowDivider, { backgroundColor: theme.base100 }]} />
          <View style={[styles.row, styles.infoRow]}>
            <ThemedText style={[styles.infoLabel, { color: theme.baseContentMuted }]}>
              OTA Update
            </ThemedText>
            <ThemedText style={styles.infoValue} numberOfLines={1}>
              {Updates.isEmbeddedLaunch ? "Embedded" : (Updates.updateId?.slice(0, 8) ?? "—")}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Danger zone */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionLabel} opacity={60}>
          DANGER ZONE
        </ThemedText>
        <View style={[styles.card, { backgroundColor: theme.base200 }]}>
          <Pressable
            style={({ pressed }) => [
              styles.row,
              { opacity: pressed || isDeletingAccount ? 0.7 : 1 },
            ]}
            onPress={handleDeleteAccount}
            disabled={isDeletingAccount}
          >
            <View style={styles.deleteRow}>
              <ThemedText style={[styles.rowText, { color: theme.error }]}>
                Delete Account
              </ThemedText>
              <ThemedText style={styles.deleteSubtext} opacity={60}>
                Permanently removes your account and all data
              </ThemedText>
            </View>
            {isDeletingAccount && <ActivityIndicator size="small" color={theme.error} />}
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 8,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.8,
    paddingHorizontal: 4,
  },
  card: {
    borderRadius: 14,
    overflow: "hidden",
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  emailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  emailLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  emailValue: {
    fontSize: 14,
    flexShrink: 1,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },
  rowText: {
    fontSize: 16,
    fontWeight: "600",
  },
  deleteRow: {
    gap: 3,
  },
  deleteSubtext: {
    fontSize: 13,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 14,
    flexShrink: 1,
  },
});
