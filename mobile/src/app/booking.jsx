import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Linking,
  ActivityIndicator,
} from "react-native";
import ScreenBackground from "../components/ScreenBackground.jsx";
import { RoomCard } from "../components/Booking/RoomCard.jsx";
import { supabase } from "../lib/supabase";
import { fetchRoomsWithImages } from "../lib/supabaseRest";
import { useLocalSearchParams } from "expo-router";
import { useRouter } from "expo-router";

export default function BookingScreen() {
  const router = useRouter();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    dates: "",
    room: "",
    guestCount: 1,
  });
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef(null);
  const { roomId } = useLocalSearchParams();

  useEffect(() => {
    async function loadRooms() {
      setLoading(true);
      try {
        const data = await fetchRoomsWithImages();
        setRooms(data);
      } catch (error) {
        Alert.alert("Error loading rooms", error.message);
      } finally {
        setLoading(false);
      }
    }
    loadRooms();
  }, []);

  // Preselect room if roomId param is present
  useEffect(() => {
    if (!loading && rooms.length && roomId) {
      const found = rooms.find((r) => String(r.id) === String(roomId));
      if (found) {
        setSelectedRoom(found);
        setForm((f) => ({ ...f, room: found.name }));
        // Optionally scroll to form
        setTimeout(() => {
          if (formRef.current && formRef.current.measure) {
            formRef.current.measure((fx, fy, width, height, px, py) => {
              if (typeof window !== "undefined" && window.scrollTo) {
                window.scrollTo({ top: py, behavior: "smooth" });
              }
            });
          }
        }, 300);
      }
    }
  }, [loading, rooms, roomId]);

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    setForm((f) => ({ ...f, room: room.name }));
    // Optionally scroll to form
    setTimeout(() => {
      if (formRef.current && formRef.current.measure) {
        formRef.current.measure((fx, fy, width, height, px, py) => {
          if (typeof window !== "undefined" && window.scrollTo) {
            window.scrollTo({ top: py, behavior: "smooth" });
          }
        });
      }
    }, 300);
  };

  const handleFormChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  function getRoomPrice(room) {
    if (!room) return 0;
    if (room.name === "Bantu room") return 170;
    if (room.name === "Muntu room") return 150;
    if (room.name === "Ubuntu room") return 160;
    return room.price_per_night || 100;
  }

  function getTotalPrice() {
    const basePrice = getRoomPrice(selectedRoom);
    const guestCount = parseInt(form.guestCount) || 1;
    const extraGuests = Math.max(guestCount - 1, 0);
    const extraFee = extraGuests * 20;
    return basePrice + extraFee;
  }

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.room) {
      Alert.alert("Please fill in your name, email, and select a room.");
      return;
    }
    setSubmitting(true);
    try {
      // Get current user
      const { data: authData, error: authError } =
        await supabase.auth.getUser();
      let userId = null;
      if (authData?.user) {
        userId = authData.user.id;
      }
      // Insert booking into bookings table
      const { error: bookingError } = await supabase.from("bookings").insert({
        user_id: userId,
        name: form.name,
        email: form.email,
        preferred_dates: form.dates,
        room: form.room,
        guest_count: parseInt(form.guestCount) || 1,
        price_per_night: getRoomPrice(selectedRoom),
        total_price: getTotalPrice(),
        status: "pending",
      });
      if (bookingError) {
        Alert.alert("Error submitting booking", bookingError.message);
        setSubmitting(false);
        return;
      }
      // Optionally send email
      const body = `Name: ${form.name}\nEmail: ${form.email}\nPreferred dates: ${form.dates}\nRoom: ${form.room}`;
      Linking.openURL(
        `mailto:info@ubuntuartvillage.com?subject=Room booking enquiry&body=${encodeURIComponent(body)}`,
      );
      Alert.alert("Booking submitted!", "Your booking enquiry has been sent.");
    } catch (err) {
      Alert.alert("Error submitting booking", err.message);
    }
    setSubmitting(false);
  };

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>Book your stay</Text>
          <Text style={styles.headerSubtitle}>
            Choose a room and send us your enquiry. We'll get back to you soon!
          </Text>
        </View>

        <View style={{ marginBottom: 32 }}>
          {loading ? (
            <ActivityIndicator
              size="large"
              color="#22C55E"
              style={{ marginTop: 32 }}
            />
          ) : (
            rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={{
                  ...room,
                  image_url: room.primary_image_url,
                  pricing_config: { price_per_night: room.price_per_night },
                }}
                isSelected={selectedRoom && selectedRoom.id === room.id}
                onSelect={handleSelectRoom}
                onBook={() => handleSelectRoom(room)}
                onViewDetails={() => router.push(`/room/${room.id}`)}
              />
            ))
          )}
        </View>

        <View style={styles.formCard} ref={formRef}>
          <Text style={styles.formTitle}>Booking enquiry</Text>
          {selectedRoom && (
            <View style={{ marginBottom: 10 }}>
              <Text
                style={{
                  fontSize: 16,
                  color: "#166534",
                  fontFamily: "Inter_600SemiBold",
                }}
              >
                Booking: {selectedRoom.name}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: "#F59E0B",
                  fontFamily: "Inter_700Bold",
                }}
              >
                {`$${getRoomPrice(selectedRoom)} / night`}
              </Text>
              <Text style={{ fontSize: 13, color: "#374151", marginTop: 2 }}>
                Extra guest: $20 per night after the first guest.
              </Text>
              <Text style={{ fontSize: 13, color: "#374151", marginTop: 2 }}>
                Check-in: 15:00 · Check-out: 12:00
              </Text>
            </View>
          )}
          <TextInput
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor="#9CA3AF"
            value={form.name}
            onChangeText={(t) => handleFormChange("name", t)}
          />
          <TextInput
            style={styles.input}
            placeholder="Your email"
            placeholderTextColor="#9CA3AF"
            value={form.email}
            onChangeText={(t) => handleFormChange("email", t)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Preferred dates (e.g. 12-15 March)"
            placeholderTextColor="#9CA3AF"
            value={form.dates}
            onChangeText={(t) => handleFormChange("dates", t)}
          />
          <TextInput
            style={styles.input}
            placeholder="Number of guests"
            placeholderTextColor="#9CA3AF"
            value={String(form.guestCount)}
            onChangeText={(t) =>
              handleFormChange("guestCount", t.replace(/[^0-9]/g, ""))
            }
            keyboardType="number-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Room"
            placeholderTextColor="#9CA3AF"
            value={form.room}
            editable={false}
          />
          <View style={{ marginTop: 8, marginBottom: 8 }}>
            <Text
              style={{
                fontSize: 15,
                color: "#166534",
                fontFamily: "Inter_600SemiBold",
              }}
            >
              Total per night: ${getTotalPrice()}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.button,
              submitting && { backgroundColor: "#9CA3AF" },
            ]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Text style={styles.buttonText}>Send enquiry</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#D1E7DD",
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#166534",
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "#374151",
    fontFamily: "Inter_400Regular",
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#D1E7DD",
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 32,
  },
  formTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#166534",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#F8FAFC",
    color: "#166534",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1E7DD",
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    marginBottom: 14,
  },
  button: {
    backgroundColor: "#22C55E",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
});
