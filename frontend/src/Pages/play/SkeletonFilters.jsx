export function SkeletonFilters() {
    return (
        <div className="flex gap-3 overflow-x-auto pb-2 animate-pulse">
            {[1, 2, 3, 4, 5].map(i => (
                <div
                    key={i}
                    className="h-9 w-32 bg-gray-200 rounded-xl flex-shrink-0"
                />
            ))}
        </div>
    );
}
