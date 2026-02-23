import { View } from "react-native";
import { BookingSummary } from "./BookingSummary";
import { BookingForm } from "./BookingForm";

export function BookingFormStep({
  selectedRoom,
  bookingType,
  selectedStartDate,
  selectedEndDate,
  calculateNights,
  calculateTotalPrice,
  formData,
  onFormChange,
  onSubmit,
  submitting,
}) {
  return (
    <View style={{ padding: 20 }}>
      <BookingSummary
        selectedRoom={selectedRoom}
        bookingType={bookingType}
        selectedStartDate={selectedStartDate}
        selectedEndDate={selectedEndDate}
        calculateNights={calculateNights}
        calculateTotalPrice={calculateTotalPrice}
      />

      <BookingForm
        formData={formData}
        onFormChange={onFormChange}
        bookingType={bookingType}
        onSubmit={onSubmit}
        submitting={submitting}
        calculateTotalPrice={calculateTotalPrice}
      />
    </View>
  );
}
