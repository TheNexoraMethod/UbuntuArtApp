import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { CheckCircle2, Home, Calendar, Mail } from "lucide-react-native";
import {
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

export default function BookingSuccessScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleGoHome = () => {
    router.push("/(tabs)/home");
  };

  const handleViewBookings = () => {
    router.push("/profile");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F0F9F4" }}>
      <StatusBar style="dark" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 40,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: 20,
          justifyContent: "center",
          alignItems: "center",
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Icon */}
        <View
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: "#22C55E",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
            shadowColor: "#22C55E",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <CheckCircle2 size={64} color="#FFFFFF" />
        </View>

        {/* Success Message */}
        <Text
          style={{
            fontSize: 32,
            fontFamily: "Inter_700Bold",
            color: "#166534",
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          Booking Confirmed!
        </Text>

        <Text
          style={{
            fontSize: 16,
            fontFamily: "Inter_400Regular",
            color: "#6B7280",
            textAlign: "center",
            lineHeight: 24,
            marginBottom: 40,
          }}
        >
          Your payment was successful and your booking has been confirmed.
          You'll receive a confirmation email shortly with all the details.
        </Text>

        {/* Info Cards */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            padding: 24,
            borderWidth: 1,
            borderColor: "#D1E7DD",
            width: "100%",
            marginBottom: 24,
            shadowColor: "#22C55E",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: "#22C55E",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 16,
              }}
            >
              <Mail size={24} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_700Bold",
                  color: "#166534",
                  marginBottom: 4,
                }}
              >
                Check Your Email
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Inter_400Regular",
                  color: "#6B7280",
                  lineHeight: 18,
                }}
              >
                We've sent a detailed confirmation with your booking
                information, room details, and arrival instructions.
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: "#F59E0B",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 16,
              }}
            >
              <Calendar size={24} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_700Bold",
                  color: "#166534",
                  marginBottom: 4,
                }}
              >
                Booking Reference
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Inter_400Regular",
                  color: "#6B7280",
                  lineHeight: 18,
                }}
              >
                Save your booking confirmation email. You'll need it for
                check-in and any future correspondence.
              </Text>
            </View>
          </View>
        </View>

        {/* What's Next */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            padding: 24,
            borderWidth: 1,
            borderColor: "#D1E7DD",
            width: "100%",
            marginBottom: 32,
            shadowColor: "#22C55E",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontFamily: "Inter_700Bold",
              color: "#166534",
              marginBottom: 16,
            }}
          >
            What's Next?
          </Text>

          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: "row" }}>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_600SemiBold",
                  color: "#22C55E",
                  width: 24,
                }}
              >
                1.
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_400Regular",
                  color: "#374151",
                  flex: 1,
                  lineHeight: 20,
                }}
              >
                Check your email for the confirmation and booking details
              </Text>
            </View>

            <View style={{ flexDirection: "row" }}>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_600SemiBold",
                  color: "#22C55E",
                  width: 24,
                }}
              >
                2.
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_400Regular",
                  color: "#374151",
                  flex: 1,
                  lineHeight: 20,
                }}
              >
                Review arrival instructions and check-in time (usually 2 PM)
              </Text>
            </View>

            <View style={{ flexDirection: "row" }}>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_600SemiBold",
                  color: "#22C55E",
                  width: 24,
                }}
              >
                3.
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_400Regular",
                  color: "#374151",
                  flex: 1,
                  lineHeight: 20,
                }}
              >
                Contact us if you have any questions or special requests
              </Text>
            </View>

            <View style={{ flexDirection: "row" }}>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_600SemiBold",
                  color: "#22C55E",
                  width: 24,
                }}
              >
                4.
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_400Regular",
                  color: "#374151",
                  flex: 1,
                  lineHeight: 20,
                }}
              >
                Get ready for an inspiring creative experience at Ubuntu Art
                Village!
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          onPress={handleGoHome}
          style={{
            backgroundColor: "#22C55E",
            borderRadius: 16,
            padding: 18,
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
            shadowColor: "#22C55E",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Home size={20} color="#FFFFFF" />
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 16,
              fontFamily: "Inter_700Bold",
              marginLeft: 12,
            }}
          >
            Return to Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleViewBookings}
          style={{
            backgroundColor: "transparent",
            borderRadius: 16,
            padding: 18,
            width: "100%",
            borderWidth: 2,
            borderColor: "#D1E7DD",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Calendar size={20} color="#6B7280" />
          <Text
            style={{
              color: "#6B7280",
              fontSize: 16,
              fontFamily: "Inter_600SemiBold",
              marginLeft: 12,
            }}
          >
            View My Bookings
          </Text>
        </TouchableOpacity>

        {/* Support Info */}
        <View
          style={{
            marginTop: 32,
            padding: 20,
            backgroundColor: "#F0FDF4",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#BBF7D0",
            width: "100%",
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_600SemiBold",
              color: "#166534",
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            Need Help?
          </Text>
          <Text
            style={{
              fontSize: 13,
              fontFamily: "Inter_400Regular",
              color: "#6B7280",
              textAlign: "center",
              lineHeight: 18,
            }}
          >
            Contact us at Info@ubuntuartvillage.com{"\n"}
            or use the Contact tab in the app
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
