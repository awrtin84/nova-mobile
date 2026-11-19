import AdminProductForm from "@/components/AdminProductForm";

export default function NewProductPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-black">افزودن محصول</h1>
            <AdminProductForm />
        </div>
    );
}
