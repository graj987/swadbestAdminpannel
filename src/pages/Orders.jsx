import React, { useEffect, useState } from "react";
import api from "../api";

import {
  Search,
  Eye,
  Truck,
  FileText,
  Barcode,
  PackageX,
} from "lucide-react";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import { Separator } from "@/Components/ui/separator";

/* ---------------- AUTH ---------------- */

const auth = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
});

/* ---------------- HELPERS ---------------- */

const price = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

const statusColor = {
  placed: "bg-gray-100 text-gray-700",
  preparing: "bg-blue-100 text-blue-700",
  shipped: "bg-orange-100 text-orange-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  /* ---------------- LOAD ---------------- */

  const loadOrders = async () => {
    const res = await api.get("/api/admin/orders", auth());
    setOrders(res.data.orders || res.data || []);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  /* ---------------- SHIPROCKET ACTIONS ---------------- */

  const generateAWB = async (orderId) => {
    await api.post(`/api/shiprocket/order/${orderId}/awb`, {}, auth());
    loadOrders();
  };

  const generateLabel = async (shipmentId) => {
    const res = await api.get(`/api/shiprocket/label/${shipmentId}`, auth());
    if (res.data?.labelUrl) window.open(res.data.labelUrl, "_blank");
  };

  const cancelShipment = async (orderId) => {
    if (!confirm("Cancel / RTO this shipment?")) return;
    await api.post(`/api/shiprocket/order/${orderId}/cancel`, {}, auth());
    loadOrders();
  };

  const trackShipment = (awb) => {
    window.open(`/admin/track/${awb}`, "_blank");
  };

  /* ---------------- FILTER ---------------- */

  const filteredOrders = orders.filter((o) => {
    const q = query.toLowerCase();

    const matchSearch =
      o._id.toLowerCase().includes(q) ||
      o.user?.name?.toLowerCase().includes(q);

    const matchStatus =
      statusFilter === "all" || o.orderStatus === statusFilter;

    return matchSearch && matchStatus;
  });

  /* ================= RENDER ================= */

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <h1 className="text-3xl font-bold">Manage Orders</h1>

      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Orders</CardTitle>

          <div className="flex gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                className="pl-9"
                placeholder="Search order or customer"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="placed">Placed</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredOrders.map((o) => {
                const shipmentId = o.shipping?.shipmentId;
                const awb = o.shipping?.awb;
                const shipStatus = o.shipping?.status;

                const canCancel =
                  awb &&
                  !["in_transit", "out_for_delivery", "delivered"].includes(
                    shipStatus
                  );

                return (
                  <TableRow key={o._id}>
                    <TableCell className="font-medium">
                      {o.orderNumber || o._id.slice(-8)}
                    </TableCell>

                    <TableCell>{o.user?.name || "User"}</TableCell>

                    <TableCell>{price(o.totalAmount)}</TableCell>

                    <TableCell>
                      <Badge className={statusColor[o.orderStatus]}>
                        {o.orderStatus}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedOrder(o);
                          setDetailsOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      {shipmentId && !awb && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generateAWB(o._id)}
                        >
                          <Barcode className="w-4 h-4" />
                        </Button>
                      )}

                      {awb && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => trackShipment(awb)}
                          >
                            <Truck className="w-4 h-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generateLabel(shipmentId)}
                          >
                            <FileText className="w-4 h-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={!canCancel}
                            onClick={() => cancelShipment(o._id)}
                          >
                            <PackageX className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ================= DETAILS DIALOG ================= */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Complete information about this order
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-2 text-sm">
              <p><b>Order:</b> {selectedOrder.orderNumber}</p>
              <p><b>Customer:</b> {selectedOrder.user?.name}</p>
              <p><b>Email:</b> {selectedOrder.user?.email}</p>

              <Separator />

              <p><b>Amount:</b> {price(selectedOrder.totalAmount)}</p>
              <p><b>Status:</b> {selectedOrder.orderStatus}</p>

              {selectedOrder.shipping?.awb && (
                <p><b>AWB:</b> {selectedOrder.shipping.awb}</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
