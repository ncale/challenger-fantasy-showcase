import { StyleSheet, View, type ViewProps } from "react-native";
import ThemedView from "./ThemedView";

const ThemedCard = ({ children, style, ...props }: ViewProps) => {
  return (
    <ThemedView style={[styles.card, style]} {...props}>
      <View style={styles.row}>{children}</View>
    </ThemedView>
  );
};

export default ThemedCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "transparent",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginVertical: 6,
    marginHorizontal: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
});
