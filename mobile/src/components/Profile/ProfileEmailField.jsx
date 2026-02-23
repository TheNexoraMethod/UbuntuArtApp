import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Mail, Edit, CheckCircle } from "lucide-react-native";

export function ProfileEmailField({
  email,
  emailEditing,
  emailSaving,
  userEmail,
  emailVerified,
  verificationLoading,
  onEmailChange,
  onEdit,
  onSave,
  onCancel,
  onVerify,
}) {
  return (
    <View>
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
          Email
        </Text>
        {!emailEditing && (
          <TouchableOpacity onPress={onEdit}>
            <Edit size={16} color="#F59E0B" />
          </TouchableOpacity>
        )}
      </View>
      {emailEditing ? (
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
            <Mail size={16} color="#6B7280" />
            <TextInput
              value={email}
              onChangeText={onEmailChange}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
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
              disabled={emailSaving}
              style={{
                flex: 1,
                backgroundColor: "#22C55E",
                borderRadius: 8,
                paddingVertical: 10,
                alignItems: "center",
              }}
            >
              {emailSaving ? (
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
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_500Medium",
              color: "#374151",
            }}
          >
            {userEmail || "Not set"}
          </Text>
          {emailVerified ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#D1FAE5",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
              }}
            >
              <CheckCircle size={12} color="#059669" />
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: "Inter_500Medium",
                  color: "#059669",
                  marginLeft: 4,
                }}
              >
                Verified
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={onVerify}
              disabled={verificationLoading}
              style={{
                backgroundColor: "#FEF3C7",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: "Inter_500Medium",
                  color: "#D97706",
                }}
              >
                {verificationLoading ? "Sending..." : "Verify"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}
