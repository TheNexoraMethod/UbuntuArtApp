import { useState, useEffect } from "react";
import { apiRequest } from "@/utils/api";

export function useRoomAvailability(selectedRoom) {
  const [unavailableDates, setUnavailableDates] = useState({});
  const [loadingCalendar, setLoadingCalendar] = useState(false);

  useEffect(() => {
    if (selectedRoom) {
      fetchRoomAvailability(selectedRoom.id);
    }
  }, [selectedRoom]);

  const fetchRoomAvailability = async (roomId) => {
    setLoadingCalendar(true);
    try {
      const response = await apiRequest(`/api/calendar?residencyId=${roomId}`);
      if (response.ok) {
        const data = await response.json();

        const markedDates = {};
        [...(data.bookedDates || []), ...(data.blockedDates || [])].forEach(
          (dateObj) => {
            markedDates[dateObj.date] = {
              disabled: true,
              disableTouchEvent: true,
              color: "#FECACA",
              textColor: "#991B1B",
            };
          },
        );

        setUnavailableDates(markedDates);
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
    } finally {
      setLoadingCalendar(false);
    }
  };

  return { unavailableDates, loadingCalendar };
}
