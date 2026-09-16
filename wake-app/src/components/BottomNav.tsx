import { Link, usePathname } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

const TABS = [
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/settings", label: "Settings" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link key={tab.href} href={tab.href} style={styles.tab} asChild={false}>
            <Text style={[styles.label, active && styles.activeLabel]}>{tab.label}</Text>
          </Link>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ddd",
    backgroundColor: "#fff",
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  label: {
    fontSize: 14,
    color: "#888",
  },
  activeLabel: {
    color: "#111",
    fontWeight: "600",
  },
});
