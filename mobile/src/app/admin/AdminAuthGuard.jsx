import { useEffect, useState } from "react";
import { useRouter, usePathname } from "expo-router";
import { supabase } from "../../lib/supabase";
import { View, ActivityIndicator, Text } from "react-native";

export default function AdminAuthGuard({ children }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function checkAuth() {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.getUser();
        if (error || !data?.user) {
          // Prevent redirect loop - don't redirect if already on login page
          if (!pathname?.includes("/login")) {
            router.replace("/login");
          }
          return;
        }
        // Optionally check for admin role here
        setUser(data.user);
        setLoading(false);
      } catch (err) {
        console.error("Auth check error:", err);
        setLoading(false);
      }
    }
    checkAuth();
  }, [pathname]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#22C55E" />
        <Text style={{ marginTop: 16 }}>Checking admin access…</Text>
      </View>
    );
  }

  if (!user) {
    return null;
  }

  return children;
}
