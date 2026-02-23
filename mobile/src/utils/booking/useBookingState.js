import { useState, useEffect } from "react";

export function useBookingState(user) {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingType, setBookingType] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [arrivalTime, setArrivalTime] = useState("14:00");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    numberOfGuests: "1",
    artistType: "",
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.name || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  const handleTypeSelection = (type) => {
    setBookingType(type);
    setCurrentStep(2);
  };

  const handleRoomSelection = (room) => {
    setSelectedRoom(room);
  };

  const handleBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setBookingType(null);
    setSelectedRoom(null);
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    setFormData({
      fullName: user?.name || "",
      email: user?.email || "",
      phone: "",
      numberOfGuests: "1",
      artistType: "",
    });
  };

  const handleContinueToForm = () => {
    setCurrentStep(3);
  };

  return {
    currentStep,
    setCurrentStep,
    bookingType,
    setBookingType,
    selectedRoom,
    setSelectedRoom,
    selectedStartDate,
    setSelectedStartDate,
    selectedEndDate,
    setSelectedEndDate,
    arrivalTime,
    setArrivalTime,
    formData,
    setFormData,
    handleTypeSelection,
    handleRoomSelection,
    handleBackStep,
    handleReset,
    handleContinueToForm,
  };
}
