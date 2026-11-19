export default function Loading() {
    return (
        <div className="container-page py-5 md:py-8">
            <div className="skeleton h-48 rounded-[2rem] md:h-80" />
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                {Array.from({ length: 8 }).map((_, index) => (
                    <div
                        key={index}
                        className="skeleton h-64 rounded-[1.75rem]"
                    />
                ))}
            </div>
        </div>
    );
}
