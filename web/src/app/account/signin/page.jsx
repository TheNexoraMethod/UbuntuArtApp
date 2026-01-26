import { useState } from "react";
import useAuth from "@/utils/useAuth";

function MainComponent() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signInWithCredentials } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      console.log("Starting signin process...", { email });
      const result = await signInWithCredentials({
        email: email.trim(),
        password,
        callbackUrl: "/",
        redirect: false,
      });

      console.log("Signin result:", result);

      if (result?.error) {
        throw new Error(result.error);
      }

      // Show success message
      setSuccess(true);
      setLoading(false);

      // Redirect after showing success message
      setTimeout(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const callbackUrl = urlParams.get("callbackUrl") || "/";
        console.log("Redirecting to:", callbackUrl);
        window.location.replace(callbackUrl);
      }, 2000);
    } catch (err) {
      console.error("Signin error:", err);

      const errorMessages = {
        OAuthSignin:
          "Couldn't start sign-in. Please try again or use a different method.",
        OAuthCallback: "Sign-in failed after redirecting. Please try again.",
        OAuthCreateAccount:
          "Couldn't create an account with this sign-in method. Try another option.",
        EmailCreateAccount:
          "This email can't be used to create an account. It may already exist.",
        Callback: "Something went wrong during sign-in. Please try again.",
        OAuthAccountNotLinked:
          "This account is linked to a different sign-in method. Try using that instead.",
        CredentialsSignin:
          "Incorrect email or password. Try again or reset your password.",
        AccessDenied: "You don't have permission to sign in.",
        Configuration:
          "Sign-in isn't working right now. Please try again later.",
        Verification: "Your sign-in link has expired. Request a new one.",
      };

      const errorMessage = err.message || err.toString();
      setError(
        errorMessages[errorMessage] ||
          errorMessages[err.type] ||
          `Sign-in failed: ${errorMessage}. Please try again.`,
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
              Welcome Back! ✅
            </h1>
            <p className="text-[#6B7280]">You've been successfully signed in</p>
          </div>
          <div className="space-y-4">
            <div className="rounded-lg bg-[#F0FDF4] border-2 border-[#BBF7D0] p-4">
              <p className="text-[#166534] font-semibold">Login Successful!</p>
              <p className="text-[#374151] text-sm mt-1">
                Redirecting you now...
              </p>
            </div>
            <div className="flex items-center justify-center space-x-2 text-[#6B7280]">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#22C55E]"></div>
              <span className="text-sm">Taking you to your dashboard</span>
            </div>
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
            Welcome Back
          </h1>
          <p className="text-[#6B7280]">Ubuntu Art Village</p>
        </div>

        <div className="space-y-6">
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
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>
            <div className="text-right">
              <a
                href="/account/forgot-password"
                className="text-sm text-[#22C55E] hover:text-[#16A34A] font-semibold"
              >
                Forgot password?
              </a>
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
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <p className="text-center text-sm text-[#6B7280]">
            Don't have an account?{" "}
            <a
              href={`/account/signup${
                typeof window !== "undefined" ? window.location.search : ""
              }`}
              className="text-[#22C55E] hover:text-[#16A34A] font-semibold"
            >
              Sign up
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}

export default MainComponent;
