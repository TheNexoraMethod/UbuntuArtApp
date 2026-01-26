"use client";

import { useState, useEffect } from "react";

export default function AdminBookingDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [applications, setApplications] = useState([]);
  const [residencies, setResidencies] = useState([]);
  const [selectedResidency, setSelectedResidency] = useState(null);
  const [calendarData, setCalendarData] = useState(null);
  const [error, setError] = useState(null);

  // Filter and pagination state
  const [bookingFilters, setBookingFilters] = useState({
    status: "",
    bookingType: "",
    search: "",
  });
  const [applicationFilters, setApplicationFilters] = useState({
    status: "",
    search: "",
  });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (activeTab === "bookings") {
      loadBookings();
    } else if (activeTab === "applications") {
      loadApplications();
    } else if (activeTab === "calendar") {
      loadResidencies();
    }
  }, [activeTab]);

  const checkAdminAccess = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "null");

      if (!userData || userData.user_role !== "admin") {
        window.location.href =
          "/account/signin?callbackUrl=/admin/booking-dashboard";
        return;
      }

      setUser(userData);
    } catch (error) {
      console.error("Error checking admin access:", error);
      window.location.href = "/";
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    try {
      const params = new URLSearchParams({
        userRole: "admin",
        ...bookingFilters,
      });

      const response = await fetch(`/api/bookings?${params}`);
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error("Error loading bookings:", error);
      setError("Failed to load bookings");
    }
  };

  const loadApplications = async () => {
    try {
      const params = new URLSearchParams({
        userRole: "admin",
        ...applicationFilters,
      });

      const response = await fetch(`/api/applications?${params}`);
      const data = await response.json();
      setApplications(data.applications || []);
    } catch (error) {
      console.error("Error loading applications:", error);
      setError("Failed to load applications");
    }
  };

  const loadResidencies = async () => {
    try {
      const response = await fetch("/api/residencies");
      const data = await response.json();
      setResidencies(data.residencies || []);

      if (
        data.residencies &&
        data.residencies.length > 0 &&
        !selectedResidency
      ) {
        setSelectedResidency(data.residencies[0]);
      }
    } catch (error) {
      console.error("Error loading residencies:", error);
    }
  };

  const loadCalendarData = async (residencyId) => {
    try {
      const response = await fetch(`/api/calendar?residencyId=${residencyId}`);
      const data = await response.json();
      setCalendarData(data);
    } catch (error) {
      console.error("Error loading calendar data:", error);
    }
  };

  useEffect(() => {
    if (selectedResidency) {
      loadCalendarData(selectedResidency.id);
    }
  }, [selectedResidency]);

  const updateBookingStatus = async (
    bookingId,
    status,
    adminApproved = null,
  ) => {
    try {
      const response = await fetch("/api/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: bookingId,
          status,
          adminApproved,
        }),
      });

      if (response.ok) {
        loadBookings();
      } else {
        throw new Error("Failed to update booking");
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      setError("Failed to update booking status");
    }
  };

  const updateApplicationStatus = async (
    applicationId,
    status,
    reviewerNotes = "",
  ) => {
    try {
      const response = await fetch("/api/applications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: applicationId,
          status,
          reviewerNotes,
        }),
      });

      if (response.ok) {
        loadApplications();
      } else {
        throw new Error("Failed to update application");
      }
    } catch (error) {
      console.error("Error updating application:", error);
      setError("Failed to update application status");
    }
  };

  const blockDates = async (dates, reason = "Admin blocked") => {
    try {
      const response = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          residencyId: selectedResidency.id,
          dates,
          reason,
          action: "block",
        }),
      });

      if (response.ok) {
        loadCalendarData(selectedResidency.id);
      } else {
        throw new Error("Failed to block dates");
      }
    } catch (error) {
      console.error("Error blocking dates:", error);
      setError("Failed to block dates");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F9F4] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#166534]"></div>
          <p className="mt-4 text-[#166534] font-medium">
            Loading admin dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F9F4]">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-[#D1E7DD]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1
                className="text-2xl font-bold text-[#166534] cursor-pointer"
                onClick={() => (window.location.href = "/")}
              >
                Ubuntu Art Village
              </h1>
              <span className="text-sm bg-[#F59E0B] text-white px-2 py-1 rounded">
                Admin
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-[#374151]">Welcome, {user?.name}</span>
              <button
                onClick={() => (window.location.href = "/account/logout")}
                className="px-4 py-2 text-[#374151] hover:text-[#166534] transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#166534] mb-4">
            Booking Management Dashboard
          </h2>
          <p className="text-[#374151] text-lg">
            Manage bookings, applications, and calendar availability
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-[#D1E7DD]">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: "bookings", label: "Bookings", count: bookings.length },
                {
                  id: "applications",
                  label: "Applications",
                  count: applications.length,
                },
                { id: "calendar", label: "Calendar Management", count: null },
                { id: "settings", label: "Settings", count: null },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-[#F59E0B] text-[#F59E0B]"
                      : "border-transparent text-[#6B7280] hover:text-[#374151] hover:border-[#D1E7DD]"
                  }`}
                >
                  {tab.label}
                  {tab.count !== null && (
                    <span className="ml-2 bg-[#F3F4F6] text-[#6B7280] py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Bookings Tab */}
          {activeTab === "bookings" && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-[#D1E7DD]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1">
                      Status
                    </label>
                    <select
                      value={bookingFilters.status}
                      onChange={(e) =>
                        setBookingFilters((prev) => ({
                          ...prev,
                          status: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-[#D1E7DD] rounded-lg focus:ring-2 focus:ring-[#F59E0B]"
                    >
                      <option value="">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1">
                      Type
                    </label>
                    <select
                      value={bookingFilters.bookingType}
                      onChange={(e) =>
                        setBookingFilters((prev) => ({
                          ...prev,
                          bookingType: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-[#D1E7DD] rounded-lg focus:ring-2 focus:ring-[#F59E0B]"
                    >
                      <option value="">All Types</option>
                      <option value="guest">Guest</option>
                      <option value="artist">Artist</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1">
                      Search
                    </label>
                    <input
                      type="text"
                      value={bookingFilters.search}
                      onChange={(e) =>
                        setBookingFilters((prev) => ({
                          ...prev,
                          search: e.target.value,
                        }))
                      }
                      placeholder="Search by user name..."
                      className="w-full px-3 py-2 border border-[#D1E7DD] rounded-lg focus:ring-2 focus:ring-[#F59E0B]"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={loadBookings}
                    className="px-4 py-2 bg-[#F59E0B] text-white rounded-lg hover:bg-[#D97706] transition"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>

              {/* Bookings Table */}
              <div className="bg-white rounded-lg shadow-sm border border-[#D1E7DD] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#D1E7DD]">
                  <h3 className="text-lg font-semibold text-[#166534]">
                    All Bookings ({bookings.length})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#F9FAFB]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">
                          Booking ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">
                          Guest
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">
                          Room
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">
                          Dates
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D1E7DD]">
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-[#F9FAFB]">
                          <td className="px-6 py-4 text-sm font-medium text-[#166534]">
                            #{booking.id}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#374151]">
                            <div>
                              <div className="font-medium">
                                {booking.user_name}
                              </div>
                              <div className="text-[#6B7280]">
                                {booking.user_email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-[#374151]">
                            <div>
                              <div className="font-medium">
                                {booking.residency_title}
                              </div>
                              <div className="text-[#6B7280]">
                                {booking.room_type?.replace("_", " ")}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-[#374151]">
                            <div>
                              <div>{booking.start_date}</div>
                              <div className="text-[#6B7280]">
                                to {booking.end_date}
                              </div>
                              <div className="text-xs text-[#6B7280]">
                                {booking.stay_duration?.replace("_", " ")}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                booking.booking_type === "artist"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {booking.booking_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-[#374151]">
                            <div className="font-medium">
                              ${booking.total_price}
                            </div>
                            {booking.has_extra_guest && (
                              <div className="text-xs text-[#6B7280]">
                                +${booking.extra_guest_cost} extra guest
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                booking.status === "confirmed"
                                  ? "bg-green-100 text-green-800"
                                  : booking.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex space-x-2">
                              {booking.status === "pending" && (
                                <>
                                  <button
                                    onClick={() =>
                                      updateBookingStatus(
                                        booking.id,
                                        "confirmed",
                                        true,
                                      )
                                    }
                                    className="text-green-600 hover:text-green-800 font-medium"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() =>
                                      updateBookingStatus(
                                        booking.id,
                                        "cancelled",
                                        false,
                                      )
                                    }
                                    className="text-red-600 hover:text-red-800 font-medium"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              {booking.booking_type === "artist" &&
                                booking.application_status && (
                                  <span className="text-xs text-[#6B7280]">
                                    App: {booking.application_status}
                                  </span>
                                )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === "applications" && (
            <div className="space-y-6">
              {/* Application Filters */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-[#D1E7DD]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1">
                      Status
                    </label>
                    <select
                      value={applicationFilters.status}
                      onChange={(e) =>
                        setApplicationFilters((prev) => ({
                          ...prev,
                          status: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-[#D1E7DD] rounded-lg focus:ring-2 focus:ring-[#F59E0B]"
                    >
                      <option value="">All Statuses</option>
                      <option value="pending">Pending Review</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1">
                      Search
                    </label>
                    <input
                      type="text"
                      value={applicationFilters.search}
                      onChange={(e) =>
                        setApplicationFilters((prev) => ({
                          ...prev,
                          search: e.target.value,
                        }))
                      }
                      placeholder="Search by artist name..."
                      className="w-full px-3 py-2 border border-[#D1E7DD] rounded-lg focus:ring-2 focus:ring-[#F59E0B]"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={loadApplications}
                    className="px-4 py-2 bg-[#F59E0B] text-white rounded-lg hover:bg-[#D97706] transition"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>

              {/* Applications List */}
              <div className="space-y-4">
                {applications.map((application) => (
                  <div
                    key={application.id}
                    className="bg-white rounded-lg shadow-sm border border-[#D1E7DD] overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-[#166534]">
                            {application.user_name}
                          </h3>
                          <p className="text-sm text-[#6B7280]">
                            {application.user_email}
                          </p>
                          <p className="text-xs text-[#6B7280]">
                            Submitted:{" "}
                            {new Date(
                              application.submitted_at,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span
                            className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                              application.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : application.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {application.status}
                          </span>
                          {application.status === "pending" && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() =>
                                  updateApplicationStatus(
                                    application.id,
                                    "approved",
                                  )
                                }
                                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  updateApplicationStatus(
                                    application.id,
                                    "rejected",
                                  )
                                }
                                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-sm">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-[#374151] mb-1">
                              Art Style
                            </h4>
                            <p className="text-[#6B7280]">
                              {application.art_style}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium text-[#374151] mb-1">
                              Focus & Goals
                            </h4>
                            <p className="text-[#6B7280]">
                              {application.focus_work_goals}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-[#374151] mb-1">
                              Why Ubuntu
                            </h4>
                            <p className="text-[#6B7280]">
                              {application.why_ubuntu}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium text-[#374151] mb-1">
                              Portfolio Links
                            </h4>
                            <p className="text-[#6B7280]">
                              {application.portfolio}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Full details toggle could go here */}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Calendar Management Tab */}
          {activeTab === "calendar" && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-[#D1E7DD]">
                <h3 className="text-lg font-semibold text-[#166534] mb-4">
                  Calendar Management
                </h3>

                {/* Residency Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-[#374151] mb-2">
                    Select Residency
                  </label>
                  <select
                    value={selectedResidency?.id || ""}
                    onChange={(e) => {
                      const residency = residencies.find(
                        (r) => r.id == e.target.value,
                      );
                      setSelectedResidency(residency);
                    }}
                    className="w-full max-w-md px-3 py-2 border border-[#D1E7DD] rounded-lg focus:ring-2 focus:ring-[#F59E0B]"
                  >
                    {residencies.map((residency) => (
                      <option key={residency.id} value={residency.id}>
                        {residency.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Calendar View */}
                {calendarData && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-[#374151] mb-2">
                          Booked Dates ({calendarData.bookedDates.length})
                        </h4>
                        <div className="max-h-40 overflow-y-auto space-y-1">
                          {calendarData.bookedDates.map((booking, idx) => (
                            <div
                              key={idx}
                              className="text-sm p-2 bg-red-50 rounded"
                            >
                              <span className="font-medium">
                                {booking.date}
                              </span>
                              {booking.isBuffer && (
                                <span className="ml-2 text-xs text-orange-600">
                                  (Buffer)
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-[#374151] mb-2">
                          Admin Blocked Dates (
                          {calendarData.blockedDates.length})
                        </h4>
                        <div className="max-h-40 overflow-y-auto space-y-1">
                          {calendarData.blockedDates.map((blocked, idx) => (
                            <div
                              key={idx}
                              className="text-sm p-2 bg-gray-50 rounded"
                            >
                              <span className="font-medium">
                                {blocked.date}
                              </span>
                              {blocked.reason && (
                                <div className="text-xs text-gray-600">
                                  {blocked.reason}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Block Dates Form */}
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-[#374151] mb-3">
                        Block New Dates
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                          type="date"
                          id="blockDate"
                          className="px-3 py-2 border border-[#D1E7DD] rounded-lg focus:ring-2 focus:ring-[#F59E0B]"
                        />
                        <input
                          type="text"
                          id="blockReason"
                          placeholder="Reason for blocking"
                          className="px-3 py-2 border border-[#D1E7DD] rounded-lg focus:ring-2 focus:ring-[#F59E0B]"
                        />
                        <button
                          onClick={() => {
                            const dateInput =
                              document.getElementById("blockDate");
                            const reasonInput =
                              document.getElementById("blockReason");
                            if (dateInput.value) {
                              blockDates(
                                [dateInput.value],
                                reasonInput.value || "Admin blocked",
                              );
                              dateInput.value = "";
                              reasonInput.value = "";
                            }
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                          Block Date
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-[#D1E7DD]">
                <h3 className="text-lg font-semibold text-[#166534] mb-4">
                  System Settings
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-[#374151] mb-2">
                      Buffer Time Settings
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-[#6B7280] mb-1">
                          Days before check-in
                        </label>
                        <input
                          type="number"
                          defaultValue="1"
                          className="w-full px-3 py-2 border border-[#D1E7DD] rounded-lg focus:ring-2 focus:ring-[#F59E0B]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-[#6B7280] mb-1">
                          Days after check-out
                        </label>
                        <input
                          type="number"
                          defaultValue="1"
                          className="w-full px-3 py-2 border border-[#D1E7DD] rounded-lg focus:ring-2 focus:ring-[#F59E0B]"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-[#374151] mb-2">
                      Cancellation Policy
                    </h4>
                    <textarea
                      rows={4}
                      defaultValue="Cancellations must be made at least 7 days before check-in for a full refund. Cancellations made within 7 days will receive a 50% refund."
                      className="w-full px-3 py-2 border border-[#D1E7DD] rounded-lg focus:ring-2 focus:ring-[#F59E0B]"
                    />
                  </div>

                  <button className="px-6 py-2 bg-[#F59E0B] text-white rounded-lg hover:bg-[#D97706] transition">
                    Save Settings
                  </button>
                </div>
              </div>

              {/* Export Data */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-[#D1E7DD]">
                <h3 className="text-lg font-semibold text-[#166534] mb-4">
                  Export Data
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    Export Bookings
                  </button>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                    Export Applications
                  </button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                    Export Calendar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
