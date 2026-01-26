"use client";

import { useState } from "react";

export default function AdminSetupPage() {
  const [userEmail, setUserEmail] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const makeUserAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Use the admin key from environment or user input
      const keyToUse = adminKey || process.env.NEXT_PUBLIC_ADMIN_SETUP_KEY;

      const response = await fetch("/api/admin/make-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail,
          adminKey: keyToUse,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to make user admin");
      }

      setResult(data);
    } catch (error) {
      console.error("Error making user admin:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Trigger environment variable detection
  const adminSetupKey = process.env.ADMIN_SETUP_KEY;

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-md mx-auto bg-gray-800 rounded-lg p-8 border border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">🛡️ Admin Setup</h1>
          <p className="text-gray-400 text-sm">
            Grant admin access to Ubuntu Art Village dashboard
          </p>
        </div>

        {/* Security Notice */}
        <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
          <h3 className="text-red-400 font-medium mb-2">🔒 Security Notice</h3>
          <p className="text-red-300 text-sm">
            This page sets up admin access for your business. Only use from
            trusted networks and keep your admin key secure.
          </p>
        </div>

        {!adminSetupKey && (
          <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-400 text-sm">
              ⚠️ <strong>Environment Variables Needed:</strong>
              <br />•{" "}
              <code className="bg-gray-700 px-1 rounded">ADMIN_SETUP_KEY</code>{" "}
              - secure admin key
              <br />•{" "}
              <code className="bg-gray-700 px-1 rounded">
                ADMIN_ALLOWED_IPS
              </code>{" "}
              - your office/home IPs (comma-separated)
              <br />•{" "}
              <code className="bg-gray-700 px-1 rounded">
                DISABLE_ADMIN_IP_RESTRICTION
              </code>{" "}
              - set to 'true' to disable IP checks (not recommended)
            </p>
          </div>
        )}

        <form onSubmit={makeUserAdmin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              User Email to Make Admin
            </label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400"
              placeholder="admin@yourdomain.com"
              required
            />
          </div>

          {!adminSetupKey && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Admin Setup Key
              </label>
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400"
                placeholder="Enter your admin setup key"
                required={!adminSetupKey}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !userEmail}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
          >
            {loading ? "Processing..." : "🚀 Grant Admin Access"}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">
              ❌ <strong>Error:</strong> {error}
            </p>
          </div>
        )}

        {result && (
          <div className="mt-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
            <p className="text-green-400 text-sm font-medium mb-2">
              ✅ Success! Admin access granted.
            </p>
            <div className="text-xs text-gray-300 bg-gray-800 p-3 rounded">
              <p>
                <strong>Email:</strong> {result.user.email}
              </p>
              <p>
                <strong>Role:</strong> {result.user.role}
              </p>
              <p>
                <strong>User ID:</strong> {result.user.id}
              </p>
            </div>
            <div className="mt-4 text-sm text-gray-400">
              <p>🎉 You can now access:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>
                  <a
                    href="/admin/dashboard"
                    className="text-blue-400 hover:underline"
                  >
                    Web Admin Dashboard
                  </a>
                </li>
                <li>Mobile Admin Tab (shield icon)</li>
                <li>Data export capabilities</li>
              </ul>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">
            📋 Setup Instructions
          </h3>
          <div className="space-y-3 text-sm text-gray-300">
            <div className="bg-gray-800/50 p-3 rounded border border-gray-600">
              <p className="font-medium text-blue-400">
                Step 1: Set Environment Variable
              </p>
              <p>
                Add{" "}
                <code className="bg-gray-700 px-1 rounded">
                  ADMIN_SETUP_KEY=your_secure_key_here
                </code>
              </p>
            </div>
            <div className="bg-gray-800/50 p-3 rounded border border-gray-600">
              <p className="font-medium text-green-400">
                Step 2: Create User Account
              </p>
              <p>Sign up normally through the app first</p>
            </div>
            <div className="bg-gray-800/50 p-3 rounded border border-gray-600">
              <p className="font-medium text-yellow-400">
                Step 3: Grant Admin Access
              </p>
              <p>Use this form to promote your account to admin</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
