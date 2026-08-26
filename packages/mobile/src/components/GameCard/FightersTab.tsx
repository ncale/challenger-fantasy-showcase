import { Suspense } from "react";
import { ActivityIndicator } from "react-native";
import { FightersList } from "./FightersList";

const FightersTab = ({ eventId }: { eventId: string | undefined }) => (
  <Suspense fallback={<ActivityIndicator />}>
    <FightersList eventId={eventId} />
  </Suspense>
);

export default FightersTab;
