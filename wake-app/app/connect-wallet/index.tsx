import { useEffect } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { buildConnectUrl, parsePublicKeyFromCallback } from "../../src/services/freighter";
import { useWakeStore } from "../../src/state/useWakeStore";

export default function ConnectWallet() {
  const connectWallet = useWakeStore((s) => s.connectWallet);

  useEffect(() => {
    const subscription = Linking.addEventListener("url", ({ url }) => {
      const publicKey = parsePublicKeyFromCallback(url);
      if (publicKey) {
        connectWallet(publicKey);
        router.replace("/leaderboard");
      }
    });
    return () => subscription.remove();
  }, [connectWallet]);

  const handleConnect = () => {
    Linking.openURL(buildConnectUrl());
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connect your wallet</Text>
      <Text style={styles.body}>
        Wake opens Freighter to get your public address. Freighter never shares your secret key with
        Wake — you approve every transaction yourself, in Freighter, when a mirrored trade is ready.
      </Text>
      <Pressable style={styles.button} onPress={handleConnect}>
        <Text style={styles.buttonText}>Connect with Freighter</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, gap: 16 },
  title: { fontSize: 26, fontWeight: "700" },
  body: { fontSize: 16, lineHeight: 22, color: "#333" },
  button: { backgroundColor: "#111", borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 16 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
