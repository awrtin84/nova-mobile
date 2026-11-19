"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProductVisual from "./ProductVisual";
import { admin, type ProductInput } from "@/lib/admin-api";
import { ApiError, api } from "@/lib/api";
import { price } from "@/lib/format";
import type { Brand, Category, ProductDetail } from "@/lib/types";

type SpecRow = { key: string; value: string };

export default function AdminProductForm({
    product,
}: {
    product?: ProductDetail;
}) {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [name, setName] = useState(product?.name ?? "");
    const [nameEn, setNameEn] = useState(product?.name_en ?? "");
    const [brand, setBrand] = useState(product?.brand.slug ?? "");
    const [category, setCategory] = useState(product?.category.slug ?? "");
    const [basePrice, setBasePrice] = useState(
        product ? String(product.price) : "",
    );
    const [discount, setDiscount] = useState(
        String(product?.discount_percent ?? 0),
    );
    const [stock, setStock] = useState(String(product?.stock ?? 0));
    const [hue, setHue] = useState(product?.hue ?? 250);
    const [description, setDescription] = useState(product?.description ?? "");
    const [specs, setSpecs] = useState<SpecRow[]>(
        Object.entries(product?.specs ?? {}).map(([key, value]) => ({
            key,
            value,
        })),
    );
    const [colors, setColors] = useState<{ name: string; hex: string }[]>(
        product?.colors ?? [],
    );
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        Promise.all([api.categories(), api.brands()])
            .then(([cats, brs]) => {
                setCategories(cats);
                setBrands(brs);
                setCategory((current) => current || cats[0]?.slug || "");
                setBrand((current) => current || brs[0]?.slug || "");
            })
            .catch(() => setError("دریافت دسته‌بندی‌ها و برندها ممکن نبود"));
    }, []);

    const kind =
        product && product.category.slug === category
            ? product.visual_kind
            : (categories.find((item) => item.slug === category)?.kind ??
              "phone");

    const priceNumber = Number(basePrice) || 0;
    const discountNumber = Math.min(90, Math.max(0, Number(discount) || 0));
    const finalPrice =
        Math.round((priceNumber * (100 - discountNumber)) / 100 / 1000) * 1000;

    async function submit(event: React.FormEvent) {
        event.preventDefault();
        setError(null);

        const input: ProductInput = {
            name: name.trim(),
            name_en: nameEn.trim(),
            brand,
            category,
            price: priceNumber,
            discount_percent: discountNumber,
            stock: Math.max(0, Number(stock) || 0),
            hue,
            description: description.trim(),
            specs: Object.fromEntries(
                specs
                    .filter((row) => row.key.trim() && row.value.trim())
                    .map((row) => [row.key.trim(), row.value.trim()]),
            ),
            colors: colors
                .filter((color) => color.name.trim())
                .map((color) => ({ name: color.name.trim(), hex: color.hex })),
        };

        if (input.name.length < 3)
            return setError("نام محصول باید حداقل ۳ کاراکتر باشد");
        if (input.price < 1000)
            return setError("قیمت را به تومان و حداقل ۱۰۰۰ وارد کنید");

        setSaving(true);
        try {
            if (product) await admin.updateProduct(product.id, input);
            else await admin.createProduct(input);
            router.push("/admin/products");
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "ذخیره انجام نشد");
            setSaving(false);
        }
    }

    return (
        <form
            onSubmit={submit}
            className="grid items-start gap-6 lg:grid-cols-[1fr_20rem]"
        >
            <div className="space-y-6">
                <section className="card space-y-4 p-6">
                    <h2 className="text-lg font-black">اطلاعات اصلی</h2>
                    <label className="block">
                        <span className="mb-2 block text-sm font-bold">
                            نام محصول (فارسی)
                        </span>
                        <input
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            className="field"
                        />
                    </label>
                    <label className="block">
                        <span className="mb-2 block text-sm font-bold">
                            نام انگلیسی
                        </span>
                        <input
                            value={nameEn}
                            onChange={(event) => setNameEn(event.target.value)}
                            className="field"
                            dir="ltr"
                        />
                    </label>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block">
                            <span className="mb-2 block text-sm font-bold">
                                دسته‌بندی
                            </span>
                            <select
                                value={category}
                                onChange={(event) =>
                                    setCategory(event.target.value)
                                }
                                className="field"
                            >
                                {categories.map((item) => (
                                    <option key={item.slug} value={item.slug}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="block">
                            <span className="mb-2 block text-sm font-bold">
                                برند
                            </span>
                            <select
                                value={brand}
                                onChange={(event) =>
                                    setBrand(event.target.value)
                                }
                                className="field"
                            >
                                {brands.map((item) => (
                                    <option key={item.slug} value={item.slug}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                    <label className="block">
                        <span className="mb-2 block text-sm font-bold">
                            توضیحات
                        </span>
                        <textarea
                            rows={4}
                            value={description}
                            onChange={(event) =>
                                setDescription(event.target.value)
                            }
                            className="field resize-none"
                        />
                    </label>
                </section>

                <section className="card space-y-4 p-6">
                    <h2 className="text-lg font-black">قیمت و موجودی</h2>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <label className="block">
                            <span className="mb-2 block text-sm font-bold">
                                قیمت (تومان)
                            </span>
                            <input
                                type="number"
                                min={0}
                                value={basePrice}
                                onChange={(event) =>
                                    setBasePrice(event.target.value)
                                }
                                className="field"
                                dir="ltr"
                            />
                        </label>
                        <label className="block">
                            <span className="mb-2 block text-sm font-bold">
                                درصد تخفیف
                            </span>
                            <input
                                type="number"
                                min={0}
                                max={90}
                                value={discount}
                                onChange={(event) =>
                                    setDiscount(event.target.value)
                                }
                                className="field"
                                dir="ltr"
                            />
                        </label>
                        <label className="block">
                            <span className="mb-2 block text-sm font-bold">
                                موجودی
                            </span>
                            <input
                                type="number"
                                min={0}
                                value={stock}
                                onChange={(event) =>
                                    setStock(event.target.value)
                                }
                                className="field"
                                dir="ltr"
                            />
                        </label>
                    </div>
                    <p className="rounded-2xl bg-brand-50 px-4 py-3 text-sm font-bold text-brand-800">
                        قیمت نهایی: {price(finalPrice)} تومان
                    </p>
                </section>

                <section className="card space-y-3 p-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-black">مشخصات فنی</h2>
                        <button
                            type="button"
                            onClick={() =>
                                setSpecs((rows) => [
                                    ...rows,
                                    { key: "", value: "" },
                                ])
                            }
                            className="text-sm font-bold text-brand-600"
                        >
                            + افزودن ردیف
                        </button>
                    </div>
                    {specs.length === 0 && (
                        <p className="text-sm text-ink-soft">
                            هنوز مشخصاتی اضافه نشده است
                        </p>
                    )}
                    {specs.map((row, index) => (
                        <div key={index} className="flex gap-2">
                            <input
                                value={row.key}
                                onChange={(event) =>
                                    setSpecs((rows) =>
                                        rows.map((r, i) =>
                                            i === index
                                                ? {
                                                      ...r,
                                                      key: event.target.value,
                                                  }
                                                : r,
                                        ),
                                    )
                                }
                                placeholder="عنوان"
                                className="field"
                            />
                            <input
                                value={row.value}
                                onChange={(event) =>
                                    setSpecs((rows) =>
                                        rows.map((r, i) =>
                                            i === index
                                                ? {
                                                      ...r,
                                                      value: event.target.value,
                                                  }
                                                : r,
                                        ),
                                    )
                                }
                                placeholder="مقدار"
                                className="field"
                            />
                            <button
                                type="button"
                                aria-label="حذف ردیف"
                                onClick={() =>
                                    setSpecs((rows) =>
                                        rows.filter((_, i) => i !== index),
                                    )
                                }
                                className="shrink-0 rounded-xl px-3 text-coral-600 hover:bg-coral-50"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </section>

                <section className="card space-y-3 p-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-black">رنگ‌ها</h2>
                        <button
                            type="button"
                            onClick={() =>
                                setColors((rows) => [
                                    ...rows,
                                    { name: "", hex: "#1f2937" },
                                ])
                            }
                            className="text-sm font-bold text-brand-600"
                        >
                            + افزودن رنگ
                        </button>
                    </div>
                    {colors.length === 0 && (
                        <p className="text-sm text-ink-soft">
                            هنوز رنگی اضافه نشده است
                        </p>
                    )}
                    {colors.map((color, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <input
                                type="color"
                                value={color.hex}
                                onChange={(event) =>
                                    setColors((rows) =>
                                        rows.map((r, i) =>
                                            i === index
                                                ? {
                                                      ...r,
                                                      hex: event.target.value,
                                                  }
                                                : r,
                                        ),
                                    )
                                }
                                className="h-12 w-14 shrink-0 cursor-pointer rounded-xl border border-slate-200 bg-white p-1"
                            />
                            <input
                                value={color.name}
                                onChange={(event) =>
                                    setColors((rows) =>
                                        rows.map((r, i) =>
                                            i === index
                                                ? {
                                                      ...r,
                                                      name: event.target.value,
                                                  }
                                                : r,
                                        ),
                                    )
                                }
                                placeholder="نام رنگ"
                                className="field"
                            />
                            <button
                                type="button"
                                aria-label="حذف رنگ"
                                onClick={() =>
                                    setColors((rows) =>
                                        rows.filter((_, i) => i !== index),
                                    )
                                }
                                className="shrink-0 rounded-xl px-3 text-coral-600 hover:bg-coral-50"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </section>
            </div>

            <aside className="card sticky top-24 space-y-4 p-5">
                <div className="aspect-[9/7] overflow-hidden rounded-2xl">
                    <ProductVisual kind={kind} hue={hue} />
                </div>
                <label className="block">
                    <span className="mb-2 block text-sm font-bold">
                        رنگ پس‌زمینه تصویر
                    </span>
                    <input
                        type="range"
                        min={0}
                        max={360}
                        value={hue}
                        onChange={(event) => setHue(Number(event.target.value))}
                        className="w-full accent-brand-600"
                    />
                </label>
                {error && (
                    <p
                        role="alert"
                        className="rounded-2xl bg-coral-50 px-4 py-3 text-sm font-bold leading-6 text-coral-600"
                    >
                        {error}
                    </p>
                )}
                <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary w-full"
                >
                    {saving
                        ? "در حال ذخیره…"
                        : product
                          ? "ذخیره تغییرات"
                          : "ایجاد محصول"}
                </button>
                <button
                    type="button"
                    onClick={() => router.push("/admin/products")}
                    className="btn-ghost w-full"
                >
                    انصراف
                </button>
            </aside>
        </form>
    );
}
