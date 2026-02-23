import { View, Text, TextInput, ActivityIndicator } from "react-native";
import { Calendar } from "react-native-calendars";

export function DateCalendar({
  markedDates,
  onDayPress,
  selectedStartDate,
  selectedEndDate,
  calculateNights,
  calculateTotalPrice,
  arrivalTime,
  onArrivalTimeChange,
  loading,
}) {
  if (loading) {
    return (
      <View style={{ padding: 40, alignItems: "center" }}>
        <ActivityIndicator size="large" color="#22C55E" />
        <Text
          style={{
            color: "#6B7280",
            marginTop: 12,
            fontFamily: "Inter_400Regular",
          }}
        >
          Loading availability...
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#D1E7DD",
        shadowColor: "#22C55E",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <Calendar
        markingType="period"
        markedDates={markedDates}
        onDayPress={onDayPress}
        minDate={new Date().toISOString().split("T")[0]}
        theme={{
          calendarBackground: "#FFFFFF",
          textSectionTitleColor: "#6B7280",
          selectedDayBackgroundColor: "#22C55E",
          selectedDayTextColor: "#FFFFFF",
          todayTextColor: "#F59E0B",
          dayTextColor: "#166534",
          textDisabledColor: "#D1D5DB",
          monthTextColor: "#166534",
          textMonthFontWeight: "bold",
          textDayFontFamily: "Inter_400Regular",
          textMonthFontFamily: "Inter_700Bold",
          textDayHeaderFontFamily: "Inter_600SemiBold",
          arrowColor: "#22C55E",
        }}
      />

      {selectedStartDate && selectedEndDate && (
        <View
          style={{
            marginTop: 16,
            padding: 16,
            backgroundColor: "#F0FDF4",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#BBF7D0",
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_600SemiBold",
              color: "#166534",
              marginBottom: 8,
            }}
          >
            Selected Dates:
          </Text>
          <Text
            style={{
              color: "#6B7280",
              fontFamily: "Inter_400Regular",
              fontSize: 13,
            }}
          >
            Check-in: {selectedStartDate}
          </Text>
          <Text
            style={{
              color: "#6B7280",
              fontFamily: "Inter_400Regular",
              fontSize: 13,
            }}
          >
            Check-out: {selectedEndDate}
          </Text>
          <Text
            style={{
              color: "#F59E0B",
              fontFamily: "Inter_600SemiBold",
              fontSize: 14,
              marginTop: 8,
            }}
          >
            {calculateNights()} nights • ${calculateTotalPrice()} total
          </Text>
        </View>
      )}

      <View style={{ marginTop: 16 }}>
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Inter_600SemiBold",
            color: "#166534",
            marginBottom: 8,
          }}
        >
          Arrival Time
        </Text>
        <TextInput
          value={arrivalTime}
          onChangeText={onArrivalTimeChange}
          placeholder="14:00"
          placeholderTextColor="#9CA3AF"
          style={{
            backgroundColor: "#F9FAFB",
            color: "#166534",
            padding: 14,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#D1E7DD",
            fontFamily: "Inter_400Regular",
            fontSize: 15,
          }}
        />
      </View>
    </View>
  );
}
