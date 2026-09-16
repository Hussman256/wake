import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { registerFollow } from "../../src/services/leaderboard-api";
import { useWakeStore } from "../../src/state/useWakeStore";

export default function FollowWallet() {
  const { walletId } = useLocalSearchParams<{ walletId: string }>();
  const wallet = useWakeStore((s) => s.wallet);
  const followWallet = useWakeStore((s) => s.followWallet);

  const [maxPositionPct, setMaxPositionPct] = useState("10");
  const [maxSlippageBps, setMaxSlippageBps] = useState("100");
  const [stopLossPct, setStopLossPct] = useState("20");
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!wallet) {
      router.push("/connect-wallet");
      return;
    }
    setSubmitting(true);
    try {
      followWallet({
        address: walletId,
        maxPositionPct: Number(maxPositionPct) / 100,
        maxSlippageBps: Number(maxSlippageBps),
        stopLossPct: Number(stopLossPct) / 100,
      });
      await registerFollow(walletId, wallet.publicKey);
      router.replace("/portfolio");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Following</Text>
      <Text style={styles.address}>{walletId}</Text>

      <Field label="% of balance to allocate per mirrored trade" value={maxPositionPct} onChangeText={setMaxPositionPct} />
      <Field label="Max slippage (bps)" value={maxSlippageBps} onChangeText={setMaxSlippageBps} />
      <Field label="Stop-loss (%)" value={stopLossPct} onChangeText={setStopLossPct} />

      <Pressable style={styles.button} disabled={submitting} onPress={handleConfirm}>
        <Text style={styles.buttonText}>{submitting ? "Confirming…" : "Confirm follow"}</Text>
      </Pressable>
    </ScrollView>
  );
}

function Field({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        keyboardType="numeric"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 16 },
  label: { fontSize: 13, color: "#888" },
  address: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  field: { gap: 6 },
  fieldLabel: { fontSize: 14, color: "#444" },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  button: { backgroundColor: "#111", borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 16 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
