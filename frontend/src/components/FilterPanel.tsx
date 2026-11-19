"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { fa } from "@/lib/format";
import type { Brand, Category } from "@/lib/types";

type Props = {
  categories: Category[];
  brands: Brand[];
};

const DIGITS = "۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩";

function toLatin(value: string) {
  return value
    .split("")
    .map((char) => {
      const index = DIGITS.indexOf(char);
      return index === -1 ? char : String(index % 10);
    })
    .join("")
    .replace(/[^\d]/g, "");
}

export default function FilterPanel({ categories, brands }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const [minPrice, setMinPrice] = useState(params.get("min_price") ?? "");
  const [maxPrice, setMaxPrice] = useState(params.get("max_price") ?? "");

  useEffect(() => {
    setMinPrice(params.get("min_price") ?? "");
    setMaxPrice(params.get("max_price") ?? "");
  }, [params]);

  const category = params.get("category") ?? "";
  const selectedBrands = params.getAll("brand");
  const inStock = params.get("in_stock") === "true";
  const onSale = params.get("on_sale") === "true";

  function push(mutate: (next: URLSearchParams) => void) {
    const next = new URLSearchParams(params.toString());
    mutate(next);
    next.delete("page");
    const query = next.toString();
    startTransition(() => router.push(query ? `${pathname}?${query}` : pathname));
  }

  function toggleBrand(slug: string) {
    push((next) => {
      const current = next.getAll("brand");
      next.delete("brand");
      const updated = current.includes(slug) ? current.filter((b) => b !== slug) : [...current, slug];
      updated.forEach((b) => next.append("brand", b));
    });
  }

  function applyPrice() {
    push((next) => {
      if (minPrice) next.set("min_price", minPrice);
      else next.delete("min_price");
      if (maxPrice) next.set("max_price", maxPrice);
      else next.delete("max_price");
    });
  }

  const hasFilters =
    Boolean(category) || selectedBrands.length > 0 || inStock || onSale || params.has("min_price") || params.has("max_price") || params.has("q");

  const panel = (
    <div className="space-y-7">
      <div>
        <p className="mb-3 text-sm font-extrabold">دسته‌بندی</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => push((next) => next.delete("category"))}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              !category ? "bg-brand-600 text-white" : "bg-slate-100 text-ink-soft hover:bg-brand-50"
            }`}
          >
            همه
          </button>
          {categories.map((item) => (
            <button
              key={item.slug}
              type="button"
              onClick={() => push((next) => next.set("category", item.slug))}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                category === item.slug ? "bg-brand-600 text-white" : "bg-slate-100 text-ink-soft hover:bg-brand-50"
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-extrabold">برند</p>
        <ul className="space-y-2.5">
          {brands.map((brand) => (
            <li key={brand.slug}>
              <label className="flex cursor-pointer items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand.slug)}
                  onChange={() => toggleBrand(brand.slug)}
                  className="h-4 w-4 rounded accent-brand-600"
                />
                <span className="flex-1 font-semibold">{brand.name}</span>
                <span className="text-xs text-ink-mute">{fa(brand.product_count)}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="mb-3 text-sm font-extrabold">محدوده قیمت (تومان)</p>
        <div className="grid grid-cols-2 gap-2">
          <input
            inputMode="numeric"
            value={minPrice ? fa(Number(minPrice)) : ""}
            onChange={(event) => setMinPrice(toLatin(event.target.value))}
            onKeyDown={(event) => event.key === "Enter" && applyPrice()}
            placeholder="از"
            className="field !px-3 !py-2.5 text-center"
          />
          <input
            inputMode="numeric"
            value={maxPrice ? fa(Number(maxPrice)) : ""}
            onChange={(event) => setMaxPrice(toLatin(event.target.value))}
            onKeyDown={(event) => event.key === "Enter" && applyPrice()}
            placeholder="تا"
            className="field !px-3 !py-2.5 text-center"
          />
        </div>
        <button type="button" onClick={applyPrice} className="btn-ghost mt-2 w-full !py-2.5">
          اعمال قیمت
        </button>
      </div>

      <div className="space-y-3">
        <label className="flex cursor-pointer items-center justify-between text-sm font-bold">
          فقط کالاهای موجود
          <input
            type="checkbox"
            checked={inStock}
            onChange={() => push((next) => (inStock ? next.delete("in_stock") : next.set("in_stock", "true")))}
            className="h-4 w-4 rounded accent-brand-600"
          />
        </label>
        <label className="flex cursor-pointer items-center justify-between text-sm font-bold">
          فقط تخفیف‌دارها
          <input
            type="checkbox"
            checked={onSale}
            onChange={() => push((next) => (onSale ? next.delete("on_sale") : next.set("on_sale", "true")))}
            className="h-4 w-4 rounded accent-brand-600"
          />
        </label>
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={() => startTransition(() => router.push(pathname))}
          className="w-full rounded-2xl bg-coral-50 py-3 text-sm font-extrabold text-coral-600 transition hover:bg-coral-500 hover:text-white"
        >
          پاک کردن همه فیلترها
        </button>
      )}
    </div>
  );

  return (
    <>
      <div className="mb-4 lg:hidden">
        <button type="button" onClick={() => setOpen(true)} className="btn-ghost !px-4 !py-2.5">
          فیلترها
        </button>
      </div>

      <aside className="card sticky top-36 hidden max-h-[calc(100vh-10rem)] overflow-y-auto p-5 lg:block">{panel}</aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="بستن"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-4xl bg-white p-6 shadow-lift">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-lg font-black">فیلترها</p>
              <button type="button" onClick={() => setOpen(false)} className="btn-primary !px-5 !py-2">
                مشاهده نتایج
              </button>
            </div>
            {panel}
          </div>
        </div>
      )}
    </>
  );
}
