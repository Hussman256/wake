import { router } from "expo-router";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { BottomNav } from "../../src/components/BottomNav";
import { useWakeStore } from "../../src/state/useWakeStore";

export default function Settings() {
  const wallet = useWakeStore((s) => s.wallet);
  const notificationsEnabled = useWakeStore((s) => s.notificationsEnabled);
  const setNotificationsEnabled = useWakeStore((s) => s.setNotificationsEnabled);
  const disconnectWallet = useWakeStore((s) => s.disconnectWallet);

  const handleDisconnect = () => {
    disconnectWallet();
    router.replace("/connect-wallet");
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Wallet</Text>
        <Text style={styles.value}>{wallet?.publicKey ?? "Not connected"}</Text>
      </View>

      <View style={[styles.section, styles.row]}>
        <Text style={styles.sectionLabel}>Notify me on mirrored trades</Text>
        <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />
      </View>

      <Pressable style={styles.disconnect} onPress={handleDisconnect}>
        <Text style={styles.disconnectText}>Disconnect wallet</Text>
      </Pressable>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", justifyContent: "space-between" },
  section: { padding: 20, gap: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#eee" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionLabel: { fontSize: 14, color: "#444" },
  value: { fontSize: 15, fontWeight: "600" },
  disconnect: { margin: 20, alignItems: "center" },
  disconnectText: { color: "#c0392b", fontSize: 15, fontWeight: "600" },
});
