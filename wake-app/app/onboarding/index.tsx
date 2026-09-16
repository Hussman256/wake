import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { router } from "expo-router";
import { useWakeStore } from "../../src/state/useWakeStore";

const STEPS = [
  {
    title: "Copy the trades you trust",
    body: "Follow a wallet on Stellar/Soroban and Wake mirrors its Aquarius swaps into your own, sized to a percentage of your balance you choose.",
  },
  {
    title: "Non-custodial, always",
    body: "Wake never holds your private keys. Every mirrored trade is built unsigned and you sign it yourself, in Freighter or your hardware wallet.",
  },
  {
    title: "This is not financial advice",
    body: "Copy-trading carries real risk: slippage, thin liquidity, and wallets you follow can lose money. Only mirror with funds you can afford to lose.",
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [acknowledged, setAcknowledged] = useState(false);
  const completeOnboarding = useWakeStore((s) => s.completeOnboarding);

  const isLastStep = step === STEPS.length - 1;
  const current = STEPS[step]!;

  const handleNext = () => {
    if (!isLastStep) {
      setStep((s) => s + 1);
      return;
    }
    completeOnboarding();
    router.replace("/connect-wallet");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.stepIndicator}>
        {step + 1} / {STEPS.length}
      </Text>
      <Text style={styles.title}>{current.title}</Text>
      <Text style={styles.body}>{current.body}</Text>

      {isLastStep && (
        <View style={styles.ackRow}>
          <Switch value={acknowledged} onValueChange={setAcknowledged} />
          <Text style={styles.ackText}>
            I understand Wake is not financial advice and copy-trading carries risk of loss.
          </Text>
        </View>
      )}

      <Pressable
        style={[styles.button, isLastStep && !acknowledged && styles.buttonDisabled]}
        disabled={isLastStep && !acknowledged}
        onPress={handleNext}
      >
        <Text style={styles.buttonText}>{isLastStep ? "Get started" : "Next"}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", padding: 24, gap: 16 },
  stepIndicator: { color: "#888", fontSize: 13 },
  title: { fontSize: 26, fontWeight: "700" },
  body: { fontSize: 16, lineHeight: 22, color: "#333" },
  ackRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 8 },
  ackText: { flex: 1, fontSize: 13, color: "#444" },
  button: { backgroundColor: "#111", borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 16 },
  buttonDisabled: { backgroundColor: "#ccc" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
