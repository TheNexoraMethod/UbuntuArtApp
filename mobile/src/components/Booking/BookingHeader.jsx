import { View, Text, TouchableOpacity } from "react-native";
import { X } from "lucide-react-native";

export function BookingHeader({ currentStep, onBack, onReset, insets }) {
  return (
    <View
      style={{
        paddingTop: insets.top + 16,
        paddingHorizontal: 20,
        paddingBottom: 16,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#D1E7DD",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        {currentStep > 1 && (
          <TouchableOpacity onPress={onBack} style={{ padding: 8 }}>
            <Text style={{ color: "#22C55E", fontFamily: "Inter_600SemiBold" }}>
              ← Back
            </Text>
          </TouchableOpacity>
        )}
        <Text
          style={{
            fontSize: 20,
            fontFamily: "Inter_700Bold",
            color: "#166534",
            flex: 1,
            textAlign: currentStep === 1 ? "left" : "center",
          }}
        >
          {currentStep === 1 && "Select Booking Type"}
          {currentStep === 2 && "Choose Room & Dates"}
          {currentStep === 3 && "Complete Booking"}
        </Text>
        <TouchableOpacity onPress={onReset} style={{ padding: 8 }}>
          <X size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "center", gap: 8 }}>
        {[1, 2, 3].map((step) => (
          <View
            key={step}
            style={{
              width: step === currentStep ? 24 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: step <= currentStep ? "#F59E0B" : "#D1E7DD",
            }}
          />
        ))}
      </View>
    </View>
  );
}
