import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { CreditCard } from "lucide-react-native";

export function BookingForm({
  formData,
  onFormChange,
  bookingType,
  onSubmit,
  submitting,
  calculateTotalPrice,
}) {
  return (
    <View>
      <Text
        style={{
          fontSize: 18,
          fontFamily: "Inter_700Bold",
          color: "#166534",
          marginBottom: 16,
        }}
      >
        Your Details
      </Text>

      <View style={{ marginBottom: 16 }}>
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Inter_600SemiBold",
            color: "#374151",
            marginBottom: 8,
          }}
        >
          Full Name *
        </Text>
        <TextInput
          value={formData.fullName}
          onChangeText={(text) => onFormChange({ ...formData, fullName: text })}
          placeholder="Enter your full name"
          placeholderTextColor="#9CA3AF"
          style={{
            backgroundColor: "#FFFFFF",
            color: "#166534",
            padding: 14,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#D1E7DD",
            fontFamily: "Inter_400Regular",
            fontSize: 15,
          }}
        />
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Inter_600SemiBold",
            color: "#374151",
            marginBottom: 8,
          }}
        >
          Email Address *
        </Text>
        <TextInput
          value={formData.email}
          onChangeText={(text) => onFormChange({ ...formData, email: text })}
          placeholder="your.email@example.com"
          placeholderTextColor="#9CA3AF"
          keyboardType="email-address"
          autoCapitalize="none"
          style={{
            backgroundColor: "#FFFFFF",
            color: "#166534",
            padding: 14,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#D1E7DD",
            fontFamily: "Inter_400Regular",
            fontSize: 15,
          }}
        />
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Inter_600SemiBold",
            color: "#374151",
            marginBottom: 8,
          }}
        >
          Phone Number *
        </Text>
        <TextInput
          value={formData.phone}
          onChangeText={(text) => onFormChange({ ...formData, phone: text })}
          placeholder="+1234567890"
          placeholderTextColor="#9CA3AF"
          keyboardType="phone-pad"
          style={{
            backgroundColor: "#FFFFFF",
            color: "#166534",
            padding: 14,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#D1E7DD",
            fontFamily: "Inter_400Regular",
            fontSize: 15,
          }}
        />
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Inter_600SemiBold",
            color: "#374151",
            marginBottom: 8,
          }}
        >
          Number of Guests *
        </Text>
        <TextInput
          value={formData.numberOfGuests}
          onChangeText={(text) =>
            onFormChange({ ...formData, numberOfGuests: text })
          }
          placeholder="1"
          placeholderTextColor="#9CA3AF"
          keyboardType="number-pad"
          style={{
            backgroundColor: "#FFFFFF",
            color: "#166534",
            padding: 14,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#D1E7DD",
            fontFamily: "Inter_400Regular",
            fontSize: 15,
          }}
        />
      </View>

      {bookingType === "artist" && (
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_600SemiBold",
              color: "#374151",
              marginBottom: 8,
            }}
          >
            What kind of artist are you? *
          </Text>
          <TextInput
            value={formData.artistType}
            onChangeText={(text) =>
              onFormChange({ ...formData, artistType: text })
            }
            placeholder="e.g., Painter, Sculptor, Photographer..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            style={{
              backgroundColor: "#FFFFFF",
              color: "#166534",
              padding: 14,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#D1E7DD",
              fontFamily: "Inter_400Regular",
              fontSize: 15,
              minHeight: 80,
            }}
          />
        </View>
      )}

      <TouchableOpacity
        onPress={onSubmit}
        disabled={submitting}
        style={{
          backgroundColor: submitting ? "#9CA3AF" : "#22C55E",
          borderRadius: 16,
          padding: 18,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 8,
          shadowColor: "#22C55E",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        {submitting ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <CreditCard size={20} color="#FFFFFF" />
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 16,
                fontFamily: "Inter_700Bold",
                marginLeft: 12,
              }}
            >
              Proceed to Payment • ${calculateTotalPrice()}
            </Text>
          </>
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
        You'll be redirected to Stripe for secure payment. Supports cards, Apple
        Pay, and Google Pay.
      </Text>
    </View>
  );
}
