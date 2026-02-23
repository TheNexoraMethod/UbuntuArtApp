import { useState } from "react";
import { Alert } from "react-native";
import { supabase } from "@/lib/supabase";

export function useEmailVerification(onSuccess) {
  const [verificationLoading, setVerificationLoading] = useState(false);

  const handleResendVerification = async () => {
    setVerificationLoading(true);

    try {
      // Get the current user's email from the live session
      const { data: sessionData } = await supabase.auth.getSession();
      const email = sessionData?.session?.user?.email;

      if (!email) {
        throw new Error("No verified email found. Please sign in again.");
      }

      // Resend the verification email via Supabase
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });

      if (error) throw error;

      Alert.alert(
        "Verification Email Sent",
        "Please check your inbox and click the link to verify your account.",
        [{ text: "OK" }],
      );

      if (onSuccess) await onSuccess();
    } catch (error) {
      console.error("Email verification error:", error);
      Alert.alert(
        "Error Sending Verification Email",
        error.message || "Please try again later.",
      );
    } finally {
      setVerificationLoading(false);
    }
  };

  return {
    verificationLoading,
    handleResendVerification,
  };
}
