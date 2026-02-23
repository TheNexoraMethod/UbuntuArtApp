export function useBookingCalculations(
  selectedRoom,
  selectedStartDate,
  selectedEndDate,
  user = null,
) {
  const calculateNights = () => {
    if (!selectedStartDate || !selectedEndDate) return 0;
    const start = new Date(selectedStartDate);
    const end = new Date(selectedEndDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateTotalPrice = () => {
    if (!selectedRoom || !selectedStartDate || !selectedEndDate) return 0;
    const nights = calculateNights();
    const pricePerNight = selectedRoom.pricing_config?.price_per_night || 100;
    let totalPrice = nights * pricePerNight;

    // Apply 10% member discount if user has active membership
    const hasActiveMembership =
      user?.membership_status === "active" ||
      user?.subscription_status === "active";

    if (hasActiveMembership) {
      totalPrice = totalPrice * 0.9; // Apply 10% discount
    }

    return totalPrice;
  };

  const hasDiscount = () => {
    return (
      user?.membership_status === "active" ||
      user?.subscription_status === "active"
    );
  };

  return { calculateNights, calculateTotalPrice, hasDiscount };
}
