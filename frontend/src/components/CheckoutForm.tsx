"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "./CartProvider";
import OrderSummary from "./OrderSummary";
import { ApiError, api } from "@/lib/api";
import { fa, price } from "@/lib/format";
import type { Config } from "@/lib/types";

type Values = {
  customer_name: string;
  phone: string;
  city: string;
  address: string;
  postal_code: string;
};

type Errors = Partial<Record<keyof Values, string>>;

const DIGITS = "۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩";

function latin(value: string) {
  return value
    .split("")
    .map((char) => {
      const index = DIGITS.indexOf(char);
      return index === -1 ? char : String(index % 10);
    })
    .join("");
}

function validate(values: Values): Errors {
  const errors: Errors = {};
  if (values.customer_name.trim().length < 3) errors.customer_name = "نام و نام خانوادگی را کامل وارد کنید";
  if (!/^09\d{9}$/.test(latin(values.phone).trim())) errors.phone = "شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد";
  if (values.city.trim().length < 2) errors.city = "شهر را وارد کنید";
  if (values.address.trim().length < 10) errors.address = "آدرس باید حداقل ۱۰ کاراکتر باشد";
  const postal = latin(values.postal_code).trim();
  if (postal && !/^\d{10}$/.test(postal)) errors.postal_code = "کد پستی باید ۱۰ رقم باشد";
  return errors;
}

export default function CheckoutForm({ config }: { config: Config }) {
  const router = useRouter();
  const { lines, ready, subtotal, clear } = useCart();
  const [values, setValues] = useState<Values>({
    customer_name: "",
    phone: "",
    city: "",
    address: "",
    postal_code: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!ready) return <div className="card h-64 animate-pulse" />;

  if (lines.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-4 px-6 py-20 text-center">
        <p className="text-xl font-black">سبد خرید شما خالی است</p>
        <Link href="/products" className="btn-primary">
          مشاهده محصولات
        </Link>
      </div>
    );
  }

  function update(key: keyof Values, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setServerError(null);

    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      const order = await api.createOrder({
        customer_name: values.customer_name.trim(),
        phone: latin(values.phone).trim(),
        city: values.city.trim(),
        address: values.address.trim(),
        postal_code: latin(values.postal_code).trim(),
        items: lines.map((line) => ({
          product_id: line.productId,
          quantity: line.quantity,
          color: line.color,
        })),
      });
      clear();
      router.push(`/order/${order.code}`);
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : "ارتباط با سرور برقرار نشد");
      setSubmitting(false);
    }
  }

  const fields: { key: keyof Values; label: string; placeholder: string; inputMode?: "numeric" | "tel"; full?: boolean }[] = [
    { key: "customer_name", label: "نام و نام خانوادگی", placeholder: "مثلاً آرتین رحیمی" },
    { key: "phone", label: "شماره موبایل", placeholder: "۰۹۱۲۳۴۵۶۷۸۹", inputMode: "tel" },
    { key: "city", label: "شهر", placeholder: "خرم‌آباد" },
    { key: "postal_code", label: "کد پستی (اختیاری)", placeholder: "۱۰ رقم", inputMode: "numeric" },
  ];

  return (
    <form onSubmit={submit} noValidate className="grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-6">
        <section className="card p-6">
          <h2 className="mb-5 text-lg font-black">اطلاعات تحویل گیرنده</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <label key={field.key} className="block">
                <span className="mb-2 block text-sm font-bold">{field.label}</span>
                <input
                  value={values[field.key]}
                  onChange={(event) => update(field.key, event.target.value)}
                  placeholder={field.placeholder}
                  inputMode={field.inputMode}
                  aria-invalid={Boolean(errors[field.key])}
                  className={`field ${errors[field.key] ? "!border-coral-500 !ring-4 !ring-coral-50" : ""}`}
                />
                {errors[field.key] && <span className="mt-1.5 block text-xs font-bold text-coral-600">{errors[field.key]}</span>}
              </label>
            ))}
            <label className="block sm:col-span-2">
              <span className="mb-2 block text-sm font-bold">آدرس کامل</span>
              <textarea
                rows={3}
                value={values.address}
                onChange={(event) => update("address", event.target.value)}
                placeholder="استان، شهر، خیابان، کوچه، پلاک و واحد"
                aria-invalid={Boolean(errors.address)}
                className={`field resize-none ${errors.address ? "!border-coral-500 !ring-4 !ring-coral-50" : ""}`}
              />
              {errors.address && <span className="mt-1.5 block text-xs font-bold text-coral-600">{errors.address}</span>}
            </label>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="mb-4 text-lg font-black">کالاهای سفارش</h2>
          <ul className="divide-y divide-slate-100">
            {lines.map((line) => (
              <li key={line.key} className="flex items-center justify-between gap-4 py-3 text-sm">
                <div className="min-w-0">
                  <p className="line-clamp-1 font-bold">{line.name}</p>
                  <p className="mt-0.5 text-xs text-ink-soft">
                    {line.color && `${line.color} · `}
                    {fa(line.quantity)} عدد
                  </p>
                </div>
                <p className="shrink-0 font-black">{price(line.price * line.quantity)}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-6">
          <h2 className="mb-2 text-lg font-black">روش پرداخت</h2>
          <p className="rounded-2xl bg-brand-50 px-4 py-3 text-sm font-semibold leading-7 text-brand-800">
            پرداخت در محل هنگام تحویل کالا. این نسخه نمایشی است و درگاه پرداخت آنلاین ندارد.
          </p>
        </section>
      </div>

      <OrderSummary subtotal={subtotal} config={config}>
        {serverError && (
          <p role="alert" className="rounded-2xl bg-coral-50 px-4 py-3 text-sm font-bold leading-6 text-coral-600">
            {serverError}
          </p>
        )}
        <button type="submit" disabled={submitting} className="btn-coral w-full !py-3.5">
          {submitting ? "در حال ثبت سفارش…" : "ثبت نهایی سفارش"}
        </button>
        <Link href="/cart" className="block text-center text-sm font-bold text-ink-soft hover:text-brand-700">
          بازگشت به سبد خرید
        </Link>
      </OrderSummary>
    </form>
  );
}
