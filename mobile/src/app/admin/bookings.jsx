import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../../lib/supabase";

export default function AdminBookingsScreen() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBookings() {
      setLoading(true);
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });
      setBookings(data || []);
      setLoading(false);
    }
    fetchBookings();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Bookings</Text>
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#22C55E"
          style={{ marginTop: 32 }}
        />
      ) : bookings.length === 0 ? (
        <Text style={styles.empty}>No bookings found.</Text>
      ) : (
        bookings.map((b) => (
          <View key={b.id} style={styles.card}>
            <Text style={styles.title}>{b.guest_name}</Text>
            <Text style={styles.body}>Room: {b.room}</Text>
            <Text style={styles.body}>Dates: {b.dates}</Text>
            <Text style={styles.body}>Guests: {b.guest_count}</Text>
            <Text style={styles.body}>Total: ${b.total_price}</Text>
            <Text style={styles.body}>
              Extra guest fee: ${b.extra_guest_fee}
            </Text>
            <Text style={styles.body}>Status: {b.status}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#166534",
    marginBottom: 18,
  },
  empty: { fontSize: 16, color: "#6B7280", marginTop: 32 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#D1E7DD",
  },
  title: { fontSize: 18, fontWeight: "700", color: "#166534", marginBottom: 4 },
  body: { fontSize: 15, color: "#374151", marginBottom: 2 },
});
