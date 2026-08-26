import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AVATAR_URLS, Avatar, resolveAvatarUrl } from "~/components/Avatar";
import { useSupabase } from "~/hooks/use-supabase";
import { useThemeColors } from "~/hooks/use-theme-colors";

export default function EditAvatar() {
  const { theme } = useThemeColors();
  const { profile, updateAvatarUrl } = useSupabase();
  const insets = useSafeAreaInsets();

  const currentAvatar = resolveAvatarUrl(profile?.avatarUrl ?? null);

  const { mutate, isPending } = useMutation({
    mutationFn: updateAvatarUrl,
    onSuccess: () => router.back(),
    onError: (error) => console.error(error),
  });

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.base300, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <View style={styles.grid}>
        {AVATAR_URLS.map((url) => {
          const isSelected = currentAvatar === url;
          return (
            <Pressable
              key={url}
              onPress={() => mutate(url)}
              disabled={isPending}
              style={[
                styles.option,
                {
                  borderColor: isSelected ? theme.baseContent : "transparent",
                  backgroundColor: isSelected ? theme.base100 : theme.base200,
                  opacity: isPending && !isSelected ? 0.4 : 1,
                },
              ]}
            >
              <Avatar url={url} size={80} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "center",
  },
  option: {
    padding: 8,
    borderRadius: 52,
    borderWidth: 2,
  },
});
