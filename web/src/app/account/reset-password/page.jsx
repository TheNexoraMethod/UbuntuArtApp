import { useState, useEffect } from "react";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get token from URL
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError("No reset token provided");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!token) {
      setError("Invalid reset link");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setSuccess(true);

      // Redirect to sign in after 3 seconds
      setTimeout(() => {
        window.location.href = "/account/signin";
      }, 3000);
    } catch (err) {
      console.error("Password reset error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#F0F9F4] p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border-2 border-[#D1E7DD]">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#22C55E] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-[#166534] mb-2">
              Password Reset! 🎉
            </h1>
            <p className="text-[#6B7280]">Your password has been updated</p>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg bg-[#F0FDF4] border-2 border-[#BBF7D0] p-4">
              <p className="text-[#166534] font-semibold mb-2">✅ Success</p>
              <p className="text-[#374151] text-sm">
                Your password has been successfully reset. Redirecting to sign
                in...
              </p>
            </div>

            <a
              href="/account/signin"
              className="block w-full text-center rounded-lg bg-[#22C55E] px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-[#16A34A] focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:ring-offset-2"
            >
              Go to Sign In
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!token && error) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#F0F9F4] p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border-2 border-[#D1E7DD]">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#EF4444] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-[#991B1B] mb-2">
              Invalid Link
            </h1>
            <p className="text-[#6B7280]">This reset link is not valid</p>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg bg-[#FEE2E2] border-2 border-[#FECACA] p-4">
              <p className="text-[#991B1B] text-sm">{error}</p>
            </div>

            <a
              href="/account/forgot-password"
              className="block w-full text-center rounded-lg bg-[#22C55E] px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-[#16A34A] focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:ring-offset-2"
            >
              Request New Reset Link
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#F0F9F4] p-4">
      <form
        noValidate
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border-2 border-[#D1E7DD]"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#166534] mb-2">
            Reset Your Password
          </h1>
          <p className="text-[#6B7280]">Enter your new password below</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#374151]">
              New Password
            </label>
            <div className="overflow-hidden rounded-lg border-2 border-[#D1E7DD] bg-white px-4 py-3 focus-within:border-[#22C55E] focus-within:ring-2 focus-within:ring-[#22C55E]">
              <input
                required
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
                className="w-full bg-transparent text-[#166534] text-lg outline-none placeholder-[#9CA3AF]"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#374151]">
              Confirm New Password
            </label>
            <div className="overflow-hidden rounded-lg border-2 border-[#D1E7DD] bg-white px-4 py-3 focus-within:border-[#22C55E] focus-within:ring-2 focus-within:ring-[#22C55E]">
              <input
                required
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                className="w-full bg-transparent text-[#166534] text-lg outline-none placeholder-[#9CA3AF]"
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-[#FEE2E2] border-2 border-[#FECACA] p-3 text-sm text-[#991B1B]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#22C55E] px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-[#16A34A] focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>

          <p className="text-center text-sm text-[#6B7280]">
            Remember your password?{" "}
            <a
              href="/account/signin"
              className="text-[#22C55E] hover:text-[#16A34A] font-semibold"
            >
              Sign in
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
