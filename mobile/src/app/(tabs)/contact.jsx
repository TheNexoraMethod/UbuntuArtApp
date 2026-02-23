// apps/mobile/src/app/(tabs)/contact.jsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import { Mail, Instagram } from "lucide-react-native";
import ScreenBackground from "../../components/ScreenBackground.jsx";

const EMAIL = "info@ubuntuartvillage.com";
const INSTAGRAM_URL = "https://www.instagram.com/ubuntu_art_village/";

export default function ContactScreen() {
  return (
    <ScreenBackground>
      <View style={styles.root}>
        <Text style={styles.title}>Contact</Text>
        <Text style={styles.body}>
          Reach out about bookings, residencies, or collaborations.
        </Text>

        <TouchableOpacity
          style={styles.row}
          onPress={() => Linking.openURL(`mailto:${EMAIL}`)}
          activeOpacity={0.7}
        >
          <Mail size={20} color="#22C55E" />
          <Text style={styles.link}>{EMAIL}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.row}
          onPress={() => Linking.openURL(INSTAGRAM_URL)}
          activeOpacity={0.7}
        >
          <Instagram size={20} color="#22C55E" />
          <Text style={styles.link}>@ubuntu_art_village</Text>
        </TouchableOpacity>
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
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    gap: 12,
  },
  link: {
    fontSize: 15,
    fontWeight: "600",
    color: "#22C55E",
    textDecorationLine: "underline",
  },
});
