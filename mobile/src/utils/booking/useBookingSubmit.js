import { useState } from "react";
import { Alert } from "react-native";
import { apiPost } from "../api";

export function useBookingSubmit(
  auth,
  signIn,
  user,
  bookingType,
  selectedRoom,
  selectedStartDate,
  selectedEndDate,
  arrivalTime,
  formData,
  calculateTotalPrice,
  router,
) {
  const [submitting, setSubmitting] = useState(false);

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      Alert.alert("Required Field", "Please enter your full name");
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      Alert.alert("Required Field", "Please enter a valid email address");
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert("Required Field", "Please enter your phone number");
      return false;
    }
    if (!formData.numberOfGuests || parseInt(formData.numberOfGuests) < 1) {
      Alert.alert("Required Field", "Please enter number of guests");
      return false;
    }
    if (bookingType === "artist" && !formData.artistType.trim()) {
      Alert.alert(
        "Required Field",
        "Please tell us what kind of artist you are",
      );
      return false;
    }

    // Validate artist residency duration (1-6 months = 30-180 days)
    if (bookingType === "artist" && selectedStartDate && selectedEndDate) {
      const start = new Date(selectedStartDate);
      const end = new Date(selectedEndDate);
      const durationInDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

      if (durationInDays < 30) {
        Alert.alert(
          "Invalid Duration",
          `Artist residency bookings require a minimum of 1 month (30 days). Your selected duration is ${durationInDays} days. Please extend your stay.`,
        );
        return false;
      }

      if (durationInDays > 180) {
        Alert.alert(
          "Invalid Duration",
          `Artist residency bookings cannot exceed 6 months (180 days). Your selected duration is ${durationInDays} days. Please shorten your stay.`,
        );
        return false;
      }
    }

    return true;
  };

  const handleSubmitBooking = async () => {
    if (!auth) {
      Alert.alert(
        "Sign In Required",
        "Please sign in to complete your booking",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Sign In", onPress: () => signIn() },
        ],
      );
      return;
    }

    // Check email verification
    if (user && user.email_verified === false) {
      Alert.alert(
        "Email Verification Required",
        "Please verify your email address before making a booking. Check your inbox for the verification link.",
        [{ text: "OK" }],
      );
      return;
    }

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const bookingPayload = {
        residencyId: selectedRoom.id,
        startDate: selectedStartDate,
        endDate: selectedEndDate,
        arrivalTime: arrivalTime,
        bookingType: bookingType,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        numberOfGuests: parseInt(formData.numberOfGuests),
        artistType: bookingType === "artist" ? formData.artistType : null,
        totalPrice: calculateTotalPrice(),
      };

      const stripeResponse = await apiPost("/api/stripe-checkout-link", {
        bookingData: bookingPayload,
        userId: user?.id,
        userEmail: formData.email,
        // Use web URLs for Stripe - it requires valid HTTPS URLs
        successUrl: `${process.env.EXPO_PUBLIC_PROXY_BASE_URL || "https://utu-app-for-ubuntu-art-vill-227.created.app"}/booking/success`,
        cancelUrl: `${process.env.EXPO_PUBLIC_PROXY_BASE_URL || "https://utu-app-for-ubuntu-art-vill-227.created.app"}/booking`,
      });

      const stripeData = await stripeResponse.json();

      if (!stripeResponse.ok) {
        throw new Error(stripeData.error || "Failed to create payment session");
      }

      router.push({
        pathname: "/stripe",
        params: { checkoutUrl: stripeData.url },
      });
    } catch (error) {
      console.error("Booking error:", error);
      Alert.alert("Booking Failed", error.message || "Please try again later");
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, handleSubmitBooking };
}
