export type Ref = { slug: string; name: string };

export type Product = {
    id: number;
    slug: string;
    name: string;
    name_en: string;
    price: number;
    discount_percent: number;
    final_price: number;
    stock: number;
    rating: number;
    reviews_count: number;
    sold_count: number;
    visual_kind: string;
    hue: number;
    brand: Ref;
    category: Ref;
};

export type ProductDetail = Product & {
    description: string;
    specs: Record<string, string>;
    colors: { name: string; hex: string }[];
};

export type ProductPage = {
    items: Product[];
    total: number;
    page: number;
    page_size: number;
    pages: number;
};

export type Category = {
    id: number;
    slug: string;
    name: string;
    kind: string;
    product_count: number;
};
export type Brand = {
    id: number;
    slug: string;
    name: string;
    name_en: string;
    product_count: number;
};

export type Home = {
    deals: Product[];
    newest: Product[];
    bestsellers: Product[];
};

export type Config = { free_shipping_threshold: number; shipping_fee: number };

export type OrderItem = {
    product_id: number;
    product_name: string;
    color: string;
    unit_price: number;
    quantity: number;
};

export type Order = {
    code: string;
    customer_name: string;
    phone: string;
    city: string;
    address: string;
    postal_code: string;
    subtotal: number;
    shipping_fee: number;
    total: number;
    status: string;
    created_at: string;
    items: OrderItem[];
};
