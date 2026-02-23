import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Calendar,
  MapPin,
  Users,
  Star,
  ArrowLeft,
  CreditCard,
  CheckCircle,
} from "lucide-react-native";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { useAuth } from "@/utils/auth/useAuth";
import { useState, useEffect } from "react";
import { fetchRoomsWithImages } from "@/lib/supabaseRest";

export default function BookingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { auth, signIn } = useAuth();

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [residency, setResidency] = useState(null);
  const [loadingRoom, setLoadingRoom] = useState(true);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // Fetch room details via Supabase REST
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const rooms = await fetchRoomsWithImages();
        const room = rooms.find((r) => String(r.id) === String(id));
        if (room) setResidency(room);
      } catch (error) {
        console.error("Error fetching room:", error);
      } finally {
        setLoadingRoom(false);
      }
    };
    fetchRoom();
  }, [id]);

  if (!fontsLoaded || loadingRoom) {
    return null;
  }

  if (!residency) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#111827",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <StatusBar style="light" />
        <Text style={{ color: "#FFFFFF", fontSize: 16 }}>Room not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 20 }}
        >
          <Text style={{ color: "#3B82F6", fontSize: 14 }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const totalPrice =
    calculateDays() * (residency.pricing_config?.price_per_night || 100);

  const handleBooking = async () => {
    if (!auth) {
      signIn();
      return;
    }

    if (!startDate || !endDate) {
      Alert.alert(
        "Please select dates",
        "Please choose your start and end dates",
      );
      return;
    }

    setLoading(true);

    try {
      // Create booking
      const bookingResponse = await apiRequest("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          residency_id: residency.id,
          start_date: startDate,
          end_date: endDate,
          total_price: totalPrice,
        }),
      });

      if (!bookingResponse.ok) {
        throw new Error("Booking failed");
      }

      const booking = await bookingResponse.json();

      // Redirect to payment
      router.push(
        `/(tabs)/pay?booking_id=${booking.booking.id}&amount=${totalPrice}`,
      );
    } catch (error) {
      console.error("Booking error:", error);
      Alert.alert("Booking Failed", "Please try again later");
    } finally {
      setLoading(false);
    }
  };

  // Quick date options
  const quickDates = [
    { label: "Today", days: 1 },
    { label: "3 Days", days: 3 },
    { label: "1 Week", days: 7 },
    { label: "2 Weeks", days: 14 },
  ];

  const setQuickDate = (days) => {
    const today = new Date();
    const end = new Date();
    end.setDate(today.getDate() + days - 1);

    setStartDate(today.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  };

  // Get image URL from Firebase Storage
  const imageUrl =
    residency.image_url || (residency.imageUrls && residency.imageUrls[0]);

  return (
    <View style={{ flex: 1, backgroundColor: "#111827" }}>
      <StatusBar style="light" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={{
            paddingTop: insets.top + 20,
            paddingHorizontal: 20,
            paddingBottom: 20,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#1F2937",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 16,
            }}
          >
            <ArrowLeft size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 20,
              fontFamily: "Inter_600SemiBold",
              color: "#FFFFFF",
            }}
          >
            Book Residency
          </Text>
        </View>

        {/* Residency Info */}
        <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
          <View
            style={{
              backgroundColor: "#1F2937",
              borderRadius: 16,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: "#374151",
            }}
          >
            {imageUrl && (
              <Image
                source={{ uri: imageUrl }}
                style={{
                  width: "100%",
                  height: 150,
                }}
                contentFit="cover"
                transition={200}
              />
            )}

            <View style={{ padding: 20 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Inter_600SemiBold",
                  color: "#FFFFFF",
                  marginBottom: 8,
                }}
              >
                {residency.title}
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 16,
                  marginBottom: 12,
                }}
              >
                {residency.location && (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <MapPin size={14} color="#9CA3AF" />
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: "Inter_400Regular",
                        color: "#9CA3AF",
                        marginLeft: 4,
                      }}
                    >
                      {residency.location}
                    </Text>
                  </View>
                )}

                {residency.maxGuests && (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Users size={14} color="#9CA3AF" />
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: "Inter_400Regular",
                        color: "#9CA3AF",
                        marginLeft: 4,
                      }}
                    >
                      Up to {residency.maxGuests}
                    </Text>
                  </View>
                )}

                {residency.rating && (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Star size={14} color="#F59E0B" />
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: "Inter_400Regular",
                        color: "#F59E0B",
                        marginLeft: 4,
                      }}
                    >
                      {residency.rating}
                    </Text>
                  </View>
                )}
              </View>

              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_400Regular",
                  color: "#9CA3AF",
                  lineHeight: 20,
                }}
              >
                {residency.description}
              </Text>
            </View>
          </View>
        </View>

        {/* Date Selection */}
        <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
          <Text
            style={{
              fontSize: 18,
              fontFamily: "Inter_600SemiBold",
              color: "#FFFFFF",
              marginBottom: 16,
            }}
          >
            Select Dates
          </Text>

          {/* Quick Date Options */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            {quickDates.map((option) => (
              <TouchableOpacity
                key={option.label}
                onPress={() => setQuickDate(option.days)}
                style={{
                  backgroundColor: "#1F2937",
                  borderWidth: 1,
                  borderColor: "#374151",
                  borderRadius: 8,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  flex: 1,
                  marginHorizontal: 2,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Inter_600SemiBold",
                    color: "#FFFFFF",
                  }}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Date Inputs */}
          <View style={{ gap: 12 }}>
            <View>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_500Medium",
                  color: "#9CA3AF",
                  marginBottom: 8,
                }}
              >
                Start Date
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: "#1F2937",
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: startDate ? "#3B82F6" : "#374151",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Calendar size={20} color="#9CA3AF" />
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Inter_400Regular",
                    color: startDate ? "#FFFFFF" : "#6B7280",
                    marginLeft: 12,
                  }}
                >
                  {startDate || "Select start date"}
                </Text>
              </TouchableOpacity>
            </View>

            <View>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_500Medium",
                  color: "#9CA3AF",
                  marginBottom: 8,
                }}
              >
                End Date
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: "#1F2937",
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: endDate ? "#3B82F6" : "#374151",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Calendar size={20} color="#9CA3AF" />
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Inter_400Regular",
                    color: endDate ? "#FFFFFF" : "#6B7280",
                    marginLeft: 12,
                  }}
                >
                  {endDate || "Select end date"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Booking Summary */}
        {startDate && endDate && (
          <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
            <View
              style={{
                backgroundColor: "#1F2937",
                borderRadius: 16,
                padding: 20,
                borderWidth: 1,
                borderColor: "#374151",
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Inter_600SemiBold",
                  color: "#F59E0B",
                  marginBottom: 16,
                }}
              >
                Booking Summary
              </Text>

              <View style={{ gap: 12 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Inter_400Regular",
                      color: "#D1D5DB",
                    }}
                  >
                    Duration
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Inter_600SemiBold",
                      color: "#FFFFFF",
                    }}
                  >
                    {calculateDays()} {calculateDays() === 1 ? "day" : "days"}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Inter_400Regular",
                      color: "#D1D5DB",
                    }}
                  >
                    Rate per day
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Inter_600SemiBold",
                      color: "#FFFFFF",
                    }}
                  >
                    ${residency.pricing_config?.price_per_night || 100}
                  </Text>
                </View>

                <View
                  style={{
                    height: 1,
                    backgroundColor: "#374151",
                    marginVertical: 8,
                  }}
                />

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: "Inter_600SemiBold",
                      color: "#FFFFFF",
                    }}
                  >
                    Total
                  </Text>
                  <Text
                    style={{
                      fontSize: 20,
                      fontFamily: "Inter_600SemiBold",
                      color: "#F59E0B",
                    }}
                  >
                    ${totalPrice}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Book Button */}
        <View style={{ paddingHorizontal: 20 }}>
          <TouchableOpacity
            onPress={handleBooking}
            disabled={loading || !startDate || !endDate}
            style={{
              backgroundColor:
                loading || !startDate || !endDate ? "#374151" : "#3B82F6",
              borderRadius: 12,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {loading ? (
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 16,
                  fontFamily: "Inter_600SemiBold",
                }}
              >
                Processing...
              </Text>
            ) : (
              <>
                <CreditCard size={20} color="#FFFFFF" />
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 16,
                    fontFamily: "Inter_600SemiBold",
                    marginLeft: 8,
                  }}
                >
                  Book & Pay ${totalPrice}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
