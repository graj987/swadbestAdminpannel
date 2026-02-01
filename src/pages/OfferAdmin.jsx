import React from "react";
import { useEffect, useState } from "react";
import api from "../api";
import useAuth from "@/Hooks/useAuth";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Trash2, Power } from "lucide-react";

/* ================= DEFAULT FORM ================= */
const emptyForm = {
  title: "",
  subtitle: "",
  image: "",
  product: "",
  discountType: "percentage",
  discountValue: "",
  startTime: "",
  endTime: "",
  type: "flash",
};

export default function OffersAdmin() {
  const { getAuthHeader } = useAuth();

  const [offers, setOffers] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ================= LOAD ================= */
  // Load offers and products
  const loadData = async () => {
    try {
      const [offersRes, productsRes] = await Promise.all([
        api.get("/api/offers/all", { headers: getAuthHeader() }),
        api.get("/api/products"),
      ]);

      setOffers(offersRes.data.data || []);
      setProducts(productsRes.data || []);
    } catch {
      setError("Failed to load offers");
    }
  };

useEffect(() => {
  const loadData = async () => {
    try {
      const [offersRes, productsRes] = await Promise.all([
        api.get("/api/offers/all", { headers: getAuthHeader() }),
        api.get("/api/products"),
      ]);

      setOffers(offersRes.data.data || []);
      setProducts(productsRes.data || []);
    } catch {
      setError("Failed to load offers");
    }
  };

  loadData();
}, [getAuthHeader]); // ✅ EMPTY dependency array


  /* ================= CREATE ================= */
  const createOffer = async () => {
    setError("");

    if (!form.title || !form.image || !form.product || !form.discountValue) {
      setError("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      await api.post("/api/offers", form, {
        headers: getAuthHeader(),
      });

      setForm(emptyForm);
      loadData();
    } catch {
      setError("Failed to create offer");
    } finally {
      setLoading(false);
    }
  };

  /* ================= TOGGLE ================= */
  const toggleOffer = async (id) => {
    await api.patch(
      `/api/offers/${id}/toggle`,
      {},
      { headers: getAuthHeader() }
    );
    loadData();
  };

  /* ================= DELETE ================= */
  const deleteOffer = async (id) => {
    if (!confirm("Delete this offer permanently?")) return;
    await api.delete(`/api/offers/${id}`, {
      headers: getAuthHeader(),
    });
    loadData();
  };

  /* ================= UI ================= */
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Offers Management</h1>
        <p className="text-muted-foreground">
          Flash sales & latest offers control
        </p>
      </div>

      {/* CREATE OFFER */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Offer</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <Input
            placeholder="Title *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <Input
            placeholder="Subtitle"
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
          />

          <Input
            placeholder="Image URL *"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
          />

          <Select
            value={form.product}
            onValueChange={(v) => setForm({ ...form, product: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select product *" />
            </SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p._id} value={p._id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={form.type}
            onValueChange={(v) => setForm({ ...form, type: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="flash">Flash Sale</SelectItem>
              <SelectItem value="latest">Latest Offer</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={form.discountType}
            onValueChange={(v) => setForm({ ...form, discountType: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="flat">Flat</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="number"
            placeholder="Discount value *"
            value={form.discountValue}
            onChange={(e) =>
              setForm({ ...form, discountValue: e.target.value })
            }
          />

          <Input
            type="datetime-local"
            onChange={(e) =>
              setForm({ ...form, startTime: e.target.value })
            }
          />

          <Input
            type="datetime-local"
            onChange={(e) => setForm({ ...form, endTime: e.target.value })}
          />

          {error && (
            <p className="text-sm text-red-600 col-span-full">
              {error}
            </p>
          )}

          <Button
            disabled={loading}
            onClick={createOffer}
            className="col-span-full"
          >
            {loading ? "Creating…" : "Create Offer"}
          </Button>
        </CardContent>
      </Card>

      {/* OFFERS LIST */}
      <Card>
        <CardHeader>
          <CardTitle>All Offers</CardTitle>
        </CardHeader>

        <CardContent>
          {offers.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">
              No offers created
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {offers.map((o) => (
                  <TableRow key={o._id}>
                    <TableCell>
                      <p className="font-medium">{o.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {o.subtitle}
                      </p>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline">
                        {o.type.toUpperCase()}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      {o.discountValue}
                      {o.discountType === "percentage" ? "%" : "₹"}
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={
                          o.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-600"
                        }
                      >
                        {o.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => toggleOffer(o._id)}
                        >
                          <Power className="w-4 h-4" />
                        </Button>

                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => deleteOffer(o._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
