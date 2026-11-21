export default function Loading() {
    return (
        <div className="container-page py-5 md:py-8">
            <div className="skeleton h-9 w-48 rounded-xl" />
            <div className="mt-5 grid gap-6 lg:grid-cols-[16rem_1fr]">
                <div className="skeleton hidden h-96 rounded-[1.75rem] lg:block" />
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
                    {Array.from({ length: 9 }).map((_, index) => (
                        <div
                            key={index}
                            className="skeleton h-64 rounded-[1.75rem]"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
