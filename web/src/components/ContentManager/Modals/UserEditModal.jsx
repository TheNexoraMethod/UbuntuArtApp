import { useState } from "react";

export function UserEditModal({ userModal, onClose, onSave, isPending }) {
  const [newPassword, setNewPassword] = useState("");
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);

  if (!userModal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    onSave({
      userId: userModal.id,
      name: formData.get("name"),
      email: formData.get("email"),
      userRole: formData.get("userRole"),
      membershipTier: formData.get("membershipTier"),
      membershipStatus: formData.get("membershipStatus"),
      emailVerified: formData.get("emailVerified") === "on",
      newPassword: newPassword || undefined,
    });
  };

  const handleGeneratePassword = async () => {
    setResetPasswordLoading(true);
    try {
      const response = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userModal.id }),
      });

      if (!response.ok) throw new Error("Failed to generate password");

      const data = await response.json();
      setNewPassword(data.newPassword);
    } catch (error) {
      console.error(error);
      alert("Failed to generate new password");
    } finally {
      setResetPasswordLoading(false);
    }
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(newPassword);
    alert("Password copied to clipboard!");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">Edit User</h3>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={userModal.name}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={userModal.email}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Role
                </label>
                <select
                  name="userRole"
                  defaultValue={userModal.user_role || "user"}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Membership Tier
                </label>
                <input
                  type="text"
                  name="membershipTier"
                  defaultValue={userModal.membership_tier}
                  placeholder="e.g., Basic, Premium"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Membership Status
                </label>
                <select
                  name="membershipStatus"
                  defaultValue={userModal.membership_status || "inactive"}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="inactive">Inactive</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="emailVerified"
                  id="emailVerified"
                  defaultChecked={userModal.email_verified}
                  className="h-4 w-4 text-green-700 rounded"
                />
                <label
                  htmlFor="emailVerified"
                  className="ml-2 text-sm text-gray-700"
                >
                  Email verified
                </label>
              </div>

              {/* Password Reset Section */}
              <div className="border-t border-gray-200 pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reset Password
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    disabled={resetPasswordLoading}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                  >
                    {resetPasswordLoading
                      ? "Generating..."
                      : "Generate New Password"}
                  </button>
                  {newPassword && (
                    <button
                      type="button"
                      onClick={handleCopyPassword}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      Copy Password
                    </button>
                  )}
                </div>
                {newPassword && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 font-medium mb-1">
                      ⚠️ New Temporary Password (share this with the user):
                    </p>
                    <code className="text-lg font-mono bg-white px-3 py-2 rounded border border-yellow-300 block">
                      {newPassword}
                    </code>
                    <p className="text-xs text-yellow-700 mt-2">
                      This password will be set when you click "Save Changes"
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-sm text-gray-700 mb-2">
                  User Statistics
                </h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Bookings</div>
                    <div className="font-semibold">
                      {userModal.total_bookings}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Applications</div>
                    <div className="font-semibold">
                      {userModal.total_applications}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Events</div>
                    <div className="font-semibold">
                      {userModal.total_event_registrations}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 disabled:opacity-50"
              >
                {isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
