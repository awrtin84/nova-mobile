"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import AdminProductForm from "@/components/AdminProductForm";
import { admin } from "@/lib/admin-api";
import { ApiError } from "@/lib/api";
import type { ProductDetail } from "@/lib/types";

export default function EditProductPage() {
    const { id } = useParams<{ id: string }>();
    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        admin
            .product(id)
            .then(setProduct)
            .catch((err) =>
                setError(
                    err instanceof ApiError
                        ? err.message
                        : "خطا در دریافت محصول",
                ),
            );
    }, [id]);

    if (error)
        return (
            <p className="rounded-2xl bg-coral-50 p-5 text-sm font-bold text-coral-600">
                {error}
            </p>
        );
    if (!product) return <div className="card h-64 animate-pulse" />;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-black">ویرایش محصول</h1>
            <AdminProductForm product={product} />
        </div>
    );
}
