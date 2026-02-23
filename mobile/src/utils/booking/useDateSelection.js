import { Alert } from "react-native";

export function useDateSelection(
  unavailableDates,
  selectedStartDate,
  setSelectedStartDate,
  selectedEndDate,
  setSelectedEndDate,
) {
  const handleDateSelect = (day) => {
    const dateString = day.dateString;

    if (unavailableDates[dateString]) {
      Alert.alert(
        "Date Unavailable",
        "This date is already booked. Please select another date.",
      );
      return;
    }

    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      setSelectedStartDate(dateString);
      setSelectedEndDate(null);
    } else if (selectedStartDate && !selectedEndDate) {
      if (dateString < selectedStartDate) {
        Alert.alert("Invalid Selection", "End date must be after start date.");
        return;
      }

      const start = new Date(selectedStartDate);
      const end = new Date(dateString);
      let currentDate = new Date(start);

      while (currentDate <= end) {
        const checkDate = currentDate.toISOString().split("T")[0];
        if (unavailableDates[checkDate]) {
          Alert.alert(
            "Date Range Unavailable",
            "Some dates in this range are already booked. Please select a different range.",
          );
          setSelectedStartDate(null);
          setSelectedEndDate(null);
          return;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      setSelectedEndDate(dateString);
    }
  };

  const getMarkedDates = () => {
    const marked = { ...unavailableDates };

    if (selectedStartDate && !selectedEndDate) {
      marked[selectedStartDate] = {
        selected: true,
        color: "#22C55E",
        textColor: "#FFFFFF",
      };
    } else if (selectedStartDate && selectedEndDate) {
      const start = new Date(selectedStartDate);
      const end = new Date(selectedEndDate);
      let currentDate = new Date(start);

      while (currentDate <= end) {
        const dateString = currentDate.toISOString().split("T")[0];

        if (dateString === selectedStartDate) {
          marked[dateString] = {
            startingDay: true,
            color: "#22C55E",
            textColor: "#FFFFFF",
          };
        } else if (dateString === selectedEndDate) {
          marked[dateString] = {
            endingDay: true,
            color: "#22C55E",
            textColor: "#FFFFFF",
          };
        } else {
          marked[dateString] = {
            color: "#BBF7D0",
            textColor: "#166534",
          };
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    return marked;
  };

  return { handleDateSelect, getMarkedDates };
}
