import type { Metadata } from "next";
import CheckoutForm from "@/components/CheckoutForm";
import { api } from "@/lib/api";

export const metadata: Metadata = { title: "تکمیل سفارش" };

export default async function CheckoutPage() {
  const config = await api.config();

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 text-2xl font-black sm:text-3xl">تکمیل سفارش</h1>
      <CheckoutForm config={config} />
    </div>
  );
}
