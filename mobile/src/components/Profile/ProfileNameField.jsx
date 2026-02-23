import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { User, Edit } from "lucide-react-native";

export function ProfileNameField({
  name,
  nameEditing,
  nameSaving,
  userName,
  onNameChange,
  onEdit,
  onSave,
  onCancel,
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <Text
          style={{
            fontSize: 12,
            fontFamily: "Inter_500Medium",
            color: "#374151",
          }}
        >
          Name
        </Text>
        {!nameEditing && (
          <TouchableOpacity onPress={onEdit}>
            <Edit size={16} color="#F59E0B" />
          </TouchableOpacity>
        )}
      </View>
      {nameEditing ? (
        <View>
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#D1D5DB",
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 12,
              marginBottom: 8,
            }}
          >
            <User size={16} color="#6B7280" />
            <TextInput
              value={name}
              onChangeText={onNameChange}
              placeholder="Enter your name"
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingLeft: 8,
                fontSize: 14,
                fontFamily: "Inter_400Regular",
                color: "#374151",
              }}
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              onPress={onSave}
              disabled={nameSaving}
              style={{
                flex: 1,
                backgroundColor: "#22C55E",
                borderRadius: 8,
                paddingVertical: 10,
                alignItems: "center",
              }}
            >
              {nameSaving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 14,
                    fontFamily: "Inter_600SemiBold",
                  }}
                >
                  Save
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onCancel}
              style={{
                flex: 1,
                backgroundColor: "#F3F4F6",
                borderRadius: 8,
                paddingVertical: 10,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#374151",
                  fontSize: 14,
                  fontFamily: "Inter_600SemiBold",
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Inter_500Medium",
            color: "#374151",
          }}
        >
          {userName || "Not set"}
        </Text>
      )}
    </View>
  );
}
