import Link from "next/link";
import { fa } from "@/lib/format";

type Props = {
  page: number;
  pages: number;
  params: Record<string, string | string[] | undefined>;
};

function href(params: Props["params"], page: number) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (key === "page" || value === undefined) continue;
    if (Array.isArray(value)) value.forEach((v) => search.append(key, v));
    else search.set(key, value);
  }
  if (page > 1) search.set("page", String(page));
  const text = search.toString();
  return text ? `/products?${text}` : "/products";
}

export default function Pagination({ page, pages, params }: Props) {
  if (pages <= 1) return null;

  const numbers = Array.from({ length: pages }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === pages || Math.abs(n - page) <= 1,
  );

  const items: (number | "gap")[] = [];
  numbers.forEach((n, i) => {
    if (i > 0 && n - numbers[i - 1] > 1) items.push("gap");
    items.push(n);
  });

  return (
    <nav aria-label="صفحه‌بندی" className="mt-10 flex flex-wrap items-center justify-center gap-2">
      {page > 1 && (
        <Link href={href(params, page - 1)} className="btn-ghost !px-4 !py-2.5">
          قبلی
        </Link>
      )}
      {items.map((item, index) =>
        item === "gap" ? (
          <span key={`gap-${index}`} className="px-1 text-ink-mute">
            …
          </span>
        ) : (
          <Link
            key={item}
            href={href(params, item)}
            aria-current={item === page ? "page" : undefined}
            className={`flex h-11 min-w-11 items-center justify-center rounded-2xl px-3 text-sm font-bold transition ${
              item === page ? "bg-brand-600 text-white shadow-lift" : "bg-white text-ink-soft hover:bg-brand-50"
            }`}
          >
            {fa(item)}
          </Link>
        ),
      )}
      {page < pages && (
        <Link href={href(params, page + 1)} className="btn-ghost !px-4 !py-2.5">
          بعدی
        </Link>
      )}
    </nav>
  );
}
