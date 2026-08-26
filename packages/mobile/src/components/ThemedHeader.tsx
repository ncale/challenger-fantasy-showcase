import { StyleSheet, View, type ViewProps } from "react-native";
import Logo from "~/assets/images/wreath-logo-w.svg";
import ThemedText from "./ThemedText";
import ThemedView from "./ThemedView";

const ThemedHeader = ({
  style,
  title = "Challenger",
  ...props
}: { title?: string } & ViewProps) => {
  const size = 32;
  return (
    <ThemedView style={[styles.container, style]} {...props}>
      <View style={[styles.logoWrap]}>
        <Logo width={size} height={size} />
      </View>
      <ThemedText style={styles.title}>{title}</ThemedText>
    </ThemedView>
  );
};

export default ThemedHeader;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  logoWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    fontStyle: "italic",
    letterSpacing: -0.3,
  },
});
