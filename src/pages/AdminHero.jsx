import React, { useEffect, useState } from "react";
import api from "../api";

export default function AdminHero() {
    const [products, setProducts] = useState([]);
    const [selectedProductId, setSelectedProductId] = useState("");
    const [variantIndex, setVariantIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    /* ================= FETCH PRODUCTS ================= */
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await api.get("api/admin/products");
                setProducts(res.data);

                const hero = res.data.find(p => p.isHero);
                if (hero) {
                    setSelectedProductId(hero._id);
                    setVariantIndex(hero.heroVariantIndex ?? 0);
                }
            } catch (err) {
                alert("Failed to load products", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const selectedProduct = products.find(
        p => p._id === selectedProductId
    );
    const selectedVariant =
        selectedProduct?.variants?.[variantIndex];


    /* ================= SAVE HERO ================= */
    const saveHero = async () => {
        if (!selectedProductId) {
            return alert("Select a product");
        }

        setSaving(true);
        try {
            await api.put("api/admin/hero", {
                productId: selectedProductId,
                heroVariantIndex: variantIndex,
            });

            alert("Hero product updated");
        } catch (err) {
            alert("Failed to update hero", err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <p className="text-center">Loading...</p>;

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">Hero Product</h2>

            {/* PRODUCT SELECT */}
            <label className="block text-sm font-medium mb-1">
                Select Product
            </label>
            <select
                value={selectedProductId}
                onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    setVariantIndex(0);
                }}
                className="w-full border p-3 rounded mb-4"
            >
                <option value="">-- Select product --</option>
                {products.map(p => (
                    <option key={p._id} value={p._id}>
                        {p.name}
                    </option>
                ))}
            </select>

            {/* VARIANT SELECT */}
            {selectedProduct && (
                <>
                    <label className="block text-sm font-medium mb-1">
                        Hero Variant
                    </label>
                    <select
                        value={variantIndex}
                        onChange={(e) =>
                            setVariantIndex(Number(e.target.value))
                        }
                        className="w-full border p-3 rounded mb-4"
                    >
                        {selectedProduct.variants.map((v, i) => (
                            <option key={i} value={i}>
                                {v.weight} — ₹{v.price} (Stock: {v.stock})
                            </option>
                        ))}
                    </select>
                </>
            )}
            {/* HERO PREVIEW */}
            {selectedProduct && selectedVariant && (
                <div className="mt-6 border rounded-xl overflow-hidden">
                    <div className="bg-orange-600 text-white px-4 py-3">
                        <p className="text-xs uppercase tracking-wide opacity-80">
                            Hero Preview (User View)
                        </p>
                        <p className="text-lg font-semibold">
                            {selectedVariant.weight} · ₹{selectedVariant.price}
                        </p>
                        <p className="text-sm opacity-90">
                            Stock:{" "}
                            {selectedVariant.stock > 0
                                ? selectedVariant.stock
                                : "Out of stock"}
                        </p>
                    </div>

                    <div className="bg-white px-4 py-3 flex justify-end">
                        <button
                            disabled={selectedVariant.stock === 0}
                            className="
          bg-orange-600 text-white
          px-5 py-2 rounded-full font-semibold
          disabled:opacity-50
          disabled:cursor-not-allowed
        "
                        >
                            Buy Now
                        </button>
                    </div>
                </div>
            )}


            <button
                onClick={saveHero}
                disabled={saving}
                className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold disabled:opacity-60"
            >
                {saving ? "Saving..." : "Save Hero"}
            </button>
        </div>
    );
}
