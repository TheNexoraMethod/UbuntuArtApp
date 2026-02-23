import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/utils/auth/store";

/**
 * Handles profile picture selection and upload to Supabase Storage.
 *
 * Requires an `avatars` bucket in your Supabase project:
 *   INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
 *   CREATE POLICY "Avatar public read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
 *   CREATE POLICY "Avatar user upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
 *   CREATE POLICY "Avatar user update" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
 */
export function useProfileImage(_upload, setProfileImage, setHasChanges) {
  const { setAuth } = useAuthStore();

  const showImageOptions = () => {
    Alert.alert(
      "Change Profile Picture",
      "Choose an option",
      [
        {
          text: "Take Photo",
          onPress: async () => {
            const permission =
              await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) {
              Alert.alert(
                "Permission Required",
                "Camera permission is needed to take photos",
              );
              return;
            }

            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ["images"],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });

            if (!result.canceled) {
              handleImageUpload(result.assets[0].uri);
            }
          },
        },
        {
          text: "Choose from Library",
          onPress: async () => {
            const permission =
              await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
              Alert.alert(
                "Permission Required",
                "Photo library permission is needed",
              );
              return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ["images"],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });

            if (!result.canceled) {
              handleImageUpload(result.assets[0].uri);
            }
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true },
    );
  };

  const handleImageUpload = async (uri) => {
    try {
      const filename = uri.split("/").pop();
      const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
      const mimeType = `image/${ext === "jpg" ? "jpeg" : ext}`;

      // Get the current user's ID for the storage path
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      if (!userId) throw new Error("Not signed in");

      // Fetch the local image as a blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Upload to Supabase Storage: avatars/{userId}/avatar.{ext}
      const storagePath = `${userId}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(storagePath, blob, {
          contentType: mimeType,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(storagePath);

      // Add a cache-busting query param so the new image loads immediately
      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      // Persist it in user_metadata so it survives sessions
      const { data: updateData, error: updateError } =
        await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });

      if (updateError) throw updateError;

      // Sync into auth store
      if (updateData?.user) {
        const current = useAuthStore.getState().auth;
        setAuth({ ...(current || {}), user: updateData.user });
      }

      setProfileImage(publicUrl);
      setHasChanges(true);

      Alert.alert("Photo updated", "Tap Save to confirm your changes.");
    } catch (error) {
      console.error("Avatar upload error:", error);
      Alert.alert(
        "Upload Failed",
        error.message || "Could not upload image. Please try again.",
      );
    }
  };

  return {
    showImageOptions,
  };
}
