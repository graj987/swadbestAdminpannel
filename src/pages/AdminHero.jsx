import React from "react";
import { useEffect, useState } from "react";
import api from "../api";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export default function AdminHero() {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [variantIndex, setVariantIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* ================= LOAD PRODUCTS ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/admin/products");
        setProducts(res.data || []);

        const hero = res.data.find((p) => p.isHero);
        if (hero) {
          setSelectedProductId(hero._id);
          setVariantIndex(hero.heroVariantIndex ?? 0);
        }
      } catch {
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const selectedProduct = products.find(
    (p) => p._id === selectedProductId
  );
  const selectedVariant =
    selectedProduct?.variants?.[variantIndex];

  /* ================= SAVE HERO ================= */
  const saveHero = async () => {
    setError("");
    if (!selectedProductId) {
      setError("Please select a product");
      return;
    }

    try {
      setSaving(true);
      await api.put("/api/admin/hero", {
        productId: selectedProductId,
        heroVariantIndex: variantIndex,
      });
    } catch {
      setError("Failed to update hero product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <p className="text-center text-muted-foreground">
        Loading hero products…
      </p>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="max-w-2xl space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Hero Product</h1>
        <p className="text-muted-foreground">
          Select the main product shown on the homepage
        </p>
      </div>

      {/* CONFIG CARD */}
      <Card>
        <CardHeader>
          <CardTitle>Hero Configuration</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* PRODUCT SELECT */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Select Product
            </label>
            <Select
              value={selectedProductId}
              onValueChange={(v) => {
                setSelectedProductId(v);
                setVariantIndex(0);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p._id} value={p._id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* VARIANT SELECT */}
          {selectedProduct && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Hero Variant
              </label>
              <Select
                value={String(variantIndex)}
                onValueChange={(v) =>
                  setVariantIndex(Number(v))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {selectedProduct.variants.map((v, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {v.weight} · ₹{v.price} · Stock: {v.stock}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <Button
            onClick={saveHero}
            disabled={saving}
            className="w-full"
          >
            {saving ? "Saving…" : "Save Hero Product"}
          </Button>
        </CardContent>
      </Card>

      {/* PREVIEW */}
      {selectedProduct && selectedVariant && (
        <Card>
          <CardHeader>
            <CardTitle>Hero Preview</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">
                  {selectedProduct.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedVariant.weight}
                </p>
              </div>

              <Badge
                className={
                  selectedVariant.stock > 0
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }
              >
                {selectedVariant.stock > 0
                  ? "In Stock"
                  : "Out of Stock"}
              </Badge>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <p className="text-xl font-bold">
                ₹{selectedVariant.price}
              </p>

              <Button
                disabled={selectedVariant.stock === 0}
                className="rounded-full"
              >
                Buy Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
