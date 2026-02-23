import { useRouter } from "expo-router";
import React from "react";
import { Alert } from "react-native";
import { create } from "zustand";
import { apiPost } from "./api";

const useSubscriptionStore = create((set, get) => ({
  status: null,
  tier: null,
  loading: true,
  setStatus: (status) => set({ status }),
  setTier: (tier) => set({ tier }),
  setLoading: (loading) => set({ loading }),
  checkSubscription: async () => {
    if (get().loading === false) {
      return;
    }

    try {
      const response = await apiPost("/api/get-subscription-status");

      if (!response.ok) {
        throw new Error("Failed to check subscription status");
      }

      const data = await response.json();
      const isActive = data.status === "active";

      set({
        status: isActive,
        tier: data.tier || "Artist",
        loading: false,
      });
    } catch (error) {
      console.error("Error checking subscription:", error);
      set({ loading: false });
    }
  },
  refetchSubscription: async () => {
    set({ loading: true });

    try {
      const response = await apiPost("/api/get-subscription-status");

      if (!response.ok) {
        throw new Error("Failed to check subscription status");
      }

      const data = await response.json();
      const isActive = data.status === "active";

      set({
        status: isActive,
        tier: data.tier || "Artist",
        loading: false,
      });
    } catch (error) {
      console.error("Error refetching subscription:", error);
      set({ loading: false });
    }
  },
}));

export function useSubscription() {
  const { status, tier, loading, checkSubscription, refetchSubscription } =
    useSubscriptionStore();
  const router = useRouter();

  const initiateSubscription = React.useCallback(
    async (membershipTier = "Artist") => {
      try {
        const response = await apiPost("/api/stripe-checkout-link", {
          tier: membershipTier,
          // Use web URL for Stripe - it requires valid HTTPS URLs
          redirectURL:
            process.env.EXPO_PUBLIC_PROXY_BASE_URL ||
            "https://utu-app-for-ubuntu-art-vill-227.created.app",
          subscriptionMode: true,
        });

        if (!response.ok) {
          throw new Error("Failed to get checkout link");
        }

        const { url } = await response.json();
        if (url) {
          router.push({
            pathname: "/stripe",
            params: { checkoutUrl: url },
          });
        }
      } catch (error) {
        console.error("Error:", error);
        Alert.alert(
          "Error",
          "Could not start the subscription process. Please try again.",
          [{ text: "OK" }],
        );
      }
    },
    [router],
  );

  React.useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  return {
    isSubscribed: status,
    membershipTier: tier,
    data: status,
    loading,
    initiateSubscription,
    refetchSubscription,
  };
}

export default useSubscription;
