import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { supabase } from "../../../lib/supabase";

export default function ResidencyDetailScreen() {
  const { id } = useLocalSearchParams();
  const [residency, setResidency] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResidency() {
      setLoading(true);
      const { data, error } = await supabase
        .from("artist_residencies")
        .select("*")
        .eq("id", id)
        .single();
      setResidency(data);
      setLoading(false);
    }
    fetchResidency();
  }, [id]);

  if (loading || !residency) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Residency Application</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Title/Type:</Text>
        <Text style={styles.value}>{residency.title || residency.type}</Text>
        <Text style={styles.label}>Proposed dates:</Text>
        <Text style={styles.value}>{residency.proposed_dates}</Text>
        <Text style={styles.label}>Status:</Text>
        <Text style={styles.value}>{residency.status}</Text>
        {residency.biography && (
          <>
            <Text style={styles.label}>Biography:</Text>
            <Text style={styles.value}>{residency.biography}</Text>
          </>
        )}
        {residency.artist_statement && (
          <>
            <Text style={styles.label}>Artist statement:</Text>
            <Text style={styles.value}>{residency.artist_statement}</Text>
          </>
        )}
        {residency.project_description && (
          <>
            <Text style={styles.label}>Project description:</Text>
            <Text style={styles.value}>{residency.project_description}</Text>
          </>
        )}
        {residency.portfolio_links && (
          <>
            <Text style={styles.label}>Portfolio links:</Text>
            <Text style={styles.value}>{residency.portfolio_links}</Text>
          </>
        )}
        {/* Add more fields as needed */}
      </View>
    </ScrollView>
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
