import { View, Text } from "react-native";

export function MembershipDetails({ user }) {
  // Debug logging
  console.log(
    "MembershipDetails - subscription_status:",
    user?.subscription_status,
  );
  console.log(
    "MembershipDetails - membership_status:",
    user?.membership_status,
  );

  // Only show membership details if user has TRULY active subscription
  const hasActiveMembership =
    user?.subscription_status === "active" &&
    user?.membership_status !== "inactive";

  if (!hasActiveMembership) {
    console.log("MembershipDetails - Not showing (no active membership)");
    return null;
  }

  console.log("MembershipDetails - Showing membership details");

  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#D1E7DD",
        shadowColor: "#22C55E",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      }}
    >
      <Text
        style={{
          fontSize: 16,
          fontFamily: "Inter_600SemiBold",
          color: "#166534",
          marginBottom: 12,
        }}
      >
        Membership Details
      </Text>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Inter_400Regular",
            color: "#6B7280",
          }}
        >
          Member Number
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Inter_500Medium",
            color: "#374151",
          }}
        >
          {user?.membership_number || "N/A"}
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Inter_400Regular",
            color: "#6B7280",
          }}
        >
          Status
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Inter_500Medium",
            color: "#059669",
          }}
        >
          Active
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Inter_400Regular",
            color: "#6B7280",
          }}
        >
          Member Since
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Inter_500Medium",
            color: "#374151",
          }}
        >
          {user?.joined_date
            ? new Date(user.joined_date).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })
            : "N/A"}
        </Text>
      </View>
    </View>
  );
}
