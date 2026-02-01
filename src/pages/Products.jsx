import React from "react";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

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
  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/products");
      setProducts(res.data || []);
    } catch (err) {
      setError("Failed to load products",err);
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

  /* ================= FILTER ================= */
  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase())
  );

  /* ================= UI ================= */
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">
            Manage your store products
          </p>
        </div>

        <div className="flex gap-2">
          <Button asChild>
            <Link to="/admin/add-product">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Link>
          </Button>

          <Button variant="outline" asChild>
            <Link to="/admin/add-hero">
              Add Hero
            </Link>
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
                    <TableHead className="text-right">
                      Actions
                    </TableHead>
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
                            <div>
                              <p className="font-medium">{p.name}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">
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
