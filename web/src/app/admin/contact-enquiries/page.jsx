"use client";

import { useState, useEffect } from "react";
import useAuth from "@/utils/useAuth";
import useUser from "@/utils/useUser";
import {
  Mail,
  MessageCircle,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Send,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";

export default function ContactEnquiriesAdmin() {
  const { user } = useAuth();
  const { data: userData } = useUser();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState({});
  const [responseText, setResponseText] = useState({});
  const [expandedEnquiry, setExpandedEnquiry] = useState(null);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState(null);

  // Check if user is admin
  const isAdmin = userData?.user_role === "admin";

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== "all") {
        params.append("status", filter);
      }

      const response = await fetch(`/api/contact-enquiries?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch enquiries");
      }

      const data = await response.json();
      setEnquiries(data.enquiries || []);
    } catch (error) {
      console.error("Error fetching enquiries:", error);
      setError("Failed to load enquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchEnquiries();
    }
  }, [isAdmin, filter]);

  const handleRespond = async (enquiryId) => {
    const response = responseText[enquiryId];
    if (!response?.trim()) {
      alert("Please enter a response message");
      return;
    }

    setResponding((prev) => ({ ...prev, [enquiryId]: true }));

    try {
      const res = await fetch(`/api/contact-enquiries/${enquiryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          response_message: response,
          status: "responded",
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to send response");
      }

      // Clear response text and refresh list
      setResponseText((prev) => ({ ...prev, [enquiryId]: "" }));
      setExpandedEnquiry(null);
      await fetchEnquiries();

      alert("Response sent successfully!");
    } catch (error) {
      console.error("Error sending response:", error);
      alert("Failed to send response. Please try again.");
    } finally {
      setResponding((prev) => ({ ...prev, [enquiryId]: false }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "responded":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600">
            You need admin privileges to view this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Contact Enquiries
          </h1>
          <p className="text-gray-600">
            Manage and respond to customer enquiries
          </p>
        </div>

        {/* Filter and Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="flex flex-wrap gap-2">
                {["all", "new", "responded"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filter === status
                        ? "bg-green-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {status === "all"
                      ? "All Enquiries"
                      : `${status.charAt(0).toUpperCase() + status.slice(1)} (${enquiries.filter((e) => e.status === status).length})`}
                  </button>
                ))}
              </div>

              <button
                onClick={fetchEnquiries}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Enquiries List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading enquiries...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
          </div>
        ) : enquiries.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No enquiries found
            </h3>
            <p className="text-gray-600">
              {filter === "all"
                ? "No contact enquiries have been submitted yet."
                : `No ${filter} enquiries found.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {enquiries.map((enquiry) => (
              <div
                key={enquiry.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {enquiry.subject || "General Enquiry"}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(enquiry.status)}`}
                        >
                          {enquiry.status === "new" ? "New" : "Responded"}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {enquiry.name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          <a
                            href={`mailto:${enquiry.email}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {enquiry.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDate(enquiry.created_at)}
                        </div>
                        {enquiry.user_account_name && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>Registered User</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        setExpandedEnquiry(
                          expandedEnquiry === enquiry.id ? null : enquiry.id,
                        )
                      }
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 font-medium"
                    >
                      {expandedEnquiry === enquiry.id ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          Collapse
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          View Details
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-800 leading-relaxed">
                      {enquiry.message.length > 200 &&
                      expandedEnquiry !== enquiry.id
                        ? `${enquiry.message.substring(0, 200)}...`
                        : enquiry.message}
                    </p>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedEnquiry === enquiry.id && (
                  <div className="border-t border-gray-200 p-6 bg-gray-50">
                    {enquiry.status === "responded" &&
                    enquiry.response_notes ? (
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Previous Response
                        </h4>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <p className="text-gray-800 whitespace-pre-wrap">
                            {enquiry.response_notes}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Responded on: {formatDate(enquiry.responded_at)}
                          </p>
                        </div>
                      </div>
                    ) : null}

                    {/* Response Form */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        {enquiry.status === "responded"
                          ? "Send Follow-up Response"
                          : "Send Response"}
                      </h4>

                      <textarea
                        value={responseText[enquiry.id] || ""}
                        onChange={(e) =>
                          setResponseText((prev) => ({
                            ...prev,
                            [enquiry.id]: e.target.value,
                          }))
                        }
                        placeholder={`Hello ${enquiry.name},\n\nThank you for reaching out to Ubuntu Art Village.\n\n`}
                        className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none text-sm"
                        disabled={responding[enquiry.id]}
                      />

                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => handleRespond(enquiry.id)}
                          disabled={
                            responding[enquiry.id] ||
                            !responseText[enquiry.id]?.trim()
                          }
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                        >
                          {responding[enquiry.id] ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                          {responding[enquiry.id]
                            ? "Sending..."
                            : "Send Response"}
                        </button>

                        <a
                          href={`mailto:${enquiry.email}?subject=Re: ${encodeURIComponent(enquiry.subject || "Your enquiry to Ubuntu Art Village")}&body=${encodeURIComponent(`Hello ${enquiry.name},\n\nThank you for reaching out to Ubuntu Art Village.\n\n`)}`}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Open in Email Client
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
