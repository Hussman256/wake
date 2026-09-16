import { Redirect } from "expo-router";
import { useWakeStore } from "../src/state/useWakeStore";

export default function Index() {
  const hasOnboarded = useWakeStore((s) => s.hasOnboarded);
  const wallet = useWakeStore((s) => s.wallet);

  if (!hasOnboarded) return <Redirect href="/onboarding" />;
  if (!wallet) return <Redirect href="/connect-wallet" />;
  return <Redirect href="/leaderboard" />;
}
