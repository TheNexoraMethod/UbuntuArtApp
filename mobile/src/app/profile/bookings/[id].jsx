import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { supabase } from "../../../lib/supabase";

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBooking() {
      setLoading(true);
      const { data, error } = await supabase
        .from("bookings")
        .select("*, room:rooms(name)")
        .eq("id", id)
        .single();
      setBooking(data);
      setLoading(false);
    }
    fetchBooking();
  }, [id]);

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

  if (loading || !booking) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Booking Details</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Room:</Text>
        <Text style={styles.value}>{booking.room?.name}</Text>
        <Text style={styles.label}>Check-in:</Text>
        <Text style={styles.value}>{booking.check_in}</Text>
        <Text style={styles.label}>Check-out:</Text>
        <Text style={styles.value}>{booking.check_out}</Text>
        <Text style={styles.label}>Guests:</Text>
        <Text style={styles.value}>{booking.guest_count}</Text>
        <Text style={styles.label}>Status:</Text>
        <Text style={styles.value}>{booking.status || "pending"}</Text>
        <Text style={styles.label}>Pricing breakdown:</Text>
        <Text style={styles.value}>
          Base rate: ${booking.price_per_night || 100}
        </Text>
        <Text style={styles.value}>
          Extra guest fees: ${Math.max((booking.guest_count || 1) - 1, 0) * 20}
        </Text>
        <Text style={styles.value}>Total: ${getTotalPrice(booking)}</Text>
      </View>
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
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#D1E7DD",
  },
  label: { fontSize: 15, color: "#374151", fontWeight: "600" },
  value: { fontSize: 15, color: "#166534", marginBottom: 8 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
});
