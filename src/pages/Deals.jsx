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

import { Trash, Pencil } from "lucide-react";

export default function Deals() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDeals = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/products");
      const withDeals = (res.data || []).filter(
        (p) => p.deal?.isActive
      );
      setProducts(withDeals);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeals();
  }, []);

  const removeDeal = async (id) => {
    if (!confirm("Remove deal from this product?")) return;

    try {
      await api.delete(`/api/products/admin/${id}/deal`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch {
      alert("Failed to remove deal");
    }
  };

  const getStatus = (p) => {
    const now = new Date();
    const start = new Date(p.deal.startAt);
    const end = new Date(p.deal.endAt);

    if (now < start) return "upcoming";
    if (now > end) return "expired";
    return "active";
  };

  const statusBadge = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 border-green-300";
      case "upcoming":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "expired":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Deals Management</h1>
        <p className="text-muted-foreground">
          Active, upcoming and expired deals
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deals</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-center py-6 text-muted-foreground">
              Loading deals…
            </p>
          ) : products.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground">
              No deals found
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {products.map((p) => {
                  const status = getStatus(p);

                  return (
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
                        {p.deal.discountPercent}%
                      </TableCell>

                      <TableCell>
                        {new Date(
                          p.deal.startAt
                        ).toLocaleDateString()}
                      </TableCell>

                      <TableCell>
                        {new Date(
                          p.deal.endAt
                        ).toLocaleDateString()}
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={statusBadge(status)}
                        >
                          {status.toUpperCase()}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() =>
                              navigate(
                                `/admin/products/${p._id}`
                              )
                            }
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>

                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() =>
                              removeDeal(p._id)
                            }
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
