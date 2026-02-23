import React from "react";
import { Stack } from "expo-router";
import AdminAuthGuard from "./AdminAuthGuard.jsx";

export default function AdminLayout() {
  return (
    <AdminAuthGuard>
      <Stack screenOptions={{ headerShown: true, title: "Admin" }} />
    </AdminAuthGuard>
  );
}
