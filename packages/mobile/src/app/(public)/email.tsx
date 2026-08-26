import { LINKS } from "@challenger-fantasy/core";
import { emailSchema } from "@challenger-fantasy/schemas";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ThemedExternalLink from "~/components/ThemedExternalLink";
import ThemedText from "~/components/ThemedText";
import { useSupabase } from "~/hooks/use-supabase";
import { useAppTheme } from "~/providers/app-theme-provider";

function EmailPage() {
  const { signInWithOtp, isLoaded } = useSupabase();
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (emailToSend: string) => {
      if (!isLoaded || !emailToSend) throw new Error("Not ready or no email");
      emailSchema.parse(emailToSend);
      await signInWithOtp(emailToSend.trim());
    },
    onSuccess: () => {
      router.push({ pathname: "/otp", params: { email } });
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleEmailSubmit = () => {
    setError(null);
    mutation.mutate(email);
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.base300, paddingBottom: insets.bottom + 16 },
      ]}
    >
      {/* All content stacked top-down so the button stays near the input
          and is never pushed below the keyboard */}
      <ThemedText style={[styles.titleText, { color: theme.baseContentExtraMuted }]}>
        Send a one time password
      </ThemedText>

      <View style={styles.inputGroup}>
        <ThemedText style={[styles.label, { color: theme.baseContent }]}>Email address</ThemedText>
        <TextInput
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!mutation.isPending}
          placeholder="Enter your email"
          style={[
            styles.input,
            {
              backgroundColor: theme.base300,
              color: theme.baseContent,
              borderColor: theme.baseContentMuted,
            },
          ]}
          placeholderTextColor={theme.baseContentMuted}
          returnKeyType="done"
          textContentType="emailAddress"
          autoFocus
          onSubmitEditing={handleEmailSubmit}
        />
        <ThemedText style={[styles.infoText, { color: theme.baseContentExtraMuted }]}>
          Your email address will not be visible in your public profile.
        </ThemedText>
      </View>

      <Pressable
        style={[
          styles.button,
          {
            backgroundColor:
              email && !mutation.isPending ? theme.baseContent : theme.baseContentMuted,
          },
        ]}
        onPress={handleEmailSubmit}
        disabled={!email.trim() || mutation.isPending}
      >
        <ThemedText style={[styles.buttonText, { color: theme.base200 }]}>
          {mutation.isPending ? "Sending..." : "Send code"}
        </ThemedText>
      </Pressable>

      {error ? (
        <ThemedText style={[styles.errorText, { color: theme.error }]}>{error}</ThemedText>
      ) : null}

      <ThemedText style={[styles.infoText, { color: theme.baseContentExtraMuted }]}>
        By continuing, you agree to our{" "}
        <ThemedExternalLink href={LINKS.TOS}>Terms of Service</ThemedExternalLink> and{" "}
        <ThemedExternalLink href={LINKS.PRIVACY}>Privacy Policy</ThemedExternalLink>.
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 32,
    paddingHorizontal: 16,
    gap: 20,
  },
  titleText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 4,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 18,
  },
  button: {
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 10,
  },
  buttonText: {
    fontWeight: "700",
    fontSize: 18,
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
  },
  infoText: {
    textAlign: "center",
    fontSize: 13,
    lineHeight: 18,
  },
});

export default EmailPage;
