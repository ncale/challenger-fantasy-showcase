import { Loader } from "lucide-react-native";
import { View } from "react-native";
import { useAppTheme } from "~/providers/app-theme-provider";
import { TeamsLeaderboard } from "./teams-leaderboard";

// TODO: rename from teams-tab.tsx to TeamsTab.tsx
// TODO: move this into ~/components/Tabs/...

export function TeamsTab({ submissionId }: { submissionId: string | undefined }) {
  const { theme } = useAppTheme();

  if (!submissionId) {
    return <Loader />;
  }

  return (
    <View style={{ flex: 1, paddingTop: 8, backgroundColor: theme.base300 }}>
      <TeamsLeaderboard submissionId={submissionId} style={{ flex: 1 }} />
    </View>
  );
}
