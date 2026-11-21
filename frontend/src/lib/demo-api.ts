import data from "./demo-data.json";
import { ApiError } from "./api";
import type {
    Brand,
    Category,
    Config,
    Home,
    Order,
    Product,
    ProductDetail,
    ProductPage,
} from "./types";

type ProductQuery = {
    q?: string;
    category?: string;
    brand?: string[];
    min_price?: string;
    max_price?: string;
    in_stock?: string;
    on_sale?: string;
    sort?: string;
    page?: string;
    page_size?: string;
};

type OrderInput = {
    customer_name: string;
    phone: string;
    city: string;
    address: string;
    postal_code: string;
    items: { product_id: number; quantity: number; color: string }[];
};

const STORAGE_KEY = "nova-demo-orders-v1";

const products = data.products as unknown as ProductDetail[];
const categories = data.categories as Category[];
const brands = data.brands as Brand[];
const config = data.config as Config;
const rank = new Map<number, number>(
    (data.newestOrder as number[]).map((id, index) => [id, index]),
);

function summary(product: ProductDetail): Product {
    const {
        description: _description,
        specs: _specs,
        colors: _colors,
        ...rest
    } = product;
    return rest;
}

function byId(a: Product, b: Product) {
    return a.id - b.id;
}

const sorters: Record<string, (a: Product, b: Product) => number> = {
    newest: (a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0),
    cheapest: (a, b) => a.final_price - b.final_price,
    expensive: (a, b) => b.final_price - a.final_price,
    bestselling: (a, b) => b.sold_count - a.sold_count,
    rating: (a, b) => b.rating - a.rating,
    discount: (a, b) => b.discount_percent - a.discount_percent,
};

function sorted(list: Product[], sort: string) {
    const primary = sorters[sort] ?? sorters.newest;
    return [...list].sort((a, b) => primary(a, b) || byId(a, b));
}

function readOrders(): Record<string, Order> {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as Record<string, Order>) : {};
    } catch {
        return {};
    }
}

function writeOrders(orders: Record<string, Order>) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch {}
}

export function readDemoOrder(code: string): Order | null {
    return readOrders()[code] ?? null;
}

export const demoApi = {
    home: async (): Promise<Home> => {
        const all = products.map(summary);
        return {
            deals: sorted(
                all.filter((p) => p.discount_percent > 0 && p.stock > 0),
                "discount",
            ).slice(0, 8),
            newest: sorted(all, "newest").slice(0, 8),
            bestsellers: sorted(all, "bestselling").slice(0, 8),
        };
    },

    config: async (): Promise<Config> => config,

    categories: async (): Promise<Category[]> => categories,

    brands: async (category?: string): Promise<Brand[]> => {
        const counts = new Map<number, number>();
        for (const product of products) {
            if (category && product.category.slug !== category) continue;
            const found = brands.find((b) => b.slug === product.brand.slug);
            if (found) counts.set(found.id, (counts.get(found.id) ?? 0) + 1);
        }
        return brands
            .map((b) => ({ ...b, product_count: counts.get(b.id) ?? 0 }))
            .filter((b) => b.product_count > 0 || !category);
    },

    products: async (query: ProductQuery): Promise<ProductPage> => {
        const term = query.q?.trim().toLowerCase();
        const min = query.min_price ? Number(query.min_price) : null;
        const max = query.max_price ? Number(query.max_price) : null;
        const brandSet =
            query.brand && query.brand.length ? new Set(query.brand) : null;

        const filtered = products.map(summary).filter((p) => {
            if (
                term &&
                !p.name.toLowerCase().includes(term) &&
                !p.name_en.toLowerCase().includes(term)
            )
                return false;
            if (query.category && p.category.slug !== query.category)
                return false;
            if (brandSet && !brandSet.has(p.brand.slug)) return false;
            if (min !== null && p.final_price < min) return false;
            if (max !== null && p.final_price > max) return false;
            if (query.in_stock === "true" && p.stock <= 0) return false;
            if (query.on_sale === "true" && p.discount_percent <= 0)
                return false;
            return true;
        });

        const size = Math.min(48, Math.max(1, Number(query.page_size) || 12));
        const page = Math.max(1, Number(query.page) || 1);
        const ordered = sorted(filtered, query.sort ?? "newest");

        return {
            items: ordered.slice((page - 1) * size, page * size),
            total: ordered.length,
            page,
            page_size: size,
            pages: Math.max(1, Math.ceil(ordered.length / size)),
        };
    },

    product: async (slug: string): Promise<ProductDetail> => {
        const found = products.find((p) => p.slug === slug);
        if (!found) throw new ApiError("محصول پیدا نشد", 404);
        return found;
    },

    related: async (slug: string): Promise<Product[]> => {
        const found = products.find((p) => p.slug === slug);
        if (!found) throw new ApiError("محصول پیدا نشد", 404);
        return sorted(
            products
                .filter(
                    (p) =>
                        p.category.slug === found.category.slug &&
                        p.id !== found.id,
                )
                .map(summary),
            "bestselling",
        ).slice(0, 5);
    },

    order: async (code: string): Promise<Order> => {
        const found =
            typeof window === "undefined" ? null : readDemoOrder(code);
        if (!found) throw new ApiError("سفارش پیدا نشد", 404);
        return found;
    },

    createOrder: async (body: unknown): Promise<Order> => {
        const input = body as OrderInput;
        const perProduct = new Map<number, number>();
        const perLine = new Map<
            string,
            { productId: number; color: string; quantity: number }
        >();

        for (const line of input.items) {
            const color = line.color.trim();
            perProduct.set(
                line.product_id,
                (perProduct.get(line.product_id) ?? 0) + line.quantity,
            );
            const key = `${line.product_id}::${color}`;
            const current = perLine.get(key);
            perLine.set(key, {
                productId: line.product_id,
                color,
                quantity: (current?.quantity ?? 0) + line.quantity,
            });
        }

        for (const [productId, quantity] of perProduct) {
            const product = products.find((p) => p.id === productId);
            if (!product)
                throw new ApiError(
                    "یکی از محصولات سبد خرید دیگر موجود نیست",
                    400,
                );
            if (quantity > 10)
                throw new ApiError(
                    `حداکثر تعداد سفارش «${product.name}» ۱۰ عدد است`,
                    400,
                );
            if (product.stock < quantity)
                throw new ApiError(`موجودی «${product.name}» کافی نیست`, 409);
        }

        let subtotal = 0;
        const items = [...perLine.values()].map((line) => {
            const product = products.find((p) => p.id === line.productId)!;
            subtotal += product.final_price * line.quantity;
            return {
                product_id: product.id,
                product_name: product.name,
                color: line.color,
                unit_price: product.final_price,
                quantity: line.quantity,
            };
        });

        const shippingFee =
            subtotal >= config.free_shipping_threshold
                ? 0
                : config.shipping_fee;
        const orders = readOrders();
        let code = "";
        do {
            code = `NV${Math.floor(10000000 + Math.random() * 90000000)}`;
        } while (orders[code]);

        const order: Order = {
            code,
            customer_name: input.customer_name,
            phone: input.phone,
            city: input.city,
            address: input.address,
            postal_code: input.postal_code,
            subtotal,
            shipping_fee: shippingFee,
            total: subtotal + shippingFee,
            status: "pending",
            created_at: new Date().toISOString(),
            items,
        };

        orders[code] = order;
        writeOrders(orders);
        return order;
    },
};
