import { View, Text } from "react-native";

export function UnsavedChangesWarning({ hasChanges }) {
  if (!hasChanges) return null;

  return (
    <View
      style={{
        backgroundColor: "#FEF3C7",
        borderRadius: 12,
        padding: 16,
        marginTop: 20,
        borderWidth: 1,
        borderColor: "#FCD34D",
      }}
    >
      <Text
        style={{
          fontSize: 14,
          fontFamily: "Inter_500Medium",
          color: "#92400E",
          textAlign: "center",
        }}
      >
        You have unsaved changes
      </Text>
    </View>
  );
}
