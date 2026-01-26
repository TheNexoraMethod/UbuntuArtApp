import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import useUpload from "@/utils/useUpload";

function MainComponent() {
  const { data: user, loading: userLoading, refetch } = useUser();
  const { upload, uploading } = useUpload();

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Email change state
  const [newEmail, setNewEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  // Profile state
  const [name, setName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  // Email verification state
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");

  // Payment state
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentCategory, setPaymentCategory] = useState("food");
  const [paymentProvider, setPaymentProvider] = useState("monzo");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setProfileImage(user.image || "");
    }
  }, [user]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await upload(file);
      setProfileImage(url);
      setProfileSuccess(
        "Image uploaded! Remember to click 'Update Profile' to save.",
      );
    } catch (error) {
      setProfileError("Failed to upload image");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError("");
    setPasswordSuccess("");

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Password change failed");
      }

      setPasswordSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPasswordError(error.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleEmailChange = async (e) => {
    e.preventDefault();
    setEmailLoading(true);
    setEmailError("");
    setEmailSuccess("");

    try {
      const response = await fetch("/api/auth/change-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Email change failed");
      }

      setEmailSuccess(data.message);
      setNewEmail("");

      // If in development, show the verification link
      if (data.verificationUrl) {
        setEmailSuccess(
          `${data.message} Development link: ${data.verificationUrl}`,
        );
      }
    } catch (error) {
      setEmailError(error.message);
    } finally {
      setEmailLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError("");
    setProfileSuccess("");

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image: profileImage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Profile update failed");
      }

      setProfileSuccess("Profile updated successfully!");
      refetch(); // Refresh user data
    } catch (error) {
      setProfileError(error.message);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setVerificationLoading(true);
    setVerificationMessage("");

    try {
      const response = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await response.json();
      setVerificationMessage(
        data.verificationUrl
          ? `Verification email sent! Development link: ${data.verificationUrl}`
          : "Verification email sent! Please check your inbox.",
      );
    } catch (error) {
      setVerificationMessage("Failed to send verification email");
    } finally {
      setVerificationLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setPaymentLoading(true);
    setPaymentError("");

    try {
      const response = await fetch("/api/payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(paymentAmount),
          category: paymentCategory,
          provider: paymentProvider,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate payment link");
      }

      // Open payment URL in new window
      window.open(data.paymentUrl, "_blank");
      setPaymentAmount("");
    } catch (error) {
      setPaymentError(error.message);
    } finally {
      setPaymentLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Authentication Required
          </h1>
          <a
            href="/account/signin"
            className="text-blue-400 hover:text-blue-300"
          >
            Sign in to access account settings
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Save Button */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Account Settings
            </h1>
            <p className="text-gray-400">
              Manage your Ubuntu Art Village account
            </p>
          </div>
          <button
            onClick={handleProfileUpdate}
            disabled={profileLoading}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {profileLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Information */}
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">
              Profile Information
            </h2>

            {/* Email verification status */}
            {user.email_verified === false && (
              <div className="mb-4 p-3 bg-yellow-900/50 border border-yellow-700 rounded-lg">
                <p className="text-yellow-300 text-sm mb-2">
                  ⚠️ Your email is not verified
                </p>
                <button
                  onClick={handleResendVerification}
                  disabled={verificationLoading}
                  className="text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded disabled:opacity-50"
                >
                  {verificationLoading ? "Sending..." : "Resend Verification"}
                </button>
                {verificationMessage && (
                  <p className="text-yellow-200 text-xs mt-2">
                    {verificationMessage}
                  </p>
                )}
              </div>
            )}

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              {/* Profile Picture Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Profile Picture
                </label>
                <div className="flex items-center gap-4">
                  {profileImage && (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover border-2 border-green-500"
                    />
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700 disabled:opacity-50"
                    />
                    <p className="text-gray-500 text-xs mt-1">
                      Upload a profile picture (JPG, PNG, or GIF)
                    </p>
                  </div>
                </div>
                {uploading && (
                  <p className="text-blue-300 text-sm mt-2">
                    Uploading image...
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user.email || ""}
                  disabled
                  className="w-full bg-gray-600 border border-gray-600 rounded-lg px-4 py-3 text-gray-300 cursor-not-allowed"
                />
                <p className="text-gray-500 text-xs mt-1">
                  Use the "Change Email" section to update your email
                </p>
              </div>

              {profileError && (
                <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 text-red-300 text-sm">
                  {profileError}
                </div>
              )}

              {profileSuccess && (
                <div className="bg-green-900/50 border border-green-700 rounded-lg p-3 text-green-300 text-sm">
                  {profileSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={profileLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {profileLoading ? "Updating..." : "Update Profile"}
              </button>
            </form>
          </div>

          {/* Password Change */}
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">
              Change Password
            </h2>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400"
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400"
                  placeholder="Enter new password"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400"
                  placeholder="Confirm new password"
                  required
                />
              </div>

              {passwordError && (
                <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 text-red-300 text-sm">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="bg-green-900/50 border border-green-700 rounded-lg p-3 text-green-300 text-sm">
                  {passwordSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {passwordLoading ? "Changing..." : "Change Password"}
              </button>
            </form>
          </div>

          {/* Email Change */}
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">
              Change Email Address
            </h2>

            <form onSubmit={handleEmailChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current Email
                </label>
                <input
                  type="email"
                  value={user.email || ""}
                  disabled
                  className="w-full bg-gray-600 border border-gray-600 rounded-lg px-4 py-3 text-gray-300 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Email Address
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400"
                  placeholder="Enter new email address"
                  required
                />
              </div>

              {emailError && (
                <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 text-red-300 text-sm">
                  {emailError}
                </div>
              )}

              {emailSuccess && (
                <div className="bg-green-900/50 border border-green-700 rounded-lg p-3 text-green-300 text-sm">
                  {emailSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={emailLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {emailLoading ? "Sending Verification..." : "Change Email"}
              </button>
            </form>

            <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
              <p className="text-blue-200 text-xs">
                📧 A verification link will be sent to your new email address.
                You must click the link to complete the email change.
              </p>
            </div>
          </div>

          {/* Make a Payment */}
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">
              Make a Payment
            </h2>

            {/* Member Discount Badge - only show when truly active */}
            {user.subscription_status === "active" && (
              <div className="mb-4 p-3 bg-green-900/30 border border-green-700 rounded-lg">
                <p className="text-green-200 text-sm">
                  🎉 Active Member: 10% discount applied automatically!
                </p>
              </div>
            )}

            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount
                </label>
                <div className="flex items-center bg-gray-700 border border-gray-600 rounded-lg px-4 py-3">
                  <span className="text-white font-semibold text-lg mr-2">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={paymentCategory}
                  onChange={(e) => setPaymentCategory(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400"
                  required
                >
                  <option value="food">Food</option>
                  <option value="drinks">Drinks</option>
                  <option value="services">Services</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentProvider}
                  onChange={(e) => setPaymentProvider(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400"
                  required
                >
                  <option value="monzo">Monzo</option>
                  <option value="wise">Wise</option>
                </select>
              </div>

              {paymentError && (
                <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 text-red-300 text-sm">
                  {paymentError}
                </div>
              )}

              <button
                type="submit"
                disabled={paymentLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {paymentLoading ? "Processing..." : "Make Payment"}
              </button>
            </form>

            <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
              <p className="text-blue-200 text-xs">
                💳 You'll be redirected to{" "}
                {paymentProvider === "monzo" ? "Monzo" : "Wise"} to complete
                your payment securely.
              </p>
            </div>
          </div>

          {/* Account Security Info */}
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">
              Account Security
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div>
                  <p className="text-white font-medium">Email Verification</p>
                  <p className="text-gray-400 text-sm">
                    {user.email_verified ? "Verified ✓" : "Not verified ⚠️"}
                  </p>
                </div>
                <div
                  className={`w-3 h-3 rounded-full ${user.email_verified ? "bg-green-500" : "bg-yellow-500"}`}
                ></div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div>
                  <p className="text-white font-medium">
                    Two-Factor Authentication
                  </p>
                  <p className="text-gray-400 text-sm">
                    Currently not available
                  </p>
                </div>
                <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div>
                  <p className="text-white font-medium">Login Method</p>
                  <p className="text-gray-400 text-sm">Email & Password</p>
                </div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-700 rounded-lg">
              <p className="text-yellow-200 text-xs">
                🔒 Two-factor authentication is planned for a future update to
                enhance your account security.
              </p>
            </div>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}

export default MainComponent;
