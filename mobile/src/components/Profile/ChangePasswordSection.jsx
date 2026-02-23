import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { PasswordInput } from "./PasswordInput";

export function ChangePasswordSection({
  currentPassword,
  newPassword,
  confirmPassword,
  passwordLoading,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
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
        }}
      >
        Change Password
      </Text>

      <PasswordInput
        label="Current Password"
        value={currentPassword}
        onChangeText={onCurrentPasswordChange}
        placeholder="Enter current password"
      />

      <PasswordInput
        label="New Password"
        value={newPassword}
        onChangeText={onNewPasswordChange}
        placeholder="Enter new password"
      />

      <View style={{ marginBottom: 20 }}>
        <PasswordInput
          label="Confirm New Password"
          value={confirmPassword}
          onChangeText={onConfirmPasswordChange}
          placeholder="Confirm new password"
        />
      </View>

      <TouchableOpacity
        onPress={onSubmit}
        disabled={passwordLoading}
        style={{
          backgroundColor: "#F59E0B",
          borderRadius: 8,
          paddingVertical: 12,
          alignItems: "center",
          opacity: passwordLoading ? 0.7 : 1,
        }}
      >
        {passwordLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 14,
              fontFamily: "Inter_600SemiBold",
            }}
          >
            Change Password
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
