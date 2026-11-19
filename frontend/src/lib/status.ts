export type StatusMeta = { value: string; label: string; tone: string };

export const STATUSES: StatusMeta[] = [
    {
        value: "pending",
        label: "در انتظار تأیید",
        tone: "bg-amber-100 text-amber-800",
    },
    { value: "confirmed", label: "تأیید شده", tone: "bg-sky-100 text-sky-800" },
    {
        value: "shipped",
        label: "ارسال شده",
        tone: "bg-violet-100 text-violet-800",
    },
    {
        value: "delivered",
        label: "تحویل داده شد",
        tone: "bg-emerald-100 text-emerald-800",
    },
    { value: "cancelled", label: "لغو شده", tone: "bg-rose-100 text-rose-800" },
];

export function statusMeta(value: string): StatusMeta {
    return (
        STATUSES.find((item) => item.value === value) ?? {
            value,
            label: value,
            tone: "bg-slate-100 text-slate-700",
        }
    );
}
