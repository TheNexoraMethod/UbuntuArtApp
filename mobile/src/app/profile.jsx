import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { LogOut, Settings } from "lucide-react-native";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import useUser from "@/utils/auth/useUser";
import useAuth from "@/utils/auth/useAuth";
import useUpload from "@/utils/useUpload";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import { ProfileHeader } from "@/components/Profile/ProfileHeader";
import { ProfilePicture } from "@/components/Profile/ProfilePicture";
import { ProfileNameField } from "@/components/Profile/ProfileNameField";
import { ProfileEmailField } from "@/components/Profile/ProfileEmailField";
import { MembershipDetails } from "@/components/Profile/MembershipDetails";
import { MakePaymentSection } from "@/components/Profile/MakePaymentSection";
import { SecurityStatus } from "@/components/Profile/SecurityStatus";
import { ChangePasswordSection } from "@/components/Profile/ChangePasswordSection";
import { UnsavedChangesWarning } from "@/components/Profile/UnsavedChangesWarning";
import { useProfileImage } from "@/utils/profile/useProfileImage";
import { usePasswordChange } from "@/utils/profile/usePasswordChange";
import { useEmailVerification } from "@/utils/profile/useEmailVerification";
import { useProfileSave } from "@/utils/profile/useProfileSave";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: user, loading: userLoading, refetch } = useUser();
  const [upload, { loading: uploading }] = useUpload();
  const { signOut } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  const { showImageOptions } = useProfileImage(
    upload,
    setProfileImage,
    setHasChanges,
  );

  const {
    currentPassword,
    newPassword,
    confirmPassword,
    passwordLoading,
    showPasswords,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    handlePasswordChange,
    toggleShowPassword,
  } = usePasswordChange();

  const { verificationLoading, handleResendVerification } =
    useEmailVerification(refetch);

  const { saving, saveProfile } = useProfileSave(user, refetch);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setProfileImage(user.image);
    }
  }, [user]);

  if (!fontsLoaded) {
    return null;
  }

  const handleNameChange = (text) => {
    setName(text);
    setHasChanges(user?.name !== text.trim() || user?.image !== profileImage);
  };

  const handleSave = () => {
    saveProfile(name, profileImage, hasChanges, setHasChanges);
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => {
          signOut();
          router.replace("/(tabs)/home");
        },
      },
    ]);
  };

  if (userLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F0F9F4" }}>
        <StatusBar style="dark" />
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" color="#22C55E" />
          <Text
            style={{
              color: "#166534",
              fontSize: 16,
              fontFamily: "Inter_500Medium",
              marginTop: 12,
            }}
          >
            Loading profile...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
      <View style={{ flex: 1, backgroundColor: "#F0F9F4" }}>
        <StatusBar style="dark" />

        <ProfileHeader
          insets={insets}
          onBack={router.canGoBack() ? () => router.back() : undefined}
          onSave={handleSave}
          saving={saving}
          uploading={uploading}
          hasChanges={hasChanges}
        />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 40,
          }}
          showsVerticalScrollIndicator={false}
        >
          <ProfilePicture
            profileImage={profileImage}
            userName={user?.name}
            uploading={uploading}
            onChangeImage={showImageOptions}
          />

          <View style={{ paddingHorizontal: 20 }}>
            <Text
              style={{
                fontSize: 18,
                fontFamily: "Inter_600SemiBold",
                color: "#166534",
                marginBottom: 20,
              }}
            >
              Profile Information
            </Text>

            <ProfileNameField name={name} onNameChange={handleNameChange} />

            <ProfileEmailField
              email={email}
              emailVerified={user?.email_verified}
              verificationLoading={verificationLoading}
              onVerify={handleResendVerification}
            />

            <MembershipDetails user={user} />

            <Text
              style={{
                fontSize: 18,
                fontFamily: "Inter_600SemiBold",
                color: "#166534",
                marginBottom: 20,
              }}
            >
              Payment Methods
            </Text>

            <MakePaymentSection user={user} />

            <Text
              style={{
                fontSize: 18,
                fontFamily: "Inter_600SemiBold",
                color: "#166534",
                marginBottom: 20,
              }}
            >
              Account Security
            </Text>

            <SecurityStatus
              emailVerified={user?.email_verified}
              verificationLoading={verificationLoading}
              onVerify={handleResendVerification}
            />

            <ChangePasswordSection
              currentPassword={currentPassword}
              newPassword={newPassword}
              confirmPassword={confirmPassword}
              showPasswords={showPasswords}
              passwordLoading={passwordLoading}
              onCurrentPasswordChange={setCurrentPassword}
              onNewPasswordChange={setNewPassword}
              onConfirmPasswordChange={setConfirmPassword}
              onToggleShowPassword={toggleShowPassword}
              onChangePassword={handlePasswordChange}
            />

            <UnsavedChangesWarning hasChanges={hasChanges} />

            {/* Sign Out Button */}
            <TouchableOpacity
              onPress={handleSignOut}
              style={{
                backgroundColor: "#FEE2E2",
                borderRadius: 12,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "#FECACA",
                marginBottom: 20,
              }}
            >
              <LogOut size={20} color="#DC2626" />
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_600SemiBold",
                  color: "#DC2626",
                  marginLeft: 8,
                }}
              >
                Sign Out
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}
