// apps/mobile/src/app/(tabs)/about.jsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import ScreenBackground from "../../components/ScreenBackground.jsx";

export default function AboutScreen() {
  return (
    <ScreenBackground>
      <View style={styles.root}>
        <Text style={styles.title}>About</Text>
        <Text style={styles.body}>
          Ubuntu Art Village is a visual art residency in Zanzibar, created by
          artists for artists. Learn about our community and mission.
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
