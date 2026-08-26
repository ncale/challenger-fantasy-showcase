import { useMutation } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import ThemedText from "~/components/ThemedText";
import ThemedView from "~/components/ThemedView";
import { useSupabase } from "~/hooks/use-supabase";
import { useThemeColors } from "~/hooks/use-theme-colors";

const OtpPage = () => {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { verifyOtp, isLoaded } = useSupabase();
  const { theme, opacity } = useThemeColors();

  const mutation = useMutation({
    mutationFn: async (values: { email: string; otp: string }) => {
      if (!isLoaded) throw new Error("Not ready");
      if (!values.email || !/^\d{6}$/.test(values.otp)) throw new Error("Invalid code or email");
      await verifyOtp(values.email, values.otp);
    },
    onSuccess: () => {
      router.replace("/browse");
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const submit = (code: string) => {
    setError(null);
    if (!email) {
      setError("Missing email address.");
      return;
    }
    mutation.mutate({ email: String(email), otp: code });
  };

  const handleChangeText = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "").slice(0, 6);
    setOtp(cleaned);
    if (cleaned.length === 6) {
      submit(cleaned);
    }
  };

  return (
    <ThemedView style={styles.outer}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.inner}>
          <ThemedText style={styles.title}>Enter the code sent to your email</ThemedText>
          <View style={{ width: "100%", maxWidth: 400 }}>
            <ThemedText style={styles.label}>One-Time Password</ThemedText>
            <TextInput
              value={otp}
              onChangeText={handleChangeText}
              keyboardType="number-pad"
              autoFocus
              placeholder="000000"
              style={[
                styles.input,
                {
                  backgroundColor: theme.base200,
                  color: theme.baseContent,
                  borderColor: error ? theme.error : theme.base300,
                },
              ]}
              placeholderTextColor={theme.baseContent + opacity[40]}
              maxLength={6}
              returnKeyType="done"
              onSubmitEditing={() => submit(otp)}
              editable={!mutation.isPending}
            />
            <View style={styles.statusSlot}>
              {mutation.isPending ? (
                <ActivityIndicator size="small" color={theme.baseContent} />
              ) : error ? (
                <>
                  <ThemedText style={[styles.errorText, { color: theme.error }]}>
                    {error}
                  </ThemedText>
                  <Pressable
                    style={[styles.retryButton, { borderColor: theme.baseContentExtraMuted }]}
                    onPress={() => submit(otp)}
                  >
                    <ThemedText style={styles.retryText}>Try again</ThemedText>
                  </Pressable>
                </>
              ) : null}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
};

export default OtpPage;

const styles = StyleSheet.create({
  outer: {
    flex: 1,
  },
  kav: {
    flex: 1,
  },
  inner: {
    flex: 1,
    alignItems: "center",
    paddingTop: 56,
    paddingHorizontal: 32,
    paddingBottom: 24,
    gap: 36,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  input: {
    width: "100%",
    fontSize: 28,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1.5,
    letterSpacing: 4,
    textAlign: "center",
  },
  statusSlot: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    gap: 10,
  },
  errorText: {
    textAlign: "center",
    fontSize: 14,
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  retryText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
