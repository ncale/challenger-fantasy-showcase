import { ScrollView } from "react-native";
import { GameInfoContent } from "~/components/GameInfoContent";
import ThemedView from "~/components/ThemedView";

const InfoTab = ({ gameId }: { gameId: string | undefined }) => {
  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16, paddingBottom: 128 }}>
        <GameInfoContent gameId={gameId} />
      </ScrollView>
    </ThemedView>
  );
};

export default InfoTab;
