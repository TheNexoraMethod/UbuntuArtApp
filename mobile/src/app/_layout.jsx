import { useAuth } from "@/utils/auth/useAuth";
import { useAuthModal } from "@/utils/auth/store";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Modal, View, TouchableOpacity, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { X } from "lucide-react-native";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  const { initiate, isReady } = useAuth();
  const { isOpen, close, mode } = useAuthModal();

  useEffect(() => {
    initiate();
  }, [initiate]);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  // Fallback: hide splash screen after 3 seconds even if auth isn't ready
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log("Splash screen timeout - hiding anyway");
      SplashScreen.hideAsync();
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  // Don't block rendering - always render the app
  // if (!isReady) {
  //   return null;
  // }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack
            screenOptions={{ headerShown: false }}
            initialRouteName="(tabs)"
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="residency" options={{ title: "Residency" }} />
          </Stack>

          {/* Auth Modal */}
          <Modal
            visible={isOpen}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={close}
          >
            <View style={{ flex: 1, backgroundColor: "#111827" }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: 20,
                  paddingTop: 60,
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    color: "#FFFFFF",
                  }}
                >
                  {mode === "signin" ? "Sign In" : "Sign Up"}
                </Text>
                <TouchableOpacity
                  onPress={close}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: "#1F2937",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <X size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Leave the body empty for now – no AuthWebView */}
            </View>
          </Modal>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
