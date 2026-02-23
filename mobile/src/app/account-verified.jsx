import { View, Text, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { useAuthStore } from "@/utils/auth/store";
import { supabase } from "@/lib/supabase";

export default function AccountVerifiedScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { auth, setAuth } = useAuthStore();
  const [status, setStatus] = useState("loading");
  const [countdown, setCountdown] = useState(3);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const isSuccess = params.success === "true";
  const isError = params.error === "true";

  useEffect(() => {
    const handleVerification = async () => {
      if (isSuccess) {
        // Refresh the user session to get the updated verified status
        try {
          const { data } = await supabase.auth.getUser();
          if (data?.user) {
            const current = useAuthStore.getState().auth;
            setAuth({ ...(current || {}), user: data.user });
          }
        } catch (error) {
          console.error("Error refreshing user session:", error);
        }

        setStatus("success");

        // Start countdown
        const countdownInterval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              router.replace("/profile");
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(countdownInterval);
      } else if (isError) {
        setStatus("error");
      }
    };

    handleVerification();
  }, [isSuccess, isError, setAuth, router]);

  if (!fontsLoaded) {
    return null;
  }

  if (status === "loading") {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#F0F9F4",
          paddingTop: insets.top,
        }}
      >
        <StatusBar style="dark" />
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              padding: 32,
              width: "100%",
              maxWidth: 400,
              alignItems: "center",
              borderWidth: 2,
              borderColor: "#BBF7D0",
              shadowColor: "#22C55E",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <ActivityIndicator size="large" color="#22C55E" />
            <Text
              style={{
                fontSize: 20,
                fontFamily: "Inter_600SemiBold",
                color: "#166534",
                marginTop: 16,
                textAlign: "center",
              }}
            >
              Verifying Your Email
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_400Regular",
                color: "#6B7280",
                marginTop: 8,
                textAlign: "center",
              }}
            >
              Please wait...
            </Text>
          </View>
        </View>
      </View>
    );
  }

  if (status === "error") {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#FEF2F2",
          paddingTop: insets.top,
        }}
      >
        <StatusBar style="dark" />
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              padding: 32,
              width: "100%",
              maxWidth: 400,
              alignItems: "center",
              borderWidth: 2,
              borderColor: "#FECACA",
              shadowColor: "#EF4444",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: "#EF4444",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 24,
                shadowColor: "#EF4444",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <Text style={{ fontSize: 40, color: "#FFFFFF" }}>✗</Text>
            </View>

            <Text
              style={{
                fontSize: 22,
                fontFamily: "Inter_600SemiBold",
                color: "#991B1B",
                marginBottom: 12,
                textAlign: "center",
              }}
            >
              Verification Failed
            </Text>

            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_400Regular",
                color: "#6B7280",
                marginBottom: 24,
                textAlign: "center",
                lineHeight: 20,
              }}
            >
              Something went wrong while verifying your email. The link may have
              expired or already been used.
            </Text>

            <View
              style={{
                width: "100%",
                backgroundColor: "#EF4444",
                paddingVertical: 14,
                paddingHorizontal: 24,
                borderRadius: 10,
                shadowColor: "#EF4444",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
              onTouchEnd={() => router.replace("/profile")}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 16,
                  fontFamily: "Inter_600SemiBold",
                  textAlign: "center",
                }}
              >
                Go to Profile
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#F0F9F4",
        paddingTop: insets.top,
      }}
    >
      <StatusBar style="dark" />
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            padding: 32,
            width: "100%",
            maxWidth: 400,
            alignItems: "center",
            borderWidth: 2,
            borderColor: "#BBF7D0",
            shadowColor: "#22C55E",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: "#22C55E",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 24,
              shadowColor: "#22C55E",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            <Text style={{ fontSize: 48, color: "#FFFFFF" }}>✓</Text>
          </View>

          <Text
            style={{
              fontSize: 24,
              fontFamily: "Inter_600SemiBold",
              color: "#166534",
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            Email Verified! 🎉
          </Text>

          <Text
            style={{
              fontSize: 15,
              fontFamily: "Inter_500Medium",
              color: "#374151",
              marginBottom: 8,
              textAlign: "center",
              lineHeight: 22,
            }}
          >
            Your email address has been successfully verified.
          </Text>

          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_400Regular",
              color: "#6B7280",
              marginBottom: 24,
              textAlign: "center",
              lineHeight: 20,
            }}
          >
            You can now access all features of Ubuntu Art Village, including
            booking rooms and applying for artist residencies.
          </Text>

          <View
            style={{
              backgroundColor: "#F0F9F4",
              borderRadius: 10,
              padding: 16,
              width: "100%",
              marginBottom: 24,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontFamily: "Inter_400Regular",
                color: "#6B7280",
                textAlign: "center",
              }}
            >
              Redirecting you to your profile in{" "}
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  color: "#22C55E",
                }}
              >
                {countdown} seconds
              </Text>
              ...
            </Text>
          </View>

          <View
            style={{
              width: "100%",
              backgroundColor: "#22C55E",
              paddingVertical: 14,
              paddingHorizontal: 24,
              borderRadius: 10,
              shadowColor: "#22C55E",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
            onTouchEnd={() => router.replace("/profile")}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                textAlign: "center",
              }}
            >
              Go to Profile Now
            </Text>
          </View>

          <Text
            style={{
              fontSize: 12,
              fontFamily: "Inter_600SemiBold",
              color: "#F59E0B",
              marginTop: 24,
            }}
          >
            Ubuntu Art Village
          </Text>
        </View>
      </View>
    </View>
  );
}
