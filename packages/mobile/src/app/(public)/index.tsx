import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { useAppSettings } from "~/hooks/use-app-settings";
import { FLAGS } from "~/lib/flags";
import { onboardingStorage } from "~/lib/storage";

export default function Index() {
  const { getFlag } = useAppSettings();
  const [target, setTarget] = useState<"/welcome" | "/onboarding" | null>(null);

  useEffect(() => {
    onboardingStorage.hasSeenOnboarding().then((seen) => {
      setTarget(!seen && getFlag(FLAGS.onboarding) ? "/onboarding" : "/welcome");
    });
  }, [getFlag]);

  if (!target) return null;
  return <Redirect href={target} />;
}
