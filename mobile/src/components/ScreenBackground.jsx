// apps/mobile/src/app/components/ScreenBackground.jsx
import React, { useState } from "react";
import { ImageBackground, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const APP_BACKGROUND =
  "https://hdytclhlliyujfvhmvzz.supabase.co/storage/v1/object/public/branding/appbackground.jpeg";

export default function ScreenBackground({ children }) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    // Fallback: solid dark green background when image fails to load
    return (
      <View style={styles.fallback}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.overlay}>{children}</View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <ImageBackground
      source={{ uri: APP_BACKGROUND }}
      style={styles.background}
      resizeMode="cover"
      onError={() => setImageError(true)}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.overlay}>{children}</View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  fallback: {
    flex: 1,
    backgroundColor: "#111827",
  },
  safeArea: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
});
