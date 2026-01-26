"use client";

import { useEffect, useState } from "react";
import { useSession } from "@auth/create/react";

export default function VerifiedPage() {
  const { update } = useSession();
  const [status, setStatus] = useState("loading");
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Get query parameters
    const params = new URLSearchParams(window.location.search);
    const isSuccess = params.get("success") === "true";
    const isError = params.get("error") === "true";

    const handleVerification = async () => {
      if (isSuccess) {
        // Refresh the session to get updated user data
        try {
          await update();
          setStatus("success");

          // Start countdown
          const countdownInterval = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(countdownInterval);
                window.location.href = "/account/settings";
                return 0;
              }
              return prev - 1;
            });
          }, 1000);

          return () => clearInterval(countdownInterval);
        } catch (error) {
          console.error("Failed to update session:", error);
          setStatus("error");
        }
      } else if (isError) {
        setStatus("error");
      }
    };

    handleVerification();
  }, [update]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F0F9F4] to-[#D1FAE5] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border-2 border-[#BBF7D0]">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#22C55E] mx-auto mb-4"></div>
          <h1 className="text-2xl font-semibold text-[#166534] mb-2">
            Verifying Your Email
          </h1>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FEF2F2] to-[#FEE2E2] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border-2 border-[#FECACA]">
          <div className="bg-[#EF4444] text-white rounded-full w-20 h-20 flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg">
            ✗
          </div>
          <h1 className="text-2xl font-semibold text-[#991B1B] mb-4">
            Verification Failed
          </h1>
          <p className="text-gray-600 mb-6">
            Something went wrong while verifying your email. The link may have
            expired or already been used.
          </p>
          <button
            onClick={() => (window.location.href = "/account/settings")}
            className="bg-[#EF4444] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#DC2626] transition-colors"
          >
            Go to Account Settings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F9F4] to-[#D1FAE5] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-md w-full text-center border-2 border-[#BBF7D0]">
        <div className="bg-gradient-to-br from-[#22C55E] to-[#16A34A] text-white rounded-full w-20 h-20 flex items-center justify-center text-5xl mx-auto mb-6 shadow-lg">
          ✓
        </div>
        <h1 className="text-3xl font-semibold text-[#166534] mb-4">
          Email Verified! 🎉
        </h1>
        <p className="text-gray-600 mb-2 text-lg">
          Your email address has been successfully verified.
        </p>
        <p className="text-gray-500 mb-8">
          You can now access all features of Ubuntu Art Village, including
          booking rooms and applying for artist residencies.
        </p>

        <div className="bg-[#F0F9F4] rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600">
            Redirecting you to your account in{" "}
            <span className="font-semibold text-[#22C55E]">
              {countdown} seconds
            </span>
            ...
          </p>
        </div>

        <button
          onClick={() => (window.location.href = "/account/settings")}
          className="w-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all hover:-translate-y-0.5"
        >
          Go to Account Now
        </button>

        <p className="text-[#F59E0B] font-semibold mt-6 text-sm">
          Ubuntu Art Village
        </p>
      </div>
    </div>
  );
}
