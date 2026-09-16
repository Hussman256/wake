import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { BottomNav } from "../../src/components/BottomNav";
import { useWakeStore } from "../../src/state/useWakeStore";

function truncate(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export default function Portfolio() {
  const followedWallets = useWakeStore((s) => s.followedWallets);
  const unfollowWallet = useWakeStore((s) => s.unfollowWallet);

  return (
    <View style={styles.container}>
      <FlatList
        data={followedWallets}
        keyExtractor={(item) => item.address}
        ListEmptyComponent={
          <Text style={styles.status}>
            You're not following anyone yet. Pick a wallet from the leaderboard to start mirroring.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View>
              <Text style={styles.address}>{truncate(item.address)}</Text>
              <Text style={styles.subtext}>
                {(item.maxPositionPct * 100).toFixed(0)}% per trade · {item.maxSlippageBps}bps slippage · {(item.stopLossPct * 100).toFixed(0)}% stop-loss
              </Text>
            </View>
            <Pressable onPress={() => unfollowWallet(item.address)}>
              <Text style={styles.unfollow}>Unfollow</Text>
            </Pressable>
          </View>
        )}
      />
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  status: { textAlign: "center", padding: 24, color: "#888" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  address: { fontSize: 16, fontWeight: "600" },
  subtext: { fontSize: 12, color: "#888", marginTop: 4 },
  unfollow: { color: "#c0392b", fontSize: 14, fontWeight: "600" },
});
