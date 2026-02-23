import { View, Text, TouchableOpacity } from "react-native";
import { Shield, CheckCircle, AlertTriangle, Lock } from "lucide-react-native";

export function SecurityStatus({
  emailVerified,
  verificationLoading,
  onVerify,
}) {
  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
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
          marginBottom: 16,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Shield size={18} color="#166534" /> Account Security
      </Text>

      {/* Email Verification Status */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: 12,
          paddingHorizontal: 16,
          backgroundColor: emailVerified ? "#D1FAE5" : "#FEF3C7",
          borderRadius: 8,
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {emailVerified ? (
            <CheckCircle size={20} color="#059669" />
          ) : (
            <AlertTriangle size={20} color="#D97706" />
          )}
          <View style={{ marginLeft: 12 }}>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_500Medium",
                color: emailVerified ? "#059669" : "#D97706",
              }}
            >
              Email Verification
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Inter_400Regular",
                color: emailVerified ? "#047857" : "#B45309",
              }}
            >
              {emailVerified ? "Verified ✓" : "Not verified"}
            </Text>
          </View>
        </View>
        {!emailVerified && (
          <TouchableOpacity
            onPress={onVerify}
            disabled={verificationLoading}
            style={{
              backgroundColor: "#F59E0B",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 6,
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 12,
                fontFamily: "Inter_500Medium",
              }}
            >
              {verificationLoading ? "Sending..." : "Verify"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 2FA Status */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: 12,
          paddingHorizontal: 16,
          backgroundColor: "#F3F4F6",
          borderRadius: 8,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Lock size={20} color="#6B7280" />
          <View style={{ marginLeft: 12 }}>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_500Medium",
                color: "#374151",
              }}
            >
              Two-Factor Authentication
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Inter_400Regular",
                color: "#6B7280",
              }}
            >
              Coming soon
            </Text>
          </View>
        </View>
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: "#9CA3AF",
          }}
        />
      </View>
    </View>
  );
}
