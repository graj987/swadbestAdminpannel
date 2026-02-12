import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Badge } from "@/components/ui/badge";

import { Pencil, StarOff } from "lucide-react";

export default function FeaturedProducts() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFeatured = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/products");
      const featuredOnly = (res.data || []).filter(
        (p) => p.isFeatured
      );
      setProducts(featuredOnly);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeatured();
  }, []);

  const removeFeatured = async (id) => {
    if (!confirm("Remove this product from featured?")) return;

    try {
      await api.patch(`/api/products/admin/${id}/featured`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch {
      alert("Failed to remove featured product");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Featured Products</h1>
        <p className="text-muted-foreground">
          Products highlighted on homepage
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Featured Products</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-center py-6 text-muted-foreground">
              Loading featured products…
            </p>
          ) : products.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground">
              No featured products selected
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {products.map((p) => (
                  <TableRow key={p._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-10 h-10 rounded-md border object-cover"
                        />
                        <span className="font-medium">
                          {p.name}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline">
                        {p.category || "Other"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                        Featured
                      </Badge>
                    </TableCell>

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
                          onClick={() => removeFeatured(p._id)}
                        >
                          <StarOff className="w-4 h-4" />
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
