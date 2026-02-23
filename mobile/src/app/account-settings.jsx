import { View, Text, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/utils/auth/store";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import useUser from "@/utils/auth/useUser";
import useUpload from "@/utils/useUpload";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import { useProfileImage } from "@/utils/profile/useProfileImage";
import { useProfileSave } from "@/utils/profile/useProfileSave";
import { usePasswordChange } from "@/utils/profile/usePasswordChange";
import { useEmailVerification } from "@/utils/profile/useEmailVerification";
import { ProfileHeader } from "@/components/Profile/ProfileHeader";
import { ProfilePicture } from "@/components/Profile/ProfilePicture";
import { ProfileNameField } from "@/components/Profile/ProfileNameField";
import { ProfileEmailField } from "@/components/Profile/ProfileEmailField";
import { SecurityStatus } from "@/components/Profile/SecurityStatus";
import { ChangePasswordSection } from "@/components/Profile/ChangePasswordSection";
import {
  LoadingBanner,
  AuthRequiredBanner,
} from "@/components/Profile/InfoBanner";

export default function AccountSettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: user, loading: userLoading, refetch } = useUser();
  const [upload, { loading: uploading }] = useUpload();

  const [profileImage, setProfileImage] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileImage(user.image);
    }
  }, [user]);

  const { showImageOptions } = useProfileImage(
    upload,
    setProfileImage,
    setHasChanges,
  );

  const { setAuth } = useAuthStore();

  // Auto-save profile image when it changes
  useEffect(() => {
    const saveProfileImage = async () => {
      if (hasChanges && profileImage !== user?.image) {
        try {
          const { data, error } = await supabase.auth.updateUser({
            data: { avatar_url: profileImage },
          });

          if (!error && data?.user) {
            const current = useAuthStore.getState().auth;
            setAuth({ ...(current || {}), user: data.user });
            setHasChanges(false);
            await refetch();
          }
        } catch (error) {
          console.error("Failed to save profile image:", error);
        }
      }
    };

    saveProfileImage();
  }, [profileImage, hasChanges, user?.image, refetch]);

  const {
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
  } = useProfileSave(user, refetch);

  const {
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    passwordLoading,
    handlePasswordChange,
  } = usePasswordChange();

  const { verificationLoading, handleResendVerification } =
    useEmailVerification(refetch);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  if (userLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F0F9F4" }}>
        <StatusBar style="dark" />
        <LoadingBanner />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F0F9F4" }}>
        <StatusBar style="dark" />
        <AuthRequiredBanner />
      </View>
    );
  }

  return (
    <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
      <View style={{ flex: 1, backgroundColor: "#F0F9F4" }}>
        <StatusBar style="dark" />

        <ProfileHeader onBack={() => router.back()} insets={insets} />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 40,
            paddingHorizontal: 20,
            paddingTop: 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          <ProfilePicture
            profileImage={profileImage}
            uploading={uploading}
            onPress={showImageOptions}
          />

          {/* Account Information - Name & Email */}
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
              Account Information
            </Text>

            <ProfileNameField
              name={name}
              nameEditing={nameEditing}
              nameSaving={nameSaving}
              userName={user.name}
              onNameChange={setName}
              onEdit={() => setNameEditing(true)}
              onSave={handleNameSave}
              onCancel={cancelNameEdit}
            />

            <ProfileEmailField
              email={email}
              emailEditing={emailEditing}
              emailSaving={emailSaving}
              userEmail={user.email}
              emailVerified={user.email_verified}
              verificationLoading={verificationLoading}
              onEmailChange={setEmail}
              onEdit={() => setEmailEditing(true)}
              onSave={handleEmailSave}
              onCancel={cancelEmailEdit}
              onVerify={handleResendVerification}
            />
          </View>

          <SecurityStatus
            emailVerified={user.email_verified}
            verificationLoading={verificationLoading}
            onVerify={handleResendVerification}
          />

          <ChangePasswordSection
            currentPassword={currentPassword}
            newPassword={newPassword}
            confirmPassword={confirmPassword}
            passwordLoading={passwordLoading}
            onCurrentPasswordChange={setCurrentPassword}
            onNewPasswordChange={setNewPassword}
            onConfirmPasswordChange={setConfirmPassword}
            onSubmit={handlePasswordChange}
          />
        </ScrollView>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}
