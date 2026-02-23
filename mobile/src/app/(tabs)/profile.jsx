import { Redirect } from "expo-router";

// The full profile screen lives at app/profile.jsx
// Redirect the tab here to avoid duplicating logic.
export default function ProfileTab() {
  return <Redirect href="/profile" />;
}
