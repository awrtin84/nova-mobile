import type { Metadata } from "next";
import CartView from "@/components/CartView";
import { api } from "@/lib/api";

export const metadata: Metadata = { title: "سبد خرید" };

export default async function CartPage() {
  const config = await api.config();

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 text-2xl font-black sm:text-3xl">سبد خرید</h1>
      <CartView config={config} />
    </div>
  );
}
