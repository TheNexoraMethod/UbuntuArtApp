import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CreditCard } from "lucide-react-native";
import { apiRequest } from "@/utils/api";
import ScreenBackground from "../../components/ScreenBackground.jsx";

const CATEGORIES = [
  { label: "🍔 Food", value: "food" },
  { label: "🍹 Drinks", value: "drinks" },
  { label: "🛠 Services", value: "services" },
  { label: "📦 Other", value: "other" },
];

const PROVIDERS = [
  { label: "Monzo", value: "monzo", color: "#E91E63" },
  { label: "Wise", value: "wise", color: "#00B9FF" },
];

export default function PayTab() {
  const insets = useSafeAreaInsets();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [provider, setProvider] = useState("monzo");
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert(
        "Enter an amount",
        "Please enter the amount you want to pay.",
      );
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest("/api/payment-link", {
        method: "POST",
        body: JSON.stringify({
          amount: parseFloat(amount),
          category,
          provider,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate payment link");
      }

      const data = await response.json();
      const supported = await Linking.canOpenURL(data.paymentUrl);
      if (supported) {
        await Linking.openURL(data.paymentUrl);
      } else {
        Alert.alert("Error", "Cannot open payment link");
      }
    } catch (error) {
      console.error("Payment error:", error);
      Alert.alert("Error", "Could not process payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: 20,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <CreditCard size={26} color="#22C55E" />
          <View style={{ marginLeft: 12 }}>
            <Text style={{ fontSize: 22, fontWeight: "700", color: "#FFFFFF" }}>
              Pay at Ubuntu Village
            </Text>
            <Text style={{ fontSize: 13, color: "#D1FAE5", marginTop: 2 }}>
              Quick payment for food, drinks &amp; services
            </Text>
          </View>
        </View>

        {/* Card */}
        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.97)",
            borderRadius: 20,
            padding: 20,
          }}
        >
          {/* Category */}
          <Text style={styles.label}>What are you paying for?</Text>
          <View style={styles.chipRow}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                onPress={() => setCategory(cat.value)}
                style={[
                  styles.chip,
                  category === cat.value && styles.chipActive,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    category === cat.value && styles.chipTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Amount */}
          <Text style={[styles.label, { marginTop: 20 }]}>Amount</Text>
          <View style={styles.amountRow}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor="#9CA3AF"
              keyboardType="decimal-pad"
              style={styles.amountInput}
            />
          </View>

          {/* Provider */}
          <Text style={[styles.label, { marginTop: 20 }]}>Pay via</Text>
          <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
            {PROVIDERS.map((prov) => (
              <TouchableOpacity
                key={prov.value}
                onPress={() => setProvider(prov.value)}
                style={[
                  styles.providerBtn,
                  provider === prov.value && {
                    backgroundColor: prov.color,
                    borderColor: prov.color,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.providerText,
                    provider === prov.value && { color: "#FFFFFF" },
                  ]}
                >
                  {prov.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Submit */}
          <TouchableOpacity
            onPress={handlePayment}
            disabled={loading || !amount}
            style={[
              styles.payBtn,
              (!amount || loading) && { backgroundColor: "#D1D5DB" },
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.payBtnText}>Continue to Payment</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.hint}>
            You'll be redirected to {provider === "monzo" ? "Monzo" : "Wise"} to
            complete your payment securely.
          </Text>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = {
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  chipActive: {
    backgroundColor: "#22C55E",
    borderColor: "#22C55E",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1FAE5",
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: "700",
    color: "#166534",
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: "#166534",
    paddingVertical: 14,
  },
  providerBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  providerText: {
    fontWeight: "700",
    fontSize: 15,
    color: "#6B7280",
  },
  payBtn: {
    backgroundColor: "#166534",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
  },
  payBtnText: {
    fontWeight: "700",
    fontSize: 16,
    color: "#FFFFFF",
  },
  hint: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 18,
  },
};
