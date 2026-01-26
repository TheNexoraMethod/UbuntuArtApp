import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset email");
      }

      setSuccess(true);
    } catch (err) {
      console.error("Password reset request error:", err);
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
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-[#166534] mb-2">
              Check Your Email
            </h1>
            <p className="text-[#6B7280]">Password reset link sent</p>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg bg-[#F0FDF4] border-2 border-[#BBF7D0] p-4">
              <p className="text-[#166534] font-semibold mb-2">✉️ Email Sent</p>
              <p className="text-[#374151] text-sm">
                We've sent a password reset link to <strong>{email}</strong>.
                Click the link in the email to reset your password.
              </p>
            </div>

            <div className="rounded-lg bg-[#FEF3C7] border-2 border-[#FDE68A] p-3">
              <p className="text-[#92400E] text-sm">
                <strong>Important:</strong> The reset link expires in 1 hour.
              </p>
            </div>

            <a
              href="/account/signin"
              className="block w-full text-center rounded-lg bg-[#22C55E] px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-[#16A34A] focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:ring-offset-2"
            >
              Back to Sign In
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
            Forgot Password?
          </h1>
          <p className="text-[#6B7280]">
            Enter your email to receive a reset link
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#374151]">
              Email Address
            </label>
            <div className="overflow-hidden rounded-lg border-2 border-[#D1E7DD] bg-white px-4 py-3 focus-within:border-[#22C55E] focus-within:ring-2 focus-within:ring-[#22C55E]">
              <input
                required
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
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
            {loading ? "Sending..." : "Send Reset Link"}
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
