// apps/mobile/src/app/(tabs)/contact.jsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import ScreenBackground from "../../components/ScreenBackground.jsx";

export default function ContactScreen() {
  return (
    <ScreenBackground>
      <View style={styles.root}>
        <Text style={styles.title}>Contact</Text>
        <Text style={styles.body}>
          Reach out about bookings, residencies, or collaborations.
        </Text>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    color: "#E5E7EB",
    lineHeight: 20,
  },
});
