"use client";

import { useState, useEffect } from "react";

export default function BookingSuccessPage() {
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    handleBookingConfirmation();
  }, []);

  const handleBookingConfirmation = async () => {
    try {
      // Get session ID from URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get("session_id");

      if (!sessionId) {
        setError("No booking session found");
        return;
      }

      // In a real implementation, you might want to verify the session with Stripe
      // For now, we'll show a generic success message
      setBookingData({
        sessionId,
        message: "Your booking has been confirmed!",
      });
    } catch (error) {
      console.error("Error confirming booking:", error);
      setError("Failed to confirm booking");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F9F4] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#166534]"></div>
          <p className="mt-4 text-[#166534] font-medium">
            Confirming your booking...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F0F9F4] flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
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
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Booking Error
            </h2>
            <p className="text-[#374151] mb-6">{error}</p>
            <button
              onClick={() => (window.location.href = "/booking")}
              className="px-6 py-2 bg-[#F59E0B] text-white rounded-lg hover:bg-[#D97706] transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F9F4]">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-[#D1E7DD]">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1
              className="text-2xl font-bold text-[#166534] cursor-pointer"
              onClick={() => (window.location.href = "/")}
            >
              Ubuntu Art Village
            </h1>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-12 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-green-600"
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
            <h1 className="text-3xl font-bold text-white mb-2">
              Booking Confirmed! 🎉
            </h1>
            <p className="text-green-100 text-lg">
              Thank you for booking with Ubuntu Art Village
            </p>
          </div>

          {/* Booking Details */}
          <div className="px-8 py-8">
            <div className="space-y-6">
              {/* Success Message */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[#166534] mb-4">
                  Your Artist Residency is Confirmed!
                </h2>
                <p className="text-[#374151] text-lg mb-4">
                  We've sent a confirmation email with all the details. Your
                  payment has been processed successfully.
                </p>
                {bookingData?.sessionId && (
                  <div className="bg-[#F0F9F4] border border-[#D1E7DD] rounded-lg p-4">
                    <p className="text-sm text-[#6B7280]">
                      <strong>Payment Reference:</strong>{" "}
                      {bookingData.sessionId}
                    </p>
                  </div>
                )}
              </div>

              {/* What's Next */}
              <div className="bg-[#FEF3C7] border border-[#F59E0B] rounded-lg p-6">
                <h3 className="font-semibold text-[#92400E] mb-3 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  What Happens Next?
                </h3>
                <ul className="space-y-2 text-[#92400E]">
                  <li className="flex items-start">
                    <span className="text-[#F59E0B] mr-2">✓</span>
                    You'll receive a detailed confirmation email within 5
                    minutes
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#F59E0B] mr-2">✓</span>
                    For artist residencies, our team will review your
                    application
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#F59E0B] mr-2">✓</span>
                    We'll send you check-in instructions 24 hours before arrival
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#F59E0B] mr-2">✓</span>
                    Your calendar dates are now secured and blocked
                  </li>
                </ul>
              </div>

              {/* Contact Information */}
              <div className="bg-[#F9FAFB] rounded-lg p-6">
                <h3 className="font-semibold text-[#374151] mb-3">
                  Need Help?
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-[#6B7280]">
                  <div>
                    <h4 className="font-medium text-[#374151] mb-1">
                      Contact Us
                    </h4>
                    <p>Email: support@ubuntuartvillage.com</p>
                    <p>Phone: +1 (555) 123-4567</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-[#374151] mb-1">
                      Visit Us
                    </h4>
                    <p>Ubuntu Art Village</p>
                    <p>123 Art Street, Creative District</p>
                    <p>Artist City, AC 12345</p>
                  </div>
                </div>
              </div>

              {/* Important Information */}
              <div className="border border-[#D1E7DD] rounded-lg p-6">
                <h3 className="font-semibold text-[#374151] mb-3">
                  Important Information
                </h3>
                <div className="space-y-3 text-sm text-[#6B7280]">
                  <div>
                    <h4 className="font-medium text-[#374151]">
                      Check-in/Check-out
                    </h4>
                    <p>Check-in: 3:00 PM | Check-out: 11:00 AM</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-[#374151]">
                      Cancellation Policy
                    </h4>
                    <p>
                      Cancellations must be made at least 7 days before check-in
                      for a full refund. Cancellations within 7 days receive a
                      50% refund.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-[#374151]">
                      What to Bring
                    </h4>
                    <p>
                      Art supplies, personal items, and inspiration! We provide
                      basic amenities and workspace.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <button
                  onClick={() => (window.location.href = "/")}
                  className="px-8 py-3 border border-[#D1E7DD] text-[#374151] rounded-lg hover:bg-gray-50 transition"
                >
                  Return Home
                </button>
                <button
                  onClick={() => (window.location.href = "/booking")}
                  className="px-8 py-3 bg-[#F59E0B] text-white rounded-lg hover:bg-[#D97706] transition"
                >
                  Book Another Stay
                </button>
              </div>

              {/* Social Share */}
              <div className="text-center pt-6 border-t border-[#D1E7DD]">
                <p className="text-sm text-[#6B7280] mb-3">
                  Share your upcoming residency with the community!
                </p>
                <div className="flex justify-center space-x-4">
                  <button className="text-blue-600 hover:text-blue-700 transition">
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                    </svg>
                  </button>
                  <button className="text-blue-600 hover:text-blue-700 transition">
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </button>
                  <button className="text-pink-600 hover:text-pink-700 transition">
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.747.099.120.112.225.085.347-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-12.014C24.007 5.367 18.641.001 12.017.001z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
