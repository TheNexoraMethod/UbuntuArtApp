import { View, Text, TouchableOpacity, Alert } from "react-native";
import { ArrowRight } from "lucide-react-native";
import { RoomCard } from "./RoomCard";
import { DateCalendar } from "./DateCalendar";

export function RoomAndDateSelection({
  bookingType,
  rooms,
  selectedRoom,
  onRoomSelect,
  markedDates,
  onDayPress,
  selectedStartDate,
  selectedEndDate,
  calculateNights,
  calculateTotalPrice,
  arrivalTime,
  onArrivalTimeChange,
  loadingCalendar,
  onContinue,
}) {
  const handleContinue = () => {
    if (!selectedRoom || !selectedStartDate || !selectedEndDate) {
      Alert.alert("Incomplete Selection", "Please select a room and dates.");
      return;
    }
    onContinue();
  };

  return (
    <View style={{ padding: 20 }}>
      <View
        style={{
          backgroundColor: bookingType === "artist" ? "#F59E0B" : "#22C55E",
          alignSelf: "center",
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 20,
          marginBottom: 24,
        }}
      >
        <Text
          style={{
            color: "#FFFFFF",
            fontFamily: "Inter_600SemiBold",
            fontSize: 14,
          }}
        >
          {bookingType === "artist" ? "🎨 Artist Residency" : "👤 Guest Stay"}
        </Text>
      </View>

      <Text
        style={{
          fontSize: 18,
          fontFamily: "Inter_700Bold",
          color: "#166534",
          marginBottom: 16,
        }}
      >
        Select Your Room
      </Text>

      {rooms.map((room) => (
        <RoomCard
          key={room.id}
          room={room}
          isSelected={selectedRoom?.id === room.id}
          onSelect={onRoomSelect}
        />
      ))}

      {selectedRoom && (
        <View style={{ marginTop: 24 }}>
          <Text
            style={{
              fontSize: 18,
              fontFamily: "Inter_700Bold",
              color: "#166534",
              marginBottom: 16,
            }}
          >
            Select Your Dates
          </Text>

          <DateCalendar
            markedDates={markedDates}
            onDayPress={onDayPress}
            selectedStartDate={selectedStartDate}
            selectedEndDate={selectedEndDate}
            calculateNights={calculateNights}
            calculateTotalPrice={calculateTotalPrice}
            arrivalTime={arrivalTime}
            onArrivalTimeChange={onArrivalTimeChange}
            loading={loadingCalendar}
          />

          {selectedStartDate && selectedEndDate && (
            <TouchableOpacity
              onPress={handleContinue}
              style={{
                backgroundColor: "#22C55E",
                borderRadius: 16,
                padding: 18,
                marginTop: 24,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#22C55E",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 16,
                  fontFamily: "Inter_700Bold",
                  marginRight: 8,
                }}
              >
                Continue to Booking Details
              </Text>
              <ArrowRight size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}
