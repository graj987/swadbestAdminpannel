// src/pages/Users.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

import { Search, MoreVertical, UserPlus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";

/* ---------------- HELPERS ---------------- */

const avatarColors = [
  "bg-gradient-to-br from-blue-500 to-blue-600",
  "bg-gradient-to-br from-purple-500 to-purple-600",
  "bg-gradient-to-br from-pink-500 to-pink-600",
  "bg-gradient-to-br from-green-500 to-green-600",
  "bg-gradient-to-br from-orange-500 to-orange-600",
  "bg-gradient-to-br from-indigo-500 to-indigo-600",
];

export default function Users() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const authHeader = () => {
    const token = localStorage.getItem("adminToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  /* ---------------- FETCH USERS ---------------- */

  useEffect(() => {
    let active = true;

    const loadUsers = async () => {
      try {
        const res = await api.get("/api/admin/users", {
          headers: authHeader(),
        });

        if (!active) return;

        const arr = Array.isArray(res.data.users)
          ? res.data.users
          : Array.isArray(res.data)
          ? res.data
          : [];

        setUsers(arr);
      } catch (err) {
        if (err?.response?.status === 401) {
          localStorage.removeItem("adminToken");
          setError("Session expired. Redirecting…");
          setTimeout(() => navigate("/admin/login"), 1000);
          return;
        }

        console.error("User fetch error:", err);
        setError("Failed to fetch users");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadUsers();
    return () => (active = false);
  }, [navigate]);

  /* ---------------- FILTER ---------------- */

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ---------------- STATS ---------------- */

  const totalUsers = users.length;
  const verifiedUsers = users.filter((u) => u.isVerified).length;
  const codEligible = users.filter((u) => u.codEligible).length;
  const rtoRisk = users.filter((u) => u.rtoCount > 2).length;

  /* ---------------- LOADING ---------------- */

  if (loading)
    return (
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6 space-y-3">
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-8 bg-muted rounded w-1/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );

  if (error)
    return (
      <p className="text-center p-6 text-destructive font-medium">
        {error}
      </p>
    );

  /* ================= RENDER ================= */

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor user accounts
          </p>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Users</p>
            <p className="text-2xl font-bold mt-1">{totalUsers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Verified</p>
            <p className="text-2xl font-bold mt-1">{verifiedUsers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">COD Eligible</p>
            <p className="text-2xl font-bold mt-1">{codEligible}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">High RTO Risk</p>
            <p className="text-2xl font-bold mt-1">{rtoRisk}</p>
          </CardContent>
        </Card>
      </div>

      {/* USERS TABLE */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>All Users</CardTitle>

            <div className="relative sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users…"
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>COD</TableHead>
                  <TableHead>RTO</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredUsers.map((user, index) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                            avatarColors[index % avatarColors.length]
                          }`}
                        >
                          {user.name?.[0]?.toUpperCase() || "U"}
                        </div>

                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          user.isVerified
                            ? "bg-green-100 text-green-700 border-green-200"
                            : "bg-yellow-100 text-yellow-700 border-yellow-200"
                        }
                      >
                        {user.isVerified ? "Verified" : "Unverified"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          user.codEligible
                            ? "bg-blue-100 text-blue-700 border-blue-200"
                            : "bg-gray-100 text-gray-700 border-gray-200"
                        }
                      >
                        {user.codEligible ? "Allowed" : "Blocked"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          user.rtoCount > 2
                            ? "bg-red-100 text-red-700 border-red-200"
                            : "bg-gray-100 text-gray-700 border-gray-200"
                        }
                      >
                        {user.rtoCount}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>

                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground py-8"
                    >
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
