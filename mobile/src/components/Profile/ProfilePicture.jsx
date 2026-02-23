import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { Camera } from "lucide-react-native";

export function ProfilePicture({
  profileImage,
  userName,
  uploading,
  onChangeImage,
}) {
  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      }}
    >
      <Text
        style={{
          fontSize: 16,
          fontFamily: "Inter_600SemiBold",
          color: "#166534",
          marginBottom: 20,
          alignSelf: "flex-start",
        }}
      >
        Profile Picture
      </Text>

      <TouchableOpacity
        onPress={onChangeImage}
        disabled={uploading}
        style={{
          position: "relative",
          marginBottom: 12,
        }}
      >
        <Image
          source={{
            uri:
              profileImage ||
              "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200",
          }}
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            borderWidth: 3,
            borderColor: "#F59E0B",
          }}
          contentFit="cover"
        />
        <View
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            backgroundColor: "#22C55E",
            borderRadius: 20,
            padding: 8,
            borderWidth: 3,
            borderColor: "#FFFFFF",
          }}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Camera size={16} color="#FFFFFF" />
          )}
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onChangeImage}
        disabled={uploading}
        style={{
          backgroundColor: "#F0F9F4",
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 8,
        }}
      >
        <Text
          style={{
            color: "#166534",
            fontSize: 14,
            fontFamily: "Inter_500Medium",
          }}
        >
          {uploading ? "Uploading..." : "Change Photo"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
