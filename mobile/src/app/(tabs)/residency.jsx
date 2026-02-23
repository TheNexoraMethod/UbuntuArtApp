// apps/mobile/src/app/residency.jsx
import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import ScreenBackground from "../../components/ScreenBackground.jsx";

const APPLY_EMAIL = "info@ubuntuartvillage.com";
const APPLY_SUBJECT = "Artist Residency";

export default function ResidencyScreen() {
  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Artist Residency</Text>
        <Text style={styles.sub}>
          One‑month residencies for African artists and the diaspora in Bwejuu,
          Zanzibar.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>What’s included</Text>
          <Text style={styles.body}>
            • Private room or studio accommodation
          </Text>
          <Text style={styles.body}>
            • Access to art studios and communal spaces
          </Text>
          <Text style={styles.body}>
            • Weekly community events and critiques
          </Text>
          <Text style={styles.body}>
            • Support with local networks and logistics
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Who it’s for</Text>
          <Text style={styles.body}>
            Emerging, independent, and established artists working across visual
            media who want deep focus time in a supportive environment.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>How to apply</Text>
          <Text style={styles.body}>
            Send us an email with your portfolio, a short artist statement, and
            your preferred dates.
          </Text>
          <TouchableOpacity
            onPress={() =>
              Linking.openURL(
                `mailto:${APPLY_EMAIL}?subject=${encodeURIComponent(APPLY_SUBJECT)}`,
              )
            }
            activeOpacity={0.7}
            style={styles.applyBtn}
          >
            <Text style={styles.applyBtnText}>✉️ Email us to apply</Text>
          </TouchableOpacity>
          <Text style={styles.footer}>
            Email {APPLY_EMAIL} with “Artist Residency” in the subject line.
          </Text>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 8,
  },
  sub: {
    fontSize: 14,
    color: "#E5E7EB",
    marginBottom: 20,
    lineHeight: 20,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(209,231,221,0.8)",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#166534",
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    marginBottom: 4,
  },
  footer: {
    marginTop: 8,
    fontSize: 12,
    color: "#6B7280",
  },
  applyBtn: {
    backgroundColor: "#166534",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  applyBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
});
