import React from "react";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { Search, Plus, Pencil, Trash } from "lucide-react";

export default function Products() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  /* ================= FETCH ================= */
  const [dealModal, setDealModal] = useState({
    open: false,
    productId: null,
    discount: "",
    startAt: "",
    endAt: "",
  });

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/products");
      setProducts(res.data || []);
    } catch (err) {
      setError("Failed to load products", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  /* ================= DELETE ================= */
  const deleteProduct = async (id) => {
    if (!confirm("Delete this product permanently?")) return;

    try {
      await api.delete(`/api/admin/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch {
      alert("Failed to delete product");
    }
  };

  const toggleFeatured = async (id) => {
    try {
      const res = await api.patch(`/api/products/admin/${id}/featured`);
      setProducts((prev) =>
        prev.map((p) =>
          p._id === id ? { ...p, isFeatured: res.data.isFeatured } : p,
        ),
      );
    } catch {
      alert("Failed to update featured status");
    }
  };

  const openDealModal = (productId) => {
    setDealModal({
      open: true,
      productId,
      discount: "",
      startAt: "",
      endAt: "",
    });
  };

  const closeDealModal = () => {
    setDealModal({
      open: false,
      productId: null,
      discount: "",
      startAt: "",
      endAt: "",
    });
  };
  const today = new Date().toISOString().split("T")[0];

  const submitDeal = async () => {
    const { productId, discount, startAt, endAt } = dealModal;

    if (!discount || !startAt || !endAt) {
      alert("All fields are required");
      return;
    }

    try {
      await api.post(`/api/products/admin/${productId}/deal`, {
        discountPercent: Number(discount),
        startAt,
        endAt,
      });

      closeDealModal();
      loadProducts();
    } catch {
      alert("Failed to set deal");
    }
  };

  const removeDeal = async (id) => {
    if (!confirm("Remove deal from this product?")) return;

    try {
      await api.delete(`/api/products/admin/${id}/deal`);
      loadProducts();
    } catch {
      alert("Failed to remove deal");
    }
  };

  /* ================= FILTER ================= */
  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase()),
  );

  /* ================= UI ================= */
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your store products</p>
        </div>

        <div className="flex gap-2">
          <Button asChild>
            <Link to="/admin/add-product">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/admin/featured-products">Manage Featured</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/admin/deals">Manage Deals</Link>
          </Button>

          <Button variant="outline" asChild>
            <Link to="/admin/add-hero">Add Hero</Link>
          </Button>
        </div>
      </div>

      {/* CARD */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>All Products</CardTitle>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-center py-6 text-muted-foreground">
              Loading products…
            </p>
          ) : error ? (
            <p className="text-center py-6 text-red-600">{error}</p>
          ) : filtered.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground">
              No products found
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead>Deal</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filtered.map((p) => {
                    const v = p.variants?.[0];

                    return (
                      <TableRow key={p._id}>
                        {/* PRODUCT */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-10 h-10 rounded-md object-cover border"
                            />
                            <div className="max-w-[220px] space-y-[2px]">
                              <p className="text-sm font-medium leading-tight truncate">
                                {p.name}
                              </p>

                              <p className="text-[11px] text-muted-foreground leading-tight line-clamp-2 break-words">
                                {p.description}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* CATEGORY */}
                        <TableCell>
                          <Badge variant="outline">
                            {p.category || "Other"}
                          </Badge>
                        </TableCell>

                        {/* PRICE */}
                        <TableCell>
                          ₹{Number(v?.price || 0).toLocaleString("en-IN")}
                        </TableCell>

                        {/* STOCK */}
                        <TableCell>
                          <Badge
                            className={
                              v?.stock > 0
                                ? "bg-green-100 text-green-700 border-green-200"
                                : "bg-red-100 text-red-700 border-red-200"
                            }
                          >
                            {v?.stock > 0 ? "In Stock" : "Out of Stock"}
                          </Badge>
                        </TableCell>

                        {/* FEATURED */}
                        <TableCell>
                          <Button
                            size="sm"
                            variant={p.isFeatured ? "default" : "outline"}
                            onClick={() => toggleFeatured(p._id)}
                          >
                            {p.isFeatured ? "Featured" : "Make Featured"}
                          </Button>
                        </TableCell>

                        <TableCell>
                          {p.isDealActive ? (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeDeal(p._id)}
                            >
                              Remove Deal
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openDealModal(p._id)}
                            >
                              Set Deal
                            </Button>
                          )}
                        </TableCell>
                        {dealModal.open && (
                          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 px-4">
                            <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-900 shadow-xl p-6">
                              <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">
                                Set Deal
                              </h2>

                              <div className="space-y-4">
                                {/* DISCOUNT */}
                                <div>
                                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Discount (%)
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    max="90"
                                    placeholder="e.g. 20"
                                    className="
              w-full mt-1 px-3 py-2 rounded-lg border
              bg-white dark:bg-gray-800
              text-gray-900 dark:text-gray-100
              border-gray-300 dark:border-gray-700
              focus:outline-none focus:ring-2 focus:ring-orange-500
            "
                                    value={dealModal.discount}
                                    onChange={(e) =>
                                      setDealModal((s) => ({
                                        ...s,
                                        discount: e.target.value,
                                      }))
                                    }
                                  />
                                </div>

                                {/* DATES */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                      Start Date
                                    </label>
                                    <input
                                      type="date"
                                      min={today}
                                      className="
                w-full mt-1 px-3 py-2 rounded-lg border
                bg-white dark:bg-gray-800
                text-gray-900 dark:text-gray-100
                border-gray-300 dark:border-gray-700
                focus:outline-none focus:ring-2 focus:ring-orange-500
              "
                                      value={dealModal.startAt}
                                      onChange={(e) =>
                                        setDealModal((s) => ({
                                          ...s,
                                          startAt: e.target.value,
                                          endAt:
                                            s.endAt && s.endAt < e.target.value
                                              ? ""
                                              : s.endAt,
                                        }))
                                      }
                                    />
                                  </div>

                                  <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                      End Date
                                    </label>
                                    <input
                                      type="date"
                                      min={dealModal.startAt || today}
                                      className="
                w-full mt-1 px-3 py-2 rounded-lg border
                bg-white dark:bg-gray-800
                text-gray-900 dark:text-gray-100
                border-gray-300 dark:border-gray-700
                focus:outline-none focus:ring-2 focus:ring-orange-500
              "
                                      value={dealModal.endAt}
                                      onChange={(e) =>
                                        setDealModal((s) => ({
                                          ...s,
                                          endAt: e.target.value,
                                        }))
                                      }
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* ACTIONS */}
                              <div className="flex justify-end gap-3 mt-6">
                                <Button
                                  variant="outline"
                                  onClick={closeDealModal}
                                >
                                  Cancel
                                </Button>
                                <Button onClick={submitDeal}>Save Deal</Button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ACTIONS */}
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() =>
                                navigate(`/admin/products/${p._id}`)
                              }
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>

                            <Button
                              size="icon"
                              variant="destructive"
                              onClick={() => deleteProduct(p._id)}
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
