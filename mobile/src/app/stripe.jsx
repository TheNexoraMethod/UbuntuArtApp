import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { Platform, View, Text } from "react-native";
import { WebView } from "react-native-webview";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useSubscription from "../utils/useSubscription";

export default function Stripe() {
  const { checkoutUrl } = useLocalSearchParams();
  const router = useRouter();
  const { refetchSubscription } = useSubscription();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (Platform.OS === "web") {
      if (checkoutUrl) {
        const popup = window.open(checkoutUrl, "_blank", "popup");
        const checkClosed = setInterval(() => {
          try {
            if (
              popup.closed ||
              popup.location.href.includes(process.env.EXPO_PUBLIC_BASE_URL)
            ) {
              clearInterval(checkClosed);
              popup.close();
              refetchSubscription().finally(() => router.back());
            }
          } catch (e) {}
        }, 1000);
      } else {
        router.back();
      }
    }
  }, [checkoutUrl, router]);

  const handleWebViewClose = () => {
    refetchSubscription().finally(() => router.back());
  };

  const handleShouldStartLoadWithRequest = (request) => {
    if (request.url.startsWith(process.env.EXPO_PUBLIC_BASE_URL)) {
      handleWebViewClose();
      return false;
    }
    return true;
  };

  if (Platform.OS === "web") {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#111827",
          paddingTop: insets.top,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <StatusBar style="light" />
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 18,
            fontWeight: "600",
          }}
        >
          Processing payment...
        </Text>
      </View>
    );
  }

  if (!checkoutUrl) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#111827",
          paddingTop: insets.top,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <StatusBar style="light" />
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 18,
            fontWeight: "600",
          }}
        >
          No checkout URL provided
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#111827" }}>
      <StatusBar style="light" />
      <WebView
        source={{ uri: checkoutUrl }}
        style={{ flex: 1, marginTop: insets.top }}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        startInLoadingState={true}
        renderLoading={() => (
          <View
            style={{
              flex: 1,
              backgroundColor: "#111827",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 18,
                fontWeight: "600",
              }}
            >
              Loading payment...
            </Text>
          </View>
        )}
      />
    </View>
  );
}
