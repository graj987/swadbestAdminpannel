import React, { useState } from "react";
import api from "../api";

export default function Settings() {

  const [general, setGeneral] = useState({
    appName: "SwadBest",
    supportEmail: "support@swadbest.com",
    autoNotify: true,
  });

  const [ui, setUi] = useState({
    theme: "light",
    sidebarCompact: false,
  });

  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleGeneralChange = (e) =>
    setGeneral((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleUiChange = (e) =>
    setUi((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleToggle = (section, key) =>
    section((prev) => ({ ...prev, [key]: !prev[key] }));

  const handlePasswordChange = (e) =>
    setPasswords((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const saveGeneral = () => {
    alert("General settings saved");
  };

  const saveUI = () => {
    alert("UI preferences saved");
  };

  const updatePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword)
      return alert("New password and confirm password do not match");

    try {
      await api.post("/api/admin/change-password", passwords);
      alert("Password updated successfully");
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update password");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">

      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      {/* General Settings */}
      <section className="bg-white p-6 rounded-xl shadow border mb-6">
        <h2 className="text-xl font-semibold mb-4">General Settings</h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Application Name</label>
            <input
              className="w-full border p-3 rounded-lg mt-1"
              name="appName"
              value={general.appName}
              onChange={handleGeneralChange}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Support Email</label>
            <input
              className="w-full border p-3 rounded-lg mt-1"
              name="supportEmail"
              type="email"
              value={general.supportEmail}
              onChange={handleGeneralChange}
            />
          </div>

          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
            <span className="text-sm font-medium">Auto Send Order Notification</span>
            <input
              type="checkbox"
              checked={general.autoNotify}
              onChange={() => handleToggle(setGeneral, "autoNotify")}
            />
          </div>
        </div>

        <button
          onClick={saveGeneral}
          className="mt-5 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Save Changes
        </button>
      </section>

      {/* UI Preferences */}
      <section className="bg-white p-6 rounded-xl shadow border mb-6">
        <h2 className="text-xl font-semibold mb-4">UI Preferences</h2>

        <div className="space-y-4">
          {/* Theme */}
          <div>
            <label className="text-sm font-medium">Theme</label>
            <select
              name="theme"
              value={ui.theme}
              onChange={handleUiChange}
              className="w-full border p-3 rounded-lg mt-1"
            >
              <option value="light">Light Mode</option>
              <option value="dark">Dark Mode</option>
            </select>
          </div>

          {/* Sidebar */}
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
            <span className="text-sm font-medium">Compact Sidebar</span>

            <input
              type="checkbox"
              checked={ui.sidebarCompact}
              onChange={() => handleToggle(setUi, "sidebarCompact")}
            />
          </div>
        </div>

        <button
          onClick={saveUI}
          className="mt-5 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Save UI Preferences
        </button>
      </section>

      {/* Security Settings */}
      <section className="bg-white p-6 rounded-xl shadow border">
        <h2 className="text-xl font-semibold mb-4">Security Settings</h2>

        <div className="space-y-4">

          <div>
            <label className="text-sm font-medium">Old Password</label>
            <input
              className="w-full border p-3 rounded-lg mt-1"
              type="password"
              name="oldPassword"
              value={passwords.oldPassword}
              onChange={handlePasswordChange}
            />
          </div>

          <div>
            <label className="text-sm font-medium">New Password</label>
            <input
              className="w-full border p-3 rounded-lg mt-1"
              type="password"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handlePasswordChange}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Confirm Password</label>
            <input
              className="w-full border p-3 rounded-lg mt-1"
              type="password"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handlePasswordChange}
            />
          </div>
        </div>

        <button
          onClick={updatePassword}
          className="mt-5 px-5 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Update Password
        </button>
      </section>
    </div>
  );
}
