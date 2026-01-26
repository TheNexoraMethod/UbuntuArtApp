import { useState } from "react";
import useAuth from "@/utils/useAuth";

function MainComponent() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [emailSendError, setEmailSendError] = useState(false);

  const { signUpWithCredentials } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    setEmailSendError(false);

    if (!email || !password || !confirmPassword || !name) {
      setError("Please fill in all fields");
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
      console.log("Starting signup process...", { email, name });
      const result = await signUpWithCredentials({
        email: email.trim(),
        password,
        name: name.trim(),
        callbackUrl: "/",
        redirect: false,
      });

      console.log("Signup result:", result);

      if (result?.error) {
        throw new Error(result.error);
      }

      // Account created successfully, now send verification email
      try {
        const verificationResponse = await fetch(
          "/api/auth/send-verification",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email.trim() }),
          },
        );

        if (!verificationResponse.ok) {
          console.error("Failed to send verification email");
          setEmailSendError(true);
        }

        const verificationData = await verificationResponse.json();
        console.log("Verification email response:", verificationData);
      } catch (emailErr) {
        console.error("Error sending verification email:", emailErr);
        setEmailSendError(true);
      }

      // Show success regardless of email sending
      setSuccess(true);
      setLoading(false);
    } catch (err) {
      console.error("Signup error:", err);

      const errorMessages = {
        OAuthSignin:
          "Couldn't start sign-up. Please try again or use a different method.",
        OAuthCallback: "Sign-up failed after redirecting. Please try again.",
        OAuthCreateAccount:
          "Couldn't create an account with this sign-up option. Try another one.",
        EmailCreateAccount:
          "This email is already registered. Try signing in instead.",
        Callback: "Something went wrong during sign-up. Please try again.",
        OAuthAccountNotLinked:
          "This account is linked to a different sign-in method. Try using that instead.",
        CredentialsSignin:
          "Invalid email or password. If you already have an account, try signing in instead.",
        AccessDenied: "You don't have permission to sign up.",
        Configuration:
          "Sign-up isn't working right now. Please try again later.",
        Verification: "Your sign-up link has expired. Request a new one.",
        "User already exists":
          "An account with this email already exists. Try signing in instead.",
      };

      const errorMessage = err.message || err.toString();
      setError(
        errorMessages[errorMessage] ||
          errorMessages[err.type] ||
          `Sign-up failed: ${errorMessage}. Please try again.`,
      );
      setLoading(false);
      setSuccess(false);
    }
  };

  // Show success state
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
              Account Created! 🎉
            </h1>
            <p className="text-[#6B7280]">Welcome to Ubuntu Art Village</p>
          </div>
          <div className="space-y-4">
            {!emailSendError ? (
              <div className="rounded-lg bg-[#F0FDF4] border-2 border-[#BBF7D0] p-4">
                <p className="text-[#166534] font-semibold mb-2">
                  ✉️ Check Your Email
                </p>
                <p className="text-[#374151] text-sm">
                  We've sent a verification link to <strong>{email}</strong>.
                  Please verify your email address before booking.
                </p>
              </div>
            ) : (
              <div className="rounded-lg bg-[#FEF3C7] border-2 border-[#FDE68A] p-4">
                <p className="text-[#92400E] font-semibold mb-2">
                  ⚠️ Email Not Sent
                </p>
                <p className="text-[#92400E] text-sm mb-2">
                  We couldn't send the verification email to{" "}
                  <strong>{email}</strong>. You can request a new one after
                  signing in.
                </p>
              </div>
            )}
            <div className="rounded-lg bg-[#FEF3C7] border-2 border-[#FDE68A] p-3">
              <p className="text-[#92400E] text-sm">
                <strong>Important:</strong> You must verify your email before
                making a booking.
              </p>
            </div>
            <a
              href="/account/signin"
              className="block w-full text-center rounded-lg bg-[#22C55E] px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-[#16A34A] focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:ring-offset-2"
            >
              Continue to Sign In
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
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border-2 border-[#D1E7DD]"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#166534] mb-2">
            Join Ubuntu Art Village
          </h1>
          <p className="text-[#6B7280]">Create your account today</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#374151]">
              Full Name
            </label>
            <div className="overflow-hidden rounded-lg border-2 border-[#D1E7DD] bg-white px-4 py-3 focus-within:border-[#22C55E] focus-within:ring-2 focus-within:ring-[#22C55E]">
              <input
                required
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full bg-transparent text-[#166534] text-lg outline-none placeholder-[#9CA3AF]"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#374151]">
              Email
            </label>
            <div className="overflow-hidden rounded-lg border-2 border-[#D1E7DD] bg-white px-4 py-3 focus-within:border-[#22C55E] focus-within:ring-2 focus-within:ring-[#22C55E]">
              <input
                required
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-transparent text-[#166534] text-lg outline-none placeholder-[#9CA3AF]"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#374151]">
              Password
            </label>
            <div className="overflow-hidden rounded-lg border-2 border-[#D1E7DD] bg-white px-4 py-3 focus-within:border-[#22C55E] focus-within:ring-2 focus-within:ring-[#22C55E]">
              <input
                required
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg bg-transparent text-[#166534] text-lg outline-none placeholder-[#9CA3AF]"
                placeholder="Create a password (min 6 characters)"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#374151]">
              Confirm Password
            </label>
            <div className="overflow-hidden rounded-lg border-2 border-[#D1E7DD] bg-white px-4 py-3 focus-within:border-[#22C55E] focus-within:ring-2 focus-within:ring-[#22C55E]">
              <input
                required
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg bg-transparent text-[#166534] text-lg outline-none placeholder-[#9CA3AF]"
                placeholder="Confirm your password"
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
            {loading ? "Creating Account..." : "Sign Up"}
          </button>

          <p className="text-center text-sm text-[#6B7280]">
            Already have an account?{" "}
            <a
              href={`/account/signin${
                typeof window !== "undefined" ? window.location.search : ""
              }`}
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

export default MainComponent;
