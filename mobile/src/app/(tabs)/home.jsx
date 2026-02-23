// apps/mobile/src/app/(tabs)/home.jsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Bed, Calendar, Image as ImageIcon, Users } from "lucide-react-native";
import ScreenBackground from "../../components/ScreenBackground.jsx";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTag}>Ubuntu Art Village</Text>
          <Text style={styles.heroTitle}>Stay, create, and connect.</Text>
          <Text style={styles.heroSubtitle}>
            Artist residencies, family‑friendly stays, and community events in
            one creative space.
          </Text>

          <TouchableOpacity
            style={styles.heroButton}
            onPress={() => router.push("/(tabs)/rooms")}
          >
            <Text style={styles.heroButtonText}>Book a stay</Text>
          </TouchableOpacity>
        </View>

        {/* Auth buttons */}
        <View style={styles.authRow}>
          <TouchableOpacity
            style={styles.authButtonPrimary}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.authButtonTextPrimary}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.authButtonSecondary}
            onPress={() => router.push("/create-account")}
          >
            <Text style={styles.authButtonTextSecondary}>Create account</Text>
          </TouchableOpacity>
        </View>

        {/* Quick actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get started</Text>

          <View style={styles.grid}>
            <HomeCard
              icon={<Bed color="#166534" size={22} />}
              title="View rooms"
              text="Browse rooms and studios for your stay."
              onPress={() => router.push("/(tabs)/rooms")}
            />
            <HomeCard
              icon={<Users color="#166534" size={22} />}
              title="Residency"
              text="Learn about the artist residency and apply."
              onPress={() => router.push("/(tabs)/residency")}
            />
            <HomeCard
              icon={<Calendar color="#166534" size={22} />}
              title="Events"
              text="See upcoming events and open studios."
              onPress={() => router.push("/(tabs)/events")}
            />
            <HomeCard
              icon={<ImageIcon color="#166534" size={22} />}
              title="Gallery"
              text="Explore work from resident artists."
              onPress={() => router.push("/(tabs)/gallery")}
            />
            <HomeCard
              icon={<Bed color="#166534" size={22} />}
              title="Booking"
              text="See rooms and send a booking enquiry."
              onPress={() => router.push("/booking")}
            />
          </View>
        </View>

        {/* Info strip */}
        <View style={styles.infoStrip}>
          <Text style={styles.infoText}>
            Need help with a booking? Contact us from the Contact tab.
          </Text>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

function HomeCard({ icon, title, text, onPress }) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.cardIcon}>{icon}</View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardText}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  hero: {
    backgroundColor: "#166534",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  heroTag: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  heroButton: {
    alignSelf: "flex-start",
    backgroundColor: "#facc15",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  heroButtonText: {
    color: "#14532d",
    fontSize: 14,
    fontWeight: "700",
  },
  authRow: {
    marginTop: 12,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    columnGap: 12,
  },
  authButtonPrimary: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(15,118,110,0.95)",
  },
  authButtonTextPrimary: {
    color: "#F9FAFB",
    fontSize: 13,
    fontWeight: "700",
  },
  authButtonSecondary: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(209,213,219,0.8)",
    backgroundColor: "rgba(31,41,55,0.4)",
  },
  authButtonTextSecondary: {
    color: "#E5E7EB",
    fontSize: 13,
    fontWeight: "600",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#111827",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardIcon: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
    color: "#111827",
  },
  cardText: {
    fontSize: 12,
    color: "#4b5563",
    lineHeight: 18,
  },
  infoStrip: {
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#e5f3ea",
  },
  infoText: {
    fontSize: 12,
    color: "#14532d",
  },
});
