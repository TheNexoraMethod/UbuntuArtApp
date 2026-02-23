import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../../lib/supabase";

export default function AdminResidenciesScreen() {
  const [residencies, setResidencies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResidencies() {
      setLoading(true);
      const { data, error } = await supabase
        .from("residencies")
        .select("*")
        .order("created_at", { ascending: false });
      setResidencies(data || []);
      setLoading(false);
    }
    fetchResidencies();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Residency Applications</Text>
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#22C55E"
          style={{ marginTop: 32 }}
        />
      ) : residencies.length === 0 ? (
        <Text style={styles.empty}>No applications found.</Text>
      ) : (
        residencies.map((r) => (
          <View key={r.id} style={styles.card}>
            <Text style={styles.title}>{r.name}</Text>
            <Text style={styles.body}>Email: {r.email}</Text>
            <Text style={styles.body}>Dates: {r.dates}</Text>
            <Text style={styles.body}>Proposal: {r.proposal}</Text>
            <Text style={styles.body}>Status: {r.status}</Text>
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
