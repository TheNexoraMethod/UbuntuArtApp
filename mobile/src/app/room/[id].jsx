import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import ScreenBackground from "../../components/ScreenBackground.jsx";
import { useLocalSearchParams, useRouter } from "expo-router";
import { fetchRoomsWithImages } from "../../lib/supabaseRest";

export default function RoomDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [room, setRoom] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRoomAndImages() {
      setLoading(true);
      setError(null);
      try {
        const rooms = await fetchRoomsWithImages();
        const roomData = rooms.find((r) => String(r.id) === String(id));
        if (!roomData) {
          setError("Room not found.");
          setLoading(false);
          return;
        }
        setRoom(roomData);
        const sorted = [...(roomData.images || [])].sort((a, b) => {
          if (a.is_primary && !b.is_primary) return -1;
          if (!a.is_primary && b.is_primary) return 1;
          return (a.display_order ?? 0) - (b.display_order ?? 0);
        });
        setImages(sorted);
      } catch (err) {
        setError(err.message || "Failed to load room.");
      } finally {
        setLoading(false);
      }
    }
    fetchRoomAndImages();
  }, [id]);

  if (loading) {
    return (
      <ScreenBackground>
        <View style={styles.centeredCard}>
          <ActivityIndicator size="large" color="#22C55E" />
          <Text style={{ marginTop: 16, color: "#166534", fontSize: 16 }}>
            Loading room…
          </Text>
        </View>
      </ScreenBackground>
    );
  }

  if (error || !room) {
    return (
      <ScreenBackground>
        <View style={styles.centeredCard}>
          <Text style={{ color: "#B91C1C", fontSize: 18, marginBottom: 12 }}>
            {error || "Room not found."}
          </Text>
          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </ScreenBackground>
    );
  }

  function getRoomPrice(room) {
    if (room.name === "Bantu room") return 170;
    if (room.name === "Muntu room") return 150;
    if (room.name === "Ubuntu room") return 160;
    return room.price_per_night || 100;
  }

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>{room.name}</Text>
          <Text style={styles.price}>
            {`$${getRoomPrice(room)} / night · Max ${room.max_guests} guests`}
          </Text>
          <Text style={styles.shortDesc}>{room.description}</Text>
          <Text style={{ fontSize: 14, color: "#374151", marginTop: 8 }}>
            Check-in: 15:00 · Check-out: 12:00
          </Text>
          <Text style={{ fontSize: 14, color: "#374151", marginTop: 2 }}>
            Extra guest: $20 per night after the first guest.
          </Text>
        </View>

        {images.length > 0 ? (
          <ScrollView
            horizontal
            style={styles.imageScroll}
            showsHorizontalScrollIndicator={false}
          >
            {images.map((img) => {
              const imageUrl = img.image_url;
              if (!imageUrl) return null;
              return (
                <Image
                  key={img.id}
                  source={{ uri: imageUrl }}
                  style={styles.image}
                  resizeMode="cover"
                />
              );
            })}
          </ScrollView>
        ) : (
          <View style={styles.card}>
            <Text
              style={{ fontSize: 14, color: "#6B7280", textAlign: "center" }}
            >
              No images available for this room yet.
            </Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Details</Text>
          <Text style={styles.longDesc}>
            {room.long_description || room.description}
          </Text>
          {room.amenities && room.amenities.length > 0 ? (
            <View style={{ marginTop: 12 }}>
              {room.amenities.map((a, i) => (
                <Text key={i} style={styles.amenity}>
                  • {a}
                </Text>
              ))}
            </View>
          ) : (
            <Text style={styles.amenityPlaceholder}>
              Ask us about amenities and workspace setup for this room.
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            router.push({ pathname: "/booking", params: { roomId: room.id } })
          }
        >
          <Text style={styles.buttonText}>Enquire about this room</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#D1E7DD",
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: "#166534",
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    color: "#F59E0B",
    fontFamily: "Inter_700Bold",
    marginBottom: 8,
  },
  shortDesc: {
    fontSize: 15,
    color: "#374151",
    fontFamily: "Inter_400Regular",
  },
  imageScroll: {
    marginBottom: 24,
    marginLeft: -10,
    paddingLeft: 10,
  },
  image: {
    width: 260,
    height: 180,
    borderRadius: 16,
    marginRight: 16,
    borderWidth: 1,
    borderColor: "#D1E7DD",
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#166534",
    marginBottom: 10,
  },
  longDesc: {
    fontSize: 15,
    color: "#374151",
    fontFamily: "Inter_400Regular",
    marginBottom: 8,
  },
  amenity: {
    fontSize: 14,
    color: "#166534",
    fontFamily: "Inter_500Medium",
    marginBottom: 4,
  },
  amenityPlaceholder: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "Inter_400Regular",
    marginTop: 12,
  },
  button: {
    backgroundColor: "#22C55E",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 32,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  centeredCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 32,
    margin: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    shadowColor: "#B91C1C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
});
