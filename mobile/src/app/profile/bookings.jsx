import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";

export default function UserBookingsScreen() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchBookings() {
      setLoading(true);
      const { data: authData, error: authError } =
        await supabase.auth.getUser();
      if (authError || !authData?.user) {
        router.replace("/login");
        return;
      }
      const userId = authData.user.id;
      const { data, error } = await supabase
        .from("bookings")
        .select("*, room:rooms(name)")
        .eq("user_id", userId)
        .order("check_in", { ascending: false });
      if (error) {
        setBookings([]);
        setLoading(false);
        return;
      }
      setBookings(data || []);
      setLoading(false);
    }
    fetchBookings();
  }, []);

  const now = new Date();
  const upcoming = bookings.filter((b) => new Date(b.check_out) >= now);
  const past = bookings.filter((b) => new Date(b.check_out) < now);

  function getTotalPrice(b) {
    const base =
      b.room?.name === "Bantu room"
        ? 170
        : b.room?.name === "Muntu room"
          ? 150
          : b.room?.name === "Ubuntu room"
            ? 160
            : b.price_per_night || 100;
    const extraGuests = Math.max((b.guest_count || 1) - 1, 0);
    return base + extraGuests * 20;
  }

  function BookingRow({ booking }) {
    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => router.push(`/profile/bookings/${booking.id}`)}
      >
        <Text style={styles.room}>{booking.room?.name || "Room"}</Text>
        <Text style={styles.dates}>
          {booking.check_in} → {booking.check_out}
        </Text>
        <Text style={styles.details}>
          Guests: {booking.guest_count} · Total: ${getTotalPrice(booking)}
        </Text>
        {booking.status && <Text style={styles.status}>{booking.status}</Text>}
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Bookings</Text>
      {upcoming.length > 0 && (
        <Text style={styles.section}>Upcoming bookings</Text>
      )}
      {upcoming.map((b) => (
        <BookingRow key={b.id} booking={b} />
      ))}
      {past.length > 0 && <Text style={styles.section}>Past bookings</Text>}
      {past.map((b) => (
        <BookingRow key={b.id} booking={b} />
      ))}
      {upcoming.length + past.length === 0 && (
        <Text style={styles.empty}>No bookings found.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F0F9F4" },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: "#166534",
    marginBottom: 18,
  },
  section: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginTop: 12,
    marginBottom: 8,
  },
  row: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#D1E7DD",
  },
  room: { fontSize: 16, color: "#166534", fontWeight: "600" },
  dates: { fontSize: 15, color: "#374151" },
  details: { fontSize: 14, color: "#374151" },
  status: { fontSize: 13, color: "#F59E0B", marginTop: 2 },
  empty: { fontSize: 15, color: "#9CA3AF", marginTop: 24 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
});
