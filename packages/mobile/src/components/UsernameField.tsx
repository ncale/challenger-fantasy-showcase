import { UsernameSchema } from "@challenger-fantasy/schemas";
import { useQuery } from "@tanstack/react-query";
import { StyleSheet, TextInput, View } from "react-native";
import { useDebounce } from "~/hooks/use-debounce";
import { useThemeColors } from "~/hooks/use-theme-colors";
import { checkUsernameQuery } from "~/lib/init-queries";
import ThemedText from "./ThemedText";

/**
 * Hook encapsulating username validation + debounced availability check.
 *
 * @param value        - Current raw input value
 * @param currentUsername - The user's existing username (edit page only). If provided and
 *                          the trimmed value matches it, the availability check is skipped.
 */
export function useUsernameField(value: string, currentUsername?: string) {
  const trimmed = value.trim();

  const parseResult = UsernameSchema.safeParse(trimmed);
  const isFormatValid = parseResult.success;
  const validationError =
    trimmed.length > 0 && !isFormatValid ? (parseResult.error.issues[0]?.message ?? null) : null;

  const isUnchanged = currentUsername !== undefined && trimmed === currentUsername;

  // Only fire the availability query when format is valid and value differs from current
  const queryUsername = isFormatValid && !isUnchanged ? trimmed : "";
  const debouncedQueryUsername = useDebounce(queryUsername, 500);

  // "pending" covers both the debounce window and the in-flight fetch
  const { data, isFetching } = useQuery(checkUsernameQuery(debouncedQueryUsername || ""));
  const isChecking = queryUsername !== debouncedQueryUsername || isFetching;
  const isAvailable = isUnchanged ? true : debouncedQueryUsername ? data?.isAvailable : undefined;

  return { validationError, isFormatValid, isAvailable, isChecking, isUnchanged };
}

type UsernameFieldProps = {
  value: string;
  onChange: (text: string) => void;
  /** Existing username — used to skip availability check when unchanged (edit page). */
  currentUsername?: string;
  autoFocus?: boolean;
};

/**
 * Controlled username TextInput + live validation/availability feedback.
 * Renders the input and a status line below it.
 */
export function UsernameField({ value, onChange, currentUsername, autoFocus }: UsernameFieldProps) {
  const { theme, opacity } = useThemeColors();
  const { validationError, isAvailable, isChecking, isUnchanged } = useUsernameField(
    value,
    currentUsername,
  );

  const trimmed = value.trim();
  const showStatus = trimmed.length > 0;

  let statusText: string | null = null;
  let statusColor = theme.baseContentMuted;

  if (showStatus) {
    if (validationError) {
      statusText = validationError;
      statusColor = theme.error;
    } else if (isUnchanged) {
      statusText = null;
    } else if (isChecking) {
      statusText = "Checking…";
      statusColor = theme.baseContentMuted;
    } else if (isAvailable === true) {
      statusText = `@${trimmed} is available`;
      statusColor = theme.success;
    } else if (isAvailable === false) {
      statusText = `@${trimmed} is taken`;
      statusColor = theme.error;
    }
  }

  const hasError = !!validationError || isAvailable === false;

  return (
    <>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.base200,
            color: theme.baseContent,
            borderColor: hasError
              ? theme.error
              : isAvailable === true
                ? theme.success
                : theme.baseContent + opacity[20],
          },
        ]}
        placeholder="Username"
        placeholderTextColor={theme.baseContent + opacity[40]}
        value={value}
        onChangeText={onChange}
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus={autoFocus}
        maxLength={24}
      />
      <View style={styles.statusSlot}>
        {statusText ? (
          <ThemedText style={[styles.statusText, { color: statusColor }]}>{statusText}</ThemedText>
        ) : null}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    width: "100%",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
  },
  statusSlot: {
    height: 18,
    justifyContent: "center",
  },
  statusText: {
    fontSize: 13,
  },
});
