import * as Notifications from "expo-notifications";
import type { MirrorResult } from "wake-engine";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function notifyMirrorExecuted(result: MirrorResult) {
  if (!result.submitted) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Mirrored trade executed",
      body: `${result.swap?.sellAsset.code} → ${result.swap?.buyAsset.code}, tx ${result.txHash?.slice(0, 8)}…`,
    },
    trigger: null,
  });
}
