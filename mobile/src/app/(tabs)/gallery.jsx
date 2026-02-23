// apps/mobile/src/app/(tabs)/gallery.jsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Modal,
  Dimensions,
} from "react-native";
import ScreenBackground from "../../components/ScreenBackground.jsx";
import { fetchGalleryImages } from "../../lib/gallery.js";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function GalleryScreen() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    async function loadImages() {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchGalleryImages();
        setImages(result);
      } catch (e) {
        setError(e.message || "Failed to load gallery images.");
      } finally {
        setLoading(false);
      }
    }

    loadImages();
  }, []);

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.root}>
        <Text style={styles.title}>Gallery</Text>
        <Text style={styles.subtitle}>
          A glimpse into work created at Ubuntu Art Village and by the wider
          community.
        </Text>

        {loading && (
          <View style={styles.centerRow}>
            <ActivityIndicator color="#F9FAFB" />
            <Text style={styles.loadingText}>Loading gallery…</Text>
          </View>
        )}

        {error && !loading && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>Gallery error: {error}</Text>
          </View>
        )}

        {!loading && !error && images.length === 0 && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>
              No images have been added yet. Once artworks are uploaded to the
              gallery bucket, they will appear here.
            </Text>
          </View>
        )}

        <View style={styles.grid}>
          {images.map((img) => {
            if (!img.url) return null;
            return (
              <TouchableOpacity
                key={img.id || img.name}
                style={styles.tile}
                onPress={() => setSelectedImage(img)}
                activeOpacity={0.7}
              >
                <Image
                  source={{ uri: img.url }}
                  style={styles.image}
                  resizeMode="cover"
                />
                <Text style={styles.tileLabel}>{img.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <Modal
        visible={!!selectedImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedImage(null)}
        >
          <View style={styles.modalContent}>
            {selectedImage && (
              <>
                <Image
                  source={{ uri: selectedImage.url }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
                <View style={styles.modalCaption}>
                  <Text style={styles.modalTitle}>{selectedImage.name}</Text>
                  {selectedImage.description && (
                    <Text style={styles.modalDescription}>
                      {selectedImage.description}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSelectedImage(null)}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
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
  centerRow: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 8,
    marginBottom: 16,
  },
  loadingText: {
    color: "#E5E7EB",
    fontSize: 13,
  },
  errorBox: {
    backgroundColor: "rgba(31,41,55,0.95)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#E5E7EB",
    fontSize: 13,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  tile: {
    width: "48%",
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 14,
    padding: 8,
    marginBottom: 10,
  },
  image: {
    width: "100%",
    height: 90,
    borderRadius: 10,
    marginBottom: 6,
    backgroundColor: "#E5E7EB",
  },
  tileLabel: {
    fontSize: 11,
    color: "#4B5563",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  modalImage: {
    width: SCREEN_WIDTH * 0.95,
    height: SCREEN_HEIGHT * 0.7,
  },
  modalCaption: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 16,
    borderRadius: 12,
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  modalDescription: {
    color: "#E5E7EB",
    fontSize: 14,
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 24,
    color: "#000",
    fontWeight: "600",
  },
});
