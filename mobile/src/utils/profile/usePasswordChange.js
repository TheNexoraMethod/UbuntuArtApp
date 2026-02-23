import { useState } from "react";
import { Alert } from "react-native";
import { supabase } from "@/lib/supabase";

export function usePasswordChange() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const toggleShowPassword = () => setShowPasswords((v) => !v);

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters");
      return;
    }

    setPasswordLoading(true);

    try {
      // Step 1: verify current password by re-authenticating
      const { data: sessionData } = await supabase.auth.getSession();
      const email = sessionData?.session?.user?.email;

      if (!email) throw new Error("Not signed in");

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });

      if (signInError) throw new Error("Current password is incorrect");

      // Step 2: update to the new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      Alert.alert("Success", "Password changed successfully!", [
        {
          text: "OK",
          onPress: () => {
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
          },
        },
      ]);
    } catch (error) {
      console.error("Password change error:", error);
      Alert.alert("Error", error.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  return {
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    passwordLoading,
    showPasswords,
    handlePasswordChange,
    toggleShowPassword,
  };
}
