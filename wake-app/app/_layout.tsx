import "../src/polyfills";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding/index" />
          <Stack.Screen name="connect-wallet/index" />
          <Stack.Screen name="leaderboard/index" options={{ headerShown: true, title: "Leaderboard" }} />
          <Stack.Screen name="follow/[walletId]" options={{ headerShown: true, title: "Follow wallet" }} />
          <Stack.Screen name="portfolio/index" options={{ headerShown: true, title: "Portfolio" }} />
          <Stack.Screen name="settings/index" options={{ headerShown: true, title: "Settings" }} />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
