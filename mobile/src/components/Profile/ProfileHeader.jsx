import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { ArrowLeft } from "lucide-react-native";

export function ProfileHeader({
  onBack,
  insets,
  onSave,
  saving,
  uploading,
  hasChanges,
}) {
  return (
    <View
      style={{
        paddingTop: insets.top + 10,
        paddingHorizontal: 20,
        paddingBottom: 15,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={{
              padding: 8,
              borderRadius: 8,
              backgroundColor: "#F3F4F6",
            }}
          >
            <ArrowLeft size={20} color="#374151" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}

        <Text
          style={{
            fontSize: 18,
            fontFamily: "Inter_600SemiBold",
            color: "#166534",
          }}
        >
          Account Settings
        </Text>

        <TouchableOpacity
          onPress={onSave}
          disabled={saving || uploading || !hasChanges}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 8,
            backgroundColor:
              hasChanges && !saving && !uploading ? "#22C55E" : "#E5E7EB",
          }}
        >
          {saving || uploading ? (
            <ActivityIndicator size="small" color="#166534" />
          ) : (
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_600SemiBold",
                color:
                  hasChanges && !saving && !uploading ? "#FFFFFF" : "#9CA3AF",
              }}
            >
              Save
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
