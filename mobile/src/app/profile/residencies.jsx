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

export default function UserResidenciesScreen() {
  const [residencies, setResidencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchResidencies() {
      setLoading(true);
      const { data: authData, error: authError } =
        await supabase.auth.getUser();
      if (authError || !authData?.user) {
        router.replace("/login");
        return;
      }
      const userId = authData.user.id;
      const { data, error } = await supabase
        .from("artist_residencies")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) {
        setResidencies([]);
        setLoading(false);
        return;
      }
      setResidencies(data || []);
      setLoading(false);
    }
    fetchResidencies();
  }, []);

  function ResidencyRow({ residency }) {
    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => router.push(`/profile/residencies/${residency.id}`)}
      >
        <Text style={styles.title}>
          {residency.title || residency.type || "Residency"}
        </Text>
        <Text style={styles.dates}>{residency.proposed_dates}</Text>
        <Text style={styles.status}>{residency.status}</Text>
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
      <Text style={styles.heading}>My Residencies</Text>
      <TouchableOpacity
        style={styles.applyBtn}
        onPress={() => router.push("/residency/apply")}
      >
        <Text style={styles.applyText}>Apply for residency</Text>
      </TouchableOpacity>
      {residencies.length > 0 ? (
        residencies.map((r) => <ResidencyRow key={r.id} residency={r} />)
      ) : (
        <Text style={styles.empty}>No residency applications found.</Text>
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
  row: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#D1E7DD",
  },
  title: { fontSize: 16, color: "#166534", fontWeight: "600" },
  dates: { fontSize: 15, color: "#374151" },
  status: { fontSize: 14, color: "#F59E0B" },
  empty: { fontSize: 15, color: "#9CA3AF", marginTop: 24 },
  applyBtn: {
    backgroundColor: "#22C55E",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    alignItems: "center",
  },
  applyText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
});
