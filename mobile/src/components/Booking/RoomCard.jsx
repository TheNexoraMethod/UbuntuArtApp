import { View, Text, TouchableOpacity, Image } from "react-native";
import { CheckCircle2 } from "lucide-react-native";

function getRoomPrice(room) {
  // Static override for Bantu, Muntu, Ubuntu
  if (room.name === "Bantu room") return 170;
  if (room.name === "Muntu room") return 150;
  if (room.name === "Ubuntu room") return 160;
  return room.pricing_config?.price_per_night || room.price_per_night || 100;
}

export function RoomCard({
  room,
  isSelected,
  onSelect,
  onBook,
  onViewDetails,
}) {
  if (!room) {
    console.warn("RoomCard received no room");
    return null;
  }

  const url = room?.primary_image_url;

  const safeUrl =
    typeof url === "string" && url.startsWith("http") && url.length > 0
      ? url
      : null;

  return (
    <TouchableOpacity
      onPress={() => {
        if (onBook) onBook(room);
        if (onSelect) onSelect(room);
      }}
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: isSelected ? "#22C55E" : "#D1E7DD",
        overflow: "hidden",
        shadowColor: "#22C55E",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      {safeUrl ? (
        <Image
          source={{ uri: safeUrl }}
          style={{
            width: "100%",
            height: 200,
            borderRadius: 12,
          }}
          resizeMode="cover"
          onError={(e) => {
            console.warn("Image load error", safeUrl, e.nativeEvent);
          }}
        />
      ) : (
        <View
          style={{
            width: "100%",
            height: 200,
            borderRadius: 12,
            backgroundColor: "#eee",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text>No image</Text>
        </View>
      )}

      <View style={{ padding: 16 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontFamily: "Inter_700Bold",
              color: "#166534",
              flex: 1,
            }}
          >
            {room.title || room.name}
          </Text>
          {isSelected && <CheckCircle2 size={24} color="#22C55E" />}
        </View>

        <Text
          style={{
            fontSize: 14,
            fontFamily: "Inter_400Regular",
            color: "#6B7280",
            marginTop: 8,
            marginBottom: 12,
          }}
        >
          {room.description}
        </Text>

        {room.amenities && room.amenities.length > 0 && (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              marginBottom: 12,
            }}
          >
            {room.amenities.slice(0, 4).map((amenity, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: "#F0FDF4",
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#BBF7D0",
                  marginRight: 8,
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontFamily: "Inter_500Medium",
                    color: "#166534",
                  }}
                >
                  {amenity}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View
          style={{
            backgroundColor: "#FEF3C7",
            borderRadius: 8,
            padding: 12,
            borderWidth: 1,
            borderColor: "#FDE68A",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontFamily: "Inter_700Bold",
              color: "#F59E0B",
            }}
          >
            {`$${getRoomPrice(room)} / night`}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {onBook && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation && e.stopPropagation();
                  onBook(room);
                }}
                style={{
                  backgroundColor: "#22C55E",
                  borderRadius: 8,
                  paddingVertical: 6,
                  paddingHorizontal: 16,
                  marginLeft: 12,
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 15,
                  }}
                >
                  Book
                </Text>
              </TouchableOpacity>
            )}
            {onViewDetails && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation && e.stopPropagation();
                  onViewDetails(room);
                }}
                style={{
                  marginLeft: 8,
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                }}
              >
                <Text
                  style={{
                    color: "#166534",
                    fontFamily: "Inter_500Medium",
                    fontSize: 14,
                    textDecorationLine: "underline",
                  }}
                >
                  View details
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
