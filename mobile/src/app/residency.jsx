import { View, Text, ScrollView, StyleSheet } from "react-native";

export default function ResidencyScreen() {
  return (
    <View style={styles.root}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Artist Residency</Text>
        <Text style={styles.sub}>
          One-month residencies for African artists and the diaspora in Bwejuu,
          Zanzibar.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>What's included</Text>
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
          <Text style={styles.cardTitle}>Who it's for</Text>
          <Text style={styles.body}>
            Emerging, independent, and established artists working across visual
            media who want deep focus time in a supportive environment.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>How to apply</Text>
          <Text style={styles.body}>
            Applications open at selected times of the year. You'll be asked to
            share a portfolio, statement, and preferred dates.
          </Text>
          <Text style={styles.footer}>
            Application form and status will appear here once the residency flow
            is re‑enabled.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F0F9F4" },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#166534",
    marginBottom: 8,
  },
  sub: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 20,
    lineHeight: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#D1E7DD",
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
});
