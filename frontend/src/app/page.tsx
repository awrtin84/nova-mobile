import Link from "next/link";
import ProductRail from "@/components/ProductRail";
import ProductVisual from "@/components/ProductVisual";
import { api } from "@/lib/api";
import { fa, price } from "@/lib/format";

const categoryHue: Record<string, number> = {
    mobile: 250,
    tablet: 200,
    smartwatch: 160,
    audio: 330,
    charger: 40,
    powerbank: 20,
    case: 280,
    protector: 190,
    speaker: 0,
};

export default async function HomePage() {
    const [home, categories, brands] = await Promise.all([
        api.home(),
        api.categories(),
        api.brands(),
    ]);
    const featured = home.bestsellers[0];
    const dealCard = home.deals[0];
    const newCard = home.newest[0];
    const total = categories.reduce(
        (sum, category) => sum + category.product_count,
        0,
    );

    return (
        <>
            <section className="container-page pt-4 md:pt-6">
                <div className="hero-night relative overflow-hidden rounded-[2rem] text-white shadow-lift md:rounded-[2.5rem]">
                    <div
                        className="pointer-events-none absolute inset-0 opacity-[.08]"
                        style={{
                            backgroundImage:
                                "radial-gradient(#fff 1px, transparent 1px)",
                            backgroundSize: "22px 22px",
                        }}
                    />

                    <div className="relative grid items-center gap-8 px-5 pb-9 pt-8 md:grid-cols-2 md:gap-10 md:px-14 md:py-16">
                        <div className="animate-fade-up">
                            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold ring-1 ring-white/15 backdrop-blur">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint-400 opacity-75" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-mint-400" />
                                </span>
                                جشنواره تخفیف موبایل
                            </span>

                            <h1 className="mt-5 text-[2rem] font-black leading-[1.4] sm:text-5xl md:leading-[1.35]">
                                گوشی رویایی‌ات
                                <br />
                                <span className="text-gradient">
                                    با بهترین قیمت
                                </span>{" "}
                                اینجاست
                            </h1>
                            <p className="mt-4 max-w-md text-sm leading-7 text-white/70 sm:text-base">
                                از پرچم‌دارهای اپل و سامسونگ تا شارژر و کابل
                                اورجینال؛ همه‌چیز در یک فروشگاه، با ارسال سریع و
                                ضمانت اصالت.
                            </p>

                            <div className="mt-6 flex gap-3">
                                <Link
                                    href="/products?category=mobile"
                                    className="btn flex-1 bg-white text-ink shadow-lift hover:bg-brand-50 md:flex-none md:px-8"
                                >
                                    خرید گوشی
                                </Link>
                                <Link
                                    href="/products?on_sale=true&sort=discount"
                                    className="btn flex-1 text-white ring-1 ring-white/25 backdrop-blur hover:bg-white/10 md:flex-none md:px-8"
                                >
                                    تخفیف‌ها
                                </Link>
                            </div>

                            <dl className="mt-8 grid grid-cols-3 gap-3 text-center md:max-w-md">
                                {[
                                    { value: fa(total), label: "محصول" },
                                    {
                                        value: fa(brands.length),
                                        label: "برند معتبر",
                                    },
                                    {
                                        value: "رایگان",
                                        label: "ارسال بالای ۵ میلیون",
                                    },
                                ].map((stat) => (
                                    <div
                                        key={stat.label}
                                        className="rounded-2xl bg-white/[.07] px-2 py-3 ring-1 ring-white/10 backdrop-blur"
                                    >
                                        <dt className="text-lg font-black">
                                            {stat.value}
                                        </dt>
                                        <dd className="mt-0.5 text-[11px] leading-4 text-white/60">
                                            {stat.label}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </div>

                        {featured && (
                            <div className="relative mx-auto w-full max-w-[19rem] md:max-w-sm">
                                <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-brand-400/40 to-coral-500/40 blur-2xl" />
                                <Link
                                    href={`/products/${featured.slug}`}
                                    className="relative block animate-float overflow-hidden rounded-[2rem] bg-white text-ink shadow-glow"
                                >
                                    <div className="aspect-[5/4]">
                                        <ProductVisual
                                            kind={featured.visual_kind}
                                            hue={featured.hue}
                                        />
                                    </div>
                                    <div className="p-4">
                                        <p className="text-[11px] font-black text-coral-600">
                                            پرفروش‌ترین محصول
                                        </p>
                                        <p className="mt-1 line-clamp-1 text-sm font-bold">
                                            {featured.name}
                                        </p>
                                        <p className="mt-2 text-lg font-black">
                                            {price(featured.final_price)}{" "}
                                            <span className="text-xs font-semibold text-ink-soft">
                                                تومان
                                            </span>
                                        </p>
                                    </div>
                                </Link>
                                <span className="absolute -start-2 top-6 animate-pop rounded-2xl bg-white px-3 py-2 text-xs font-extrabold text-ink shadow-lift">
                                    ضمانت اصالت
                                </span>
                                <span className="absolute -end-2 bottom-24 animate-pop rounded-2xl bg-gradient-to-br from-coral-400 to-coral-600 px-3 py-2 text-xs font-extrabold text-white shadow-lift">
                                    ارسال سریع
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="container-page mt-7 md:mt-10">
                <div className="snap-rail md:grid md:grid-cols-5 md:gap-4 lg:grid-cols-9">
                    {categories.map((category) => (
                        <Link
                            key={category.slug}
                            href={`/products?category=${category.slug}`}
                            className="group flex w-[5.4rem] flex-col items-center gap-2 text-center md:w-auto"
                        >
                            <span className="block aspect-square w-full overflow-hidden rounded-[1.6rem] shadow-card ring-1 ring-slate-900/[.05] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-lift">
                                <ProductVisual
                                    kind={category.kind}
                                    hue={categoryHue[category.slug] ?? 250}
                                />
                            </span>
                            <span className="text-[12px] font-bold leading-5 text-ink-soft group-hover:text-brand-700">
                                {category.name}
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="container-page mt-8 grid gap-3 md:mt-12 md:grid-cols-2 md:gap-5">
                <Link
                    href="/products?on_sale=true&sort=discount"
                    className="group relative flex min-h-[10.5rem] items-center overflow-hidden rounded-[2rem] bg-gradient-to-br from-coral-500 via-coral-600 to-sun-500 p-6 text-white shadow-lift md:min-h-[13rem] md:p-8"
                >
                    <div className="relative z-10 max-w-[58%]">
                        <p className="text-xs font-extrabold text-white/80">
                            فرصت محدود
                        </p>
                        <h3 className="mt-1 text-xl font-black leading-8 md:text-2xl">
                            تخفیف‌های ویژه
                        </h3>
                        <p className="mt-1 text-xs leading-6 text-white/80 md:text-sm">
                            تا ۱۵٪ تخفیف روی گوشی و لوازم جانبی
                        </p>
                        <span className="mt-4 inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-xs font-extrabold text-coral-600">
                            مشاهده همه ←
                        </span>
                    </div>
                    {dealCard && (
                        <div className="absolute -bottom-5 -end-3 w-40 -rotate-6 overflow-hidden rounded-3xl shadow-2xl ring-4 ring-white/30 transition duration-500 group-hover:rotate-0 md:w-52">
                            <div className="aspect-[5/4]">
                                <ProductVisual
                                    kind={dealCard.visual_kind}
                                    hue={dealCard.hue}
                                />
                            </div>
                        </div>
                    )}
                </Link>

                <Link
                    href="/products?category=mobile&sort=newest"
                    className="group relative flex min-h-[10.5rem] items-center overflow-hidden rounded-[2rem] bg-gradient-to-br from-night via-night-700 to-brand-700 p-6 text-white shadow-lift md:min-h-[13rem] md:p-8"
                >
                    <div className="relative z-10 max-w-[58%]">
                        <p className="text-xs font-extrabold text-brand-300">
                            تازه رسیده
                        </p>
                        <h3 className="mt-1 text-xl font-black leading-8 md:text-2xl">
                            جدیدترین گوشی‌ها
                        </h3>
                        <p className="mt-1 text-xs leading-6 text-white/70 md:text-sm">
                            پرچمدارهای امسال با گارانتی معتبر
                        </p>
                        <span className="mt-4 inline-flex items-center gap-1 rounded-full bg-white/15 px-4 py-2 text-xs font-extrabold ring-1 ring-white/20">
                            مشاهده همه ←
                        </span>
                    </div>
                    {newCard && (
                        <div className="absolute -bottom-5 -end-3 w-40 rotate-6 overflow-hidden rounded-3xl shadow-2xl ring-4 ring-white/20 transition duration-500 group-hover:rotate-0 md:w-52">
                            <div className="aspect-[5/4]">
                                <ProductVisual
                                    kind={newCard.visual_kind}
                                    hue={newCard.hue}
                                />
                            </div>
                        </div>
                    )}
                </Link>
            </section>

            <ProductRail
                title="تخفیف‌های ویژه"
                subtitle="بیشترین تخفیف‌های این هفته"
                href="/products?on_sale=true&sort=discount"
                products={home.deals}
            />

            <section className="container-page mt-10 md:mt-14">
                <div className="mb-4 flex items-center gap-3">
                    <span className="h-7 w-1.5 rounded-full bg-gradient-to-b from-brand-500 to-coral-500" />
                    <h2 className="text-lg font-black sm:text-2xl">
                        برندهای محبوب
                    </h2>
                </div>
                <div className="snap-rail md:flex md:flex-wrap md:gap-3">
                    {brands
                        .filter((brand) => brand.product_count > 0)
                        .map((brand) => (
                            <Link
                                key={brand.slug}
                                href={`/products?brand=${brand.slug}`}
                                className="flex items-center gap-2.5 rounded-full bg-white py-2 pe-5 ps-2 text-sm font-extrabold shadow-card ring-1 ring-slate-900/[.05] transition hover:ring-brand-300"
                            >
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-brand-200 text-xs font-black text-brand-700">
                                    {brand.name_en.charAt(0)}
                                </span>
                                {brand.name}
                            </Link>
                        ))}
                </div>
            </section>

            <ProductRail
                title="پرفروش‌ترین‌ها"
                subtitle="انتخاب بیشتر مشتریان"
                href="/products?sort=bestselling"
                products={home.bestsellers}
            />
            <ProductRail
                title="جدیدترین محصولات"
                href="/products?sort=newest"
                products={home.newest}
            />
        </>
    );
}
