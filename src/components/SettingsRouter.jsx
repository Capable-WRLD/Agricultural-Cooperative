import React from "react";
import { useAuth } from "../context/AuthContext";
import AdminLayout from "./AdminLayout";
import SettingsPage from "../pages/SettingsPage";
import MemberSettings from "../pages/MemberSettings";

export default function SettingsRouter() {
  const { user } = useAuth();

  if (!user) return null;

  if (user.role === "Admin") {
    return (
      <AdminLayout>
        <SettingsPage />
      </AdminLayout>
    );
  }

  return <MemberSettings />;
}
