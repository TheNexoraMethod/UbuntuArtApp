// apps/mobile/src/app/(tabs)/events.jsx
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import ScreenBackground from "../../components/ScreenBackground.jsx";

const events = [
  {
    title: "Open Studio Sunday",
    date: "Every Sunday",
    time: "3:00pm – 6:00pm",
    type: "Community",
    description:
      "Walk through the studios, meet resident artists, and see works‑in‑progress.",
  },
  {
    title: "Full Moon Beach Circle",
    date: "Monthly",
    time: "7:00pm – late",
    type: "Gathering",
    description:
      "An intimate sharing circle with music, movement, and readings on the beach.",
  },
  {
    title: "Residency Showcase",
    date: "End of each residency",
    time: "5:00pm – 8:00pm",
    type: "Exhibition",
    description:
      "Closing night exhibition where artists share what they created in Bwejuu.",
  },
];

export default function EventsScreen() {
  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.root}>
        <Text style={styles.title}>Events at Ubuntu</Text>
        <Text style={styles.subtitle}>
          Gatherings, open studios, and showcases that connect artists, locals,
          and visitors.
        </Text>

        {events.map((event, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>{event.title}</Text>
              <Text style={styles.badge}>{event.type}</Text>
            </View>
            <Text style={styles.meta}>
              {event.date} • {event.time}
            </Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>
        ))}

        <View style={styles.noteBox}>
          <Text style={styles.noteTitle}>Hosting something?</Text>
          <Text style={styles.noteText}>
            We can host intimate gatherings, workshops, and small retreats.
            Reach out via the Contact tab to plan an event.
          </Text>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    padding: 20,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#E5E7EB",
    marginBottom: 16,
    lineHeight: 20,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(209,231,221,0.9)",
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
    marginRight: 8,
  },
  badge: {
    fontSize: 11,
    fontWeight: "600",
    color: "#166534",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  meta: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: "#374151",
    lineHeight: 18,
  },
  noteBox: {
    marginTop: 12,
    backgroundColor: "rgba(22,101,52,0.9)",
    borderRadius: 14,
    padding: 14,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FEF9C3",
    marginBottom: 4,
  },
  noteText: {
    fontSize: 13,
    color: "#ECFDF5",
    lineHeight: 18,
  },
});
