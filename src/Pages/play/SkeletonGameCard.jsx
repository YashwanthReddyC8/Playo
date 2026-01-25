export default function SkeletonGameCard() {
    return (
        <div className="
      bg-white rounded-2xl p-4
      border border-gray-200
      animate-pulse
    ">
            <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
            <div className="h-5 w-3/4 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-1/2 bg-gray-200 rounded mb-1" />
            <div className="h-4 w-2/3 bg-gray-200 rounded mb-4" />

            <div className="flex justify-between items-center">
                <div className="h-4 w-20 bg-gray-200 rounded" />
                <div className="h-6 w-16 bg-gray-200 rounded-lg" />
            </div>
        </div>
    );
}
