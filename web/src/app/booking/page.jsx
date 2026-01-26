"use client";

import { useState, useEffect } from "react";

export default function BookingPage() {
  const [user, setUser] = useState(null);
  const [residencies, setResidencies] = useState([]);
  const [selectedResidency, setSelectedResidency] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [bookingType, setBookingType] = useState("guest");
  const [userApplication, setUserApplication] = useState(null);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Base pricing: $150 per night per room
  const pricePerNight = 150;

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedResidency) {
      loadAvailability();
    }
  }, [selectedResidency]);

  useEffect(() => {
    if (startDate && endDate) {
      loadAvailability();
    }
  }, [selectedResidency, startDate, endDate]);

  const loadInitialData = async () => {
    try {
      // Get user from localStorage (adjust based on your auth system)
      const userData = JSON.parse(localStorage.getItem("user") || "null");
      setUser(userData);

      // Load residencies
      const residenciesResponse = await fetch("/api/residencies");
      const residenciesData = await residenciesResponse.json();
      setResidencies(residenciesData.residencies || []);

      // If user exists, check for existing application
      if (userData) {
        const applicationResponse = await fetch(
          `/api/applications?userId=${userData.id}&userRole=${userData.user_role || "user"}`,
        );
        const applicationData = await applicationResponse.json();
        if (
          applicationData.applications &&
          applicationData.applications.length > 0
        ) {
          setUserApplication(applicationData.applications[0]);
        }
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
      setError("Failed to load booking data");
    } finally {
      setLoading(false);
    }
  };

  const loadAvailability = async () => {
    if (!selectedResidency) return;

    try {
      const response = await fetch(
        `/api/calendar?residencyId=${selectedResidency.id}`,
      );
      const data = await response.json();

      const unavailable = [
        ...data.bookedDates.map((d) => d.date),
        ...data.blockedDates.map((d) => d.date),
      ];

      setUnavailableDates(unavailable);
    } catch (error) {
      console.error("Error loading availability:", error);
    }
  };

  const calculateNights = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDurationInMonths = () => {
    const days = calculateNights();
    return (days / 30).toFixed(1);
  };

  const isValidArtistDuration = () => {
    if (bookingType !== "artist") return true;
    const days = calculateNights();
    return days >= 30 && days <= 180;
  };

  const getArtistDurationMessage = () => {
    if (bookingType !== "artist") return null;
    const days = calculateNights();
    const months = getDurationInMonths();

    if (days === 0) {
      return {
        type: "info",
        message: "Artist residencies require 1-6 months (30-180 days)",
      };
    }
    if (days < 30) {
      return {
        type: "error",
        message: `Your booking is ${days} days (${months} months). Minimum 1 month (30 days) required for artist residency.`,
      };
    }
    if (days > 180) {
      return {
        type: "error",
        message: `Your booking is ${days} days (${months} months). Maximum 6 months (180 days) allowed for artist residency.`,
      };
    }
    return {
      type: "success",
      message: `✓ Valid artist residency duration: ${days} days (${months} months)`,
    };
  };

  const calculatePricing = () => {
    const nights = calculateNights();
    if (nights === 0) return { basePrice: 0, total: 0, nights: 0 };

    const basePrice = nights * pricePerNight;

    return {
      basePrice,
      total: basePrice,
      nights,
    };
  };

  const handleBookingTypeChange = (type) => {
    setBookingType(type);
    if (type === "artist" && !userApplication) {
      // Navigate to application page
      window.location.href = "/application";
      return;
    }
  };

  const handleSubmitBooking = async () => {
    if (!user) {
      window.location.href = "/account/signin?callbackUrl=/booking";
      return;
    }

    // Check email verification
    if (user.email_verified === false) {
      setError(
        "Email verification required. Please verify your email address before making a booking. Check your inbox for the verification link.",
      );
      return;
    }

    if (!selectedResidency || !startDate || !endDate || pricing.nights === 0) {
      setError("Please complete all booking details");
      return;
    }

    if (bookingType === "artist" && !userApplication) {
      setError("Artist residency requires an approved application");
      return;
    }

    // Validate artist residency duration
    if (bookingType === "artist" && !isValidArtistDuration()) {
      const days = calculateNights();
      if (days < 30) {
        setError(
          `Artist residency requires minimum 1 month (30 days). Your selected duration is ${days} days.`,
        );
      } else if (days > 180) {
        setError(
          `Artist residency cannot exceed 6 months (180 days). Your selected duration is ${days} days.`,
        );
      }
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const pricing = calculatePricing();
      const bookingData = {
        residencyId: selectedResidency.id,
        startDate,
        endDate,
        stayDuration: `${calculateNights()} nights`,
        hasExtraGuest: numberOfGuests > 1,
        bookingType,
        applicationId: userApplication?.id,
      };

      // Create Stripe checkout session
      const stripeResponse = await fetch("/api/stripe-checkout-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingData,
          userId: user.id,
          userEmail: user.email,
          successUrl: `${window.location.origin}/booking/success`,
          cancelUrl: `${window.location.origin}/booking`,
        }),
      });

      const stripeData = await stripeResponse.json();

      if (!stripeResponse.ok) {
        throw new Error(stripeData.error || "Failed to create payment session");
      }

      // Redirect to Stripe checkout
      window.location.href = stripeData.url;
    } catch (error) {
      console.error("Booking submission error:", error);
      setError(error.message || "Failed to process booking");
      setSubmitting(false);
    }
  };

  const isDateUnavailable = (date) => {
    return unavailableDates.includes(date);
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F9F4] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#166534]"></div>
          <p className="mt-4 text-[#166534] font-medium">
            Loading booking system...
          </p>
        </div>
      </div>
    );
  }

  const pricing = calculatePricing();

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
            <div className="flex space-x-4">
              {user ? (
                <span className="text-[#374151]">Welcome, {user.name}</span>
              ) : (
                <button
                  onClick={() =>
                    (window.location.href =
                      "/account/signin?callbackUrl=/booking")
                  }
                  className="px-4 py-2 text-[#374151] hover:text-[#166534] transition"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#166534] mb-4">
            Book Your Stay
          </h2>
          <p className="text-[#374151] text-lg">
            Choose your room and dates for an inspiring creative retreat in
            Zanzibar.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Type Selection */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-[#D1E7DD]">
              <h3 className="text-xl font-semibold text-[#166534] mb-4">
                Booking Type
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleBookingTypeChange("guest")}
                  className={`p-4 rounded-lg border-2 text-left transition ${
                    bookingType === "guest"
                      ? "border-[#F59E0B] bg-[#FEF3C7]"
                      : "border-[#D1E7DD] bg-white hover:bg-gray-50"
                  }`}
                >
                  <h4 className="font-semibold text-[#166534]">
                    🏠 Guest Stay
                  </h4>
                  <p className="text-sm text-[#6B7280] mt-1">
                    Regular accommodation booking
                  </p>
                </button>
                <button
                  onClick={() => handleBookingTypeChange("artist")}
                  className={`p-4 rounded-lg border-2 text-left transition ${
                    bookingType === "artist"
                      ? "border-[#F59E0B] bg-[#FEF3C7]"
                      : "border-[#D1E7DD] bg-white hover:bg-gray-50"
                  }`}
                >
                  <h4 className="font-semibold text-[#166534]">
                    🎨 Artist Residency
                  </h4>
                  <p className="text-sm text-[#6B7280] mt-1">
                    Creative residency program
                    {!userApplication && (
                      <span className="block text-[#F59E0B] font-medium">
                        Application required
                      </span>
                    )}
                  </p>
                </button>
              </div>
            </div>

            {/* Room Selection */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-[#D1E7DD]">
              <h3 className="text-xl font-semibold text-[#166534] mb-4">
                Select Room
              </h3>
              <div className="grid gap-4">
                {residencies.map((residency) => (
                  <button
                    key={residency.id}
                    onClick={() => setSelectedResidency(residency)}
                    className={`p-4 rounded-lg border-2 text-left transition ${
                      selectedResidency?.id === residency.id
                        ? "border-[#F59E0B] bg-[#FEF3C7]"
                        : "border-[#D1E7DD] bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-[#166534] text-lg mb-1">
                          {residency.title}
                        </h4>
                        <p className="text-sm text-[#6B7280] mb-2">
                          {residency.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {residency.amenities &&
                            residency.amenities
                              .slice(0, 4)
                              .map((amenity, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded"
                                >
                                  {amenity}
                                </span>
                              ))}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="font-bold text-[#166534] text-xl">
                          ${pricePerNight}
                        </div>
                        <span className="text-xs text-[#6B7280]">
                          per night
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Selection */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-[#D1E7DD]">
              <h3 className="text-xl font-semibold text-[#166534] mb-4">
                Select Dates
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    min={getTomorrowDate()}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-[#D1E7DD] rounded-lg focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B]"
                  />
                  <p className="text-xs text-[#6B7280] mt-1">
                    Check-in: 3:00 PM
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    min={startDate || getTomorrowDate()}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-[#D1E7DD] rounded-lg focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B]"
                  />
                  <p className="text-xs text-[#6B7280] mt-1">
                    Check-out: 12:00 PM
                  </p>
                </div>
              </div>
              {calculateNights() > 0 && (
                <div className="mt-3 text-sm text-[#166534] font-medium">
                  {calculateNights()} night{calculateNights() > 1 ? "s" : ""}{" "}
                  selected
                </div>
              )}
            </div>

            {/* Number of Guests */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-[#D1E7DD]">
              <h3 className="text-xl font-semibold text-[#166534] mb-4">
                Number of Guests
              </h3>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">
                  How many guests? (Max 2 per room)
                </label>
                <select
                  value={numberOfGuests}
                  onChange={(e) => setNumberOfGuests(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-[#D1E7DD] rounded-lg focus:ring-2 focus:ring-[#F59E0B] focus:border-[#F59E0B]"
                >
                  <option value={1}>1 Guest</option>
                  <option value={2}>2 Guests</option>
                </select>
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-[#D1E7DD] sticky top-8">
              <h3 className="text-xl font-semibold text-[#166534] mb-4">
                Booking Summary
              </h3>

              {selectedResidency && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-[#374151]">
                      {selectedResidency.title}
                    </h4>
                    <p className="text-sm text-[#6B7280]">
                      Room for {numberOfGuests}{" "}
                      {numberOfGuests > 1 ? "guests" : "guest"}
                    </p>
                  </div>

                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span>Check-in:</span>
                      <span>{startDate || "Select date"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Check-out:</span>
                      <span>{endDate || "Select date"}</span>
                    </div>
                    {pricing.nights > 0 && (
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span>
                          {pricing.nights} night{pricing.nights > 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Booking type:</span>
                      <span className="capitalize">{bookingType}</span>
                    </div>
                  </div>

                  <div className="border-t border-[#D1E7DD] pt-4 space-y-2">
                    {pricing.nights > 0 && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span>
                            ${pricePerNight} × {pricing.nights} night
                            {pricing.nights > 1 ? "s" : ""}
                          </span>
                          <span>${pricing.basePrice}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t border-[#D1E7DD] pt-2">
                          <span>Total:</span>
                          <span className="text-[#166534]">
                            ${pricing.total}
                          </span>
                        </div>
                        <p className="text-xs text-[#6B7280]">
                          ✓ Breakfast included
                        </p>
                      </>
                    )}
                  </div>

                  <button
                    onClick={handleSubmitBooking}
                    disabled={
                      submitting ||
                      !selectedResidency ||
                      !startDate ||
                      !endDate ||
                      pricing.nights === 0 ||
                      (user && user.email_verified === false) ||
                      (bookingType === "artist" && !isValidArtistDuration())
                    }
                    className="w-full px-4 py-3 bg-[#F59E0B] text-white font-semibold rounded-lg hover:bg-[#D97706] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting
                      ? "Processing..."
                      : user && user.email_verified === false
                        ? "Verify Email to Book"
                        : bookingType === "artist" && !isValidArtistDuration()
                          ? "Invalid Duration"
                          : pricing.total > 0
                            ? `Book Now - $${pricing.total}`
                            : "Select Dates to Continue"}
                  </button>

                  <p className="text-xs text-[#6B7280] text-center">
                    You'll be redirected to secure payment
                  </p>
                </div>
              )}

              {!selectedResidency && (
                <p className="text-[#6B7280] text-center">
                  Select a room to see pricing details
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
