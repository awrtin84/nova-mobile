const faNumber = new Intl.NumberFormat("fa-IR");

export function fa(value: number): string {
    return faNumber.format(value);
}

export function price(value: number): string {
    return faNumber.format(value);
}

export function faDate(iso: string): string {
    return new Intl.DateTimeFormat("fa-IR", {
        dateStyle: "long",
        timeStyle: "short",
    }).format(new Date(iso));
}

export function faRating(value: number): string {
    return new Intl.NumberFormat("fa-IR", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    }).format(value);
}
