// apps/mobile/src/app/(tabs)/rooms.jsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import ScreenBackground from "../../components/ScreenBackground.jsx";
import { RoomCard } from "../../components/Booking/RoomCard.jsx";
import { fetchRoomsWithImages } from "../../lib/supabaseRest";
import { useRouter } from "expo-router";

export default function RoomsScreen() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadRooms() {
      setLoading(true);
      try {
        const data = await fetchRoomsWithImages();
        setRooms(data);
      } catch (error) {
        console.error("ROOMS ERROR:", error);
        Alert.alert(
          "Error loading rooms",
          error.message || JSON.stringify(error),
        );
      } finally {
        setLoading(false);
      }
    }
    loadRooms();
  }, []);

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Rooms</Text>
        <Text style={styles.body}>
          Explore our rooms and studios for short and long stays.
        </Text>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#22C55E"
            style={{ marginTop: 32 }}
          />
        ) : (
          rooms.map((room) => {
            console.log("ROOM IN LIST:", room?.title, room?.primary_image_url);
            if (!room) {
              console.warn("Skipping undefined room in list");
              return null;
            }
            return (
              <RoomCard
                key={room.id}
                room={room}
                isSelected={false}
                onBook={() =>
                  router.push({
                    pathname: "/booking",
                    params: { roomId: room.id },
                  })
                }
                onViewDetails={() => router.push(`/room/${room.id}`)}
              />
            );
          })
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
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
    marginBottom: 18,
  },
});
