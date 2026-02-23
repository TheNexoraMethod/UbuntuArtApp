import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/utils/auth/store";

export function useProfileSave(user, onSuccess) {
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [nameEditing, setNameEditing] = useState(false);
  const [nameSaving, setNameSaving] = useState(false);

  const [email, setEmail] = useState("");
  const [emailEditing, setEmailEditing] = useState(false);
  const [emailSaving, setEmailSaving] = useState(false);

  const { setAuth } = useAuthStore();

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  /** Main save  updates name and/or avatar URL in Supabase user_metadata. */
  const saveProfile = async (
    nameValue,
    profileImage,
    hasChanges,
    setHasChanges,
  ) => {
    if (!hasChanges) {
      Alert.alert("No Changes", "No changes to save");
      return;
    }
    if (!nameValue?.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          name: nameValue.trim(),
          ...(profileImage && { avatar_url: profileImage }),
        },
      });
      if (error) throw error;
      if (data?.user) {
        const current = useAuthStore.getState().auth;
        setAuth({ ...(current || {}), user: data.user });
      }
      Alert.alert("Success", "Profile updated successfully!");
      setHasChanges(false);
      if (onSuccess) await onSuccess();
    } catch (error) {
      console.error("Profile update error:", error);
      Alert.alert("Error", error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  /** Inline name save. */
  const handleNameSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }
    setNameSaving(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { name: name.trim() },
      });
      if (error) throw error;
      if (data?.user) {
        const current = useAuthStore.getState().auth;
        setAuth({ ...(current || {}), user: data.user });
      }
      Alert.alert("Success", "Name updated successfully!");
      setNameEditing(false);
      if (onSuccess) await onSuccess();
    } catch (error) {
      console.error("Name update error:", error);
      Alert.alert("Error", error.message || "Failed to update name");
    } finally {
      setNameSaving(false);
    }
  };

  /** Email change  Supabase sends confirmation to new address. */
  const handleEmailSave = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Email cannot be empty");
      return;
    }
    setEmailSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: email.trim() });
      if (error) throw error;
      Alert.alert(
        "Verification Required",
        "A confirmation email has been sent to your new address. Please verify to complete the change.",
        [{ text: "OK", onPress: () => setEmailEditing(false) }],
      );
      if (onSuccess) await onSuccess();
    } catch (error) {
      console.error("Email update error:", error);
      Alert.alert("Error", error.message || "Failed to update email");
    } finally {
      setEmailSaving(false);
    }
  };

  const cancelNameEdit = () => {
    setName(user?.name || "");
    setNameEditing(false);
  };

  const cancelEmailEdit = () => {
    setEmail(user?.email || "");
    setEmailEditing(false);
  };

  return {
    saving,
    saveProfile,
    name,
    setName,
    nameEditing,
    setNameEditing,
    nameSaving,
    handleNameSave,
    cancelNameEdit,
    email,
    setEmail,
    emailEditing,
    setEmailEditing,
    emailSaving,
    handleEmailSave,
    cancelEmailEdit,
  };
}
