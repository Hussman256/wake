import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { BottomNav } from "../../src/components/BottomNav";
import { fetchLeaderboard, type LeaderboardEntry } from "../../src/services/leaderboard-api";

function truncate(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function Row({ entry }: { entry: LeaderboardEntry }) {
  return (
    <Pressable style={styles.row} onPress={() => router.push(`/follow/${entry.wallet}`)}>
      <View style={styles.rowLeft}>
        <Text style={styles.address}>{entry.label ?? truncate(entry.wallet)}</Text>
        <Text style={styles.subtext}>{entry.follower_count} followers</Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={[styles.pnl, entry.pnl_30d_pct >= 0 ? styles.positive : styles.negative]}>
          {(entry.pnl_30d_pct * 100).toFixed(1)}%
        </Text>
        <Text style={styles.subtext}>{(entry.win_rate * 100).toFixed(0)}% win rate</Text>
      </View>
    </Pressable>
  );
}

export default function Leaderboard() {
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => fetchLeaderboard(),
  });

  return (
    <View style={styles.container}>
      {isLoading && <Text style={styles.status}>Loading leaderboard…</Text>}
      {isError && <Text style={styles.status}>Couldn't reach the leaderboard service.</Text>}
      <FlatList
        data={data ?? []}
        keyExtractor={(item) => item.wallet}
        renderItem={({ item }) => <Row entry={item} />}
        refreshing={isRefetching}
        onRefresh={refetch}
        ListEmptyComponent={!isLoading ? <Text style={styles.status}>No tracked wallets yet.</Text> : null}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  rowLeft: { gap: 4 },
  rowRight: { alignItems: "flex-end", gap: 4 },
  address: { fontSize: 16, fontWeight: "600" },
  subtext: { fontSize: 12, color: "#888" },
  pnl: { fontSize: 16, fontWeight: "700" },
  positive: { color: "#0a8a3c" },
  negative: { color: "#c0392b" },
});
