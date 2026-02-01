import React, { useState } from "react";
import api from "../api";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { Bell, Lock, User, Palette } from "lucide-react";
import Profile from "./Profile";

export default function Settings() {
  /* ---------------- STATE ---------------- */

  const [general, setGeneral] = useState({
    appName: "SwadBest",
    supportEmail: "support@swadbest.com",
    autoNotify: true,
  });

  const [ui, setUi] = useState({
    theme: "light",
    compactSidebar: false,
  });

  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  /* ---------------- HANDLERS ---------------- */

  const handleGeneralChange = (e) =>
    setGeneral((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleUiToggle = (key) =>
    setUi((p) => ({ ...p, [key]: !p[key] }));

  const handlePasswordChange = (e) =>
    setPasswords((p) => ({ ...p, [e.target.name]: e.target.value }));

  /* ---------------- ACTIONS ---------------- */

  const saveGeneral = async () => {
    // Backend hook ready
    // await api.post("/api/admin/settings/general", general);
    alert("General settings saved");
  };

  const saveUI = async () => {
    // Backend hook ready
    // await api.post("/api/admin/settings/ui", ui);
    alert("UI preferences saved");
  };

  const updatePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      return alert("Passwords do not match");
    }

    try {
      await api.post("/api/admin/change-password", passwords);
      alert("Password updated successfully");
      setPasswords({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update password");
    }
  };

  /* ================= RENDER ================= */

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage your application and account preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">
            Profile
          </TabsTrigger>
          <TabsTrigger value="general">
            <User className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="w-4 h-4 mr-2" />
            Appearance
          </TabsTrigger>
        </TabsList>

        {/* ================= GENERAL ================= */}
        <TabsContent value="profile">
            <Profile />
          </TabsContent>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <p className="text-sm text-gray-500">
                Application-wide configuration
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Application Name</Label>
                <Input
                  name="appName"
                  value={general.appName}
                  onChange={handleGeneralChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Support Email</Label>
                <Input
                  type="email"
                  name="supportEmail"
                  value={general.supportEmail}
                  onChange={handleGeneralChange}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto Order Notifications</p>
                  <p className="text-sm text-gray-500">
                    Automatically notify users on order updates
                  </p>
                </div>
                <Switch
                  checked={general.autoNotify}
                  onCheckedChange={() =>
                    setGeneral((p) => ({
                      ...p,
                      autoNotify: !p.autoNotify,
                    }))
                  }
                />
              </div>

              <Button onClick={saveGeneral}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================= NOTIFICATIONS ================= */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <p className="text-sm text-gray-500">
                Control how notifications are sent
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-500">
                    Receive important emails
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Weekly Summary</p>
                  <p className="text-sm text-gray-500">
                    Weekly activity summary
                  </p>
                </div>
                <Switch />
              </div>

              <Button>Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================= SECURITY ================= */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <p className="text-sm text-gray-500">
                Keep your account secure
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input
                  type="password"
                  name="oldPassword"
                  value={passwords.oldPassword}
                  onChange={handlePasswordChange}
                />
              </div>

              <div className="space-y-2">
                <Label>New Password</Label>
                <Input
                  type="password"
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={passwords.confirmPassword}
                  onChange={handlePasswordChange}
                />
              </div>

              <Button variant="destructive" onClick={updatePassword}>
                Update Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================= APPEARANCE ================= */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <p className="text-sm text-gray-500">
                Customize dashboard look & feel
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-gray-500">
                    Toggle dark theme
                  </p>
                </div>
                <Switch
                  checked={ui.theme === "dark"}
                  onCheckedChange={() =>
                    setUi((p) => ({
                      ...p,
                      theme: p.theme === "dark" ? "light" : "dark",
                    }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Compact Sidebar</p>
                  <p className="text-sm text-gray-500">
                    Reduce sidebar width
                  </p>
                </div>
                <Switch
                  checked={ui.compactSidebar}
                  onCheckedChange={() =>
                    handleUiToggle("compactSidebar")
                  }
                />
              </div>

              <Button onClick={saveUI}>Save Appearance</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
