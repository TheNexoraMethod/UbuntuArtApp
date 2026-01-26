"use client";

import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import { RefreshCw, Image } from "lucide-react";

export default function AdminDashboard() {
  const { data: user, loading: userLoading } = useUser();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState("applications");
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (userLoading) return;

    // Check if user is authenticated and has admin role
    if (!user) {
      window.location.href = "/account/signin?callbackUrl=/admin/dashboard";
      return;
    }

    if (user.user_role !== "admin") {
      setAccessDenied(true);
      setError("Access Denied: Admin privileges required");
      return;
    }

    fetchDashboardData();
  }, [user, userLoading]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/dashboard");

      if (response.status === 403) {
        setError("Admin access required. Please contact an administrator.");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      completed: "bg-blue-100 text-blue-800",
      new: "bg-purple-100 text-purple-800",
      responded: "bg-green-100 text-green-800",
    };

    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-4">{error}</div>
          <button
            onClick={() => (window.location.href = "/")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Ubuntu Art Village - Admin Dashboard
          </h1>
          <p className="text-gray-400">
            Monitor applications, enquiries, bookings, and transactions
          </p>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => (window.location.href = "/admin/sync-gallery")}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-4 rounded-lg transition-all flex items-center gap-3 justify-center"
            >
              <Image size={24} />
              <span className="font-medium">Sync Gallery Images</span>
            </button>
            <button
              onClick={() => (window.location.href = "/admin/gallery")}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-4 rounded-lg transition-all flex items-center gap-3 justify-center"
            >
              <Image size={24} />
              <span className="font-medium">Manage Gallery</span>
            </button>
            <button
              onClick={() =>
                (window.location.href = "/admin/booking-dashboard")
              }
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-lg transition-all flex items-center gap-3 justify-center"
            >
              <RefreshCw size={24} />
              <span className="font-medium">Booking Dashboard</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-8 border-b border-gray-700">
          {[
            { key: "applications", label: "Applications" },
            { key: "enquiries", label: "Contact Enquiries" },
            { key: "bookings", label: "Bookings" },
            { key: "transactions", label: "Transactions" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key)}
              className={`px-4 py-2 font-medium transition-colors ${
                selectedTab === tab.key
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Applications Tab */}
        {selectedTab === "applications" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">
              Artist Residency Applications
            </h2>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {dashboardData.applications.stats.map((stat) => (
                <div key={stat.status} className="bg-gray-800 rounded-lg p-6">
                  <div className="text-3xl font-bold text-white mb-2">
                    {stat.count}
                  </div>
                  <div className="text-gray-400 capitalize">
                    {stat.status} Applications
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Applications */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">
                Recent Applications
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2">Name</th>
                      <th className="text-left py-2">Email</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Submitted</th>
                      <th className="text-left py-2">Preview</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.applications.recent.map((app) => (
                      <tr
                        key={app.id}
                        className="border-b border-gray-700 hover:bg-gray-750"
                      >
                        <td className="py-2">{app.user_name}</td>
                        <td className="py-2">{app.user_email}</td>
                        <td className="py-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(app.status)}`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="py-2">{formatDate(app.submitted_at)}</td>
                        <td className="py-2 max-w-xs truncate">
                          {app.preview}...
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Contact Enquiries Tab */}
        {selectedTab === "enquiries" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Contact Enquiries</h2>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {dashboardData.enquiries.stats.map((stat) => (
                <div key={stat.status} className="bg-gray-800 rounded-lg p-6">
                  <div className="text-3xl font-bold text-white mb-2">
                    {stat.count}
                  </div>
                  <div className="text-gray-400 capitalize">
                    {stat.status} Enquiries
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Enquiries */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Recent Enquiries</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2">Name</th>
                      <th className="text-left py-2">Email</th>
                      <th className="text-left py-2">Subject</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Date</th>
                      <th className="text-left py-2">Preview</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.enquiries.recent.map((enquiry) => (
                      <tr
                        key={enquiry.id}
                        className="border-b border-gray-700 hover:bg-gray-750"
                      >
                        <td className="py-2">{enquiry.name}</td>
                        <td className="py-2">{enquiry.email}</td>
                        <td className="py-2">
                          {enquiry.subject || "General Enquiry"}
                        </td>
                        <td className="py-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(enquiry.status)}`}
                          >
                            {enquiry.status}
                          </span>
                        </td>
                        <td className="py-2">
                          {formatDate(enquiry.created_at)}
                        </td>
                        <td className="py-2 max-w-xs truncate">
                          {enquiry.preview}...
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {selectedTab === "bookings" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Bookings</h2>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {dashboardData.bookings.stats.map((stat) => (
                <div key={stat.status} className="bg-gray-800 rounded-lg p-6">
                  <div className="text-3xl font-bold text-white mb-2">
                    {stat.count}
                  </div>
                  <div className="text-gray-400 capitalize">
                    {stat.status} Bookings
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Bookings */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Recent Bookings</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2">User</th>
                      <th className="text-left py-2">Residency</th>
                      <th className="text-left py-2">Dates</th>
                      <th className="text-left py-2">Price</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.bookings.recent.map((booking) => (
                      <tr
                        key={booking.id}
                        className="border-b border-gray-700 hover:bg-gray-750"
                      >
                        <td className="py-2">{booking.user_name}</td>
                        <td className="py-2">{booking.residency_title}</td>
                        <td className="py-2">
                          {new Date(booking.start_date).toLocaleDateString()} -{" "}
                          {new Date(booking.end_date).toLocaleDateString()}
                        </td>
                        <td className="py-2">${booking.total_price}</td>
                        <td className="py-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(booking.status)}`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="py-2">
                          {formatDate(booking.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {selectedTab === "transactions" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Transactions</h2>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {dashboardData.transactions.stats.map((stat) => (
                <div key={stat.status} className="bg-gray-800 rounded-lg p-6">
                  <div className="text-3xl font-bold text-white mb-2">
                    {stat.count}
                  </div>
                  <div className="text-gray-400 capitalize">
                    {stat.status} Transactions
                  </div>
                  {stat.total_amount && (
                    <div className="text-green-400 text-sm mt-1">
                      Total: ${parseFloat(stat.total_amount).toFixed(2)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <div className="mt-8">
          <button
            onClick={fetchDashboardData}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
}
