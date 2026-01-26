import * as React from "react";
import { useSession } from "@auth/create/react";

const useUser = () => {
  const { data: session, status } = useSession();
  const id = session?.user?.id;

  const [user, setUser] = React.useState(session?.user ?? null);
  const [loading, setLoading] = React.useState(true);

  const fetchUser = React.useCallback(async () => {
    if (!id) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
          return data.user;
        }
      }
      // Fallback to session user if API fails
      setUser(session?.user ?? null);
      return session?.user ?? null;
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(session?.user ?? null);
      return session?.user ?? null;
    } finally {
      setLoading(false);
    }
  }, [id, session?.user]);

  React.useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    user,
    data: user,
    loading: status === "loading" || loading,
    refetch: fetchUser,
  };
};

export { useUser };

export default useUser;
