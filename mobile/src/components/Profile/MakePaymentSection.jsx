import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import { CreditCard, Loader, Tag } from "lucide-react-native";
import { apiRequest } from "@/utils/api";
import { supabase } from "@/lib/supabase";

const CATEGORIES = [
  { label: "Food", value: "food" },
  { label: "Drinks", value: "drinks" },
  { label: "Services", value: "services" },
  { label: "Other", value: "other" },
];

const PROVIDERS = [
  { label: "Monzo", value: "monzo", color: "#E91E63" },
  { label: "Wise", value: "wise", color: "#00B9FF" },
];

export function MakePaymentSection({ user }) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [provider, setProvider] = useState("monzo");
  const [loading, setLoading] = useState(false);
  const [discountInfo, setDiscountInfo] = useState(null);

  // Only show member discount if truly active subscription
  const hasActiveMembership =
    user?.subscription_status === "active" &&
    user?.membership_status !== "inactive";

  const handlePayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    setLoading(true);

    try {
      // Include the Supabase JWT so the backend can check membership discounts
      const { data: sessionData } = await supabase.auth.getSession();
      const jwt = sessionData?.session?.access_token;

      const response = await apiRequest("/api/payment-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
        },
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

      // Show discount information if applied
      if (data.discountApplied) {
        setDiscountInfo({
          original: data.originalAmount,
          discounted: data.amount,
        });
        Alert.alert(
          "Member Discount Applied! 🎉",
          `Original: $${data.originalAmount}\nWith 10% discount: $${data.amount}`,
          [
            {
              text: "Continue",
              onPress: async () => {
                const supported = await Linking.canOpenURL(data.paymentUrl);
                if (supported) {
                  await Linking.openURL(data.paymentUrl);
                } else {
                  Alert.alert("Error", "Cannot open payment link");
                }
              },
            },
          ],
        );
      } else {
        // Open payment URL directly if no discount
        const supported = await Linking.canOpenURL(data.paymentUrl);
        if (supported) {
          await Linking.openURL(data.paymentUrl);
        } else {
          Alert.alert("Error", "Cannot open payment link");
        }
      }
    } catch (error) {
      console.error("Payment error:", error);
      Alert.alert("Error", "Failed to process payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}
      >
        <CreditCard size={24} color="#166534" />
        <Text
          style={{
            fontSize: 18,
            fontFamily: "Inter_700Bold",
            color: "#166534",
            marginLeft: 12,
          }}
        >
          Make a Payment
        </Text>
      </View>

      {/* Member Discount Badge */}
      {hasActiveMembership && (
        <View
          style={{
            backgroundColor: "#DCFCE7",
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Tag size={16} color="#16A34A" />
          <Text
            style={{
              fontSize: 13,
              fontFamily: "Inter_600SemiBold",
              color: "#16A34A",
              marginLeft: 8,
              flex: 1,
            }}
          >
            Active Member: 10% discount applied automatically! 🎉
          </Text>
        </View>
      )}

      {/* Category Selection */}
      <Text
        style={{
          fontSize: 14,
          fontFamily: "Inter_600SemiBold",
          color: "#374151",
          marginBottom: 8,
        }}
      >
        What are you paying for?
      </Text>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 16,
        }}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.value}
            onPress={() => setCategory(cat.value)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: category === cat.value ? "#22C55E" : "#F3F4F6",
              borderWidth: 1,
              borderColor: category === cat.value ? "#22C55E" : "#E5E7EB",
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 14,
                color: category === cat.value ? "#FFFFFF" : "#6B7280",
              }}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Amount Input */}
      <Text
        style={{
          fontSize: 14,
          fontFamily: "Inter_600SemiBold",
          color: "#374151",
          marginBottom: 8,
        }}
      >
        Amount
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#F9FAFB",
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#D1FAE5",
          paddingHorizontal: 16,
          marginBottom: 16,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontFamily: "Inter_600SemiBold",
            color: "#166534",
            marginRight: 4,
          }}
        >
          $
        </Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          placeholderTextColor="#9CA3AF"
          keyboardType="decimal-pad"
          style={{
            flex: 1,
            fontSize: 18,
            fontFamily: "Inter_600SemiBold",
            color: "#166534",
            paddingVertical: 14,
          }}
        />
      </View>

      {/* Provider Selection */}
      <Text
        style={{
          fontSize: 14,
          fontFamily: "Inter_600SemiBold",
          color: "#374151",
          marginBottom: 8,
        }}
      >
        Payment Method
      </Text>
      <View
        style={{
          flexDirection: "row",
          gap: 12,
          marginBottom: 20,
        }}
      >
        {PROVIDERS.map((prov) => (
          <TouchableOpacity
            key={prov.value}
            onPress={() => setProvider(prov.value)}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 12,
              backgroundColor: provider === prov.value ? prov.color : "#F3F4F6",
              borderWidth: 2,
              borderColor: provider === prov.value ? prov.color : "#E5E7EB",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_700Bold",
                fontSize: 15,
                color: provider === prov.value ? "#FFFFFF" : "#6B7280",
              }}
            >
              {prov.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        onPress={handlePayment}
        disabled={loading || !amount}
        style={{
          backgroundColor: !amount || loading ? "#D1D5DB" : "#166534",
          borderRadius: 12,
          paddingVertical: 14,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {loading ? (
          <Loader size={20} color="#FFFFFF" />
        ) : (
          <Text
            style={{
              fontFamily: "Inter_700Bold",
              fontSize: 16,
              color: "#FFFFFF",
            }}
          >
            Continue to Payment
          </Text>
        )}
      </TouchableOpacity>

      <Text
        style={{
          fontSize: 12,
          fontFamily: "Inter_400Regular",
          color: "#6B7280",
          textAlign: "center",
          marginTop: 12,
          lineHeight: 18,
        }}
      >
        You'll be redirected to {provider === "monzo" ? "Monzo" : "Wise"} to
        complete your payment securely.
      </Text>
    </View>
  );
}
