const BookingCardSkeleton = () => {
    return (
        <div className="border rounded-xl p-5 flex flex-col md:flex-row justify-between animate-pulse min-h-[140px]">

            <div className="flex items-center gap-4 w-full">
                <div className="text-center">
                    <div className="h-8 w-10 shimmer rounded mb-2"></div>
                    <div className="h-4 w-8 shimmer rounded"></div>
                </div>

                <div className="border-l pl-4 space-y-3 w-full">
                    <div className="h-4 w-1/3 shimmer rounded"></div>
                    <div className="h-4 w-2/3 shimmer rounded"></div>
                    <div className="h-3 w-1/2 shimmer rounded"></div>
                    <div className="h-3 w-1/4 shimmer rounded"></div>
                </div>
            </div>

            <div className="flex gap-4 mt-4 md:mt-0">
                <div className="h-8 w-16 shimmer rounded"></div>
                <div className="h-8 w-16 shimmer rounded"></div>
            </div>
        </div>
    );
}

const SidebarSkeleton = () => {
    return (
        <div className="bg-white border rounded-xl p-4 animate-pulse">

            <div className="flex flex-col items-center border-b pb-4">
                <div className="w-20 h-20 bg-gray-300 rounded-full"></div>
                <div className="h-4 w-32 bg-gray-300 rounded mt-3"></div>
                <div className="h-3 w-24 bg-gray-200 rounded mt-2"></div>
                <div className="h-3 w-40 bg-gray-200 rounded mt-2"></div>
            </div>

            <div className="mt-4 space-y-3">
                <div className="h-10 bg-gray-300 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
            </div>
        </div>
    );
}

const EditProfileSkeleton = () => {
    return (
        <div className="p-6 animate-pulse">

            {/* Avatar Section */}
            <div className="flex justify-center items-center border-b pb-8">
                <div className="w-28 h-28 rounded-full bg-gray-200" />
            </div>

            {/* Form Section */}
            <div className="mt-10 space-y-6">

                <div className="grid md:grid-cols-2 gap-6">

                    {/* Name */}
                    <div>
                        <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                        <div className="h-10 w-full bg-gray-200 rounded-md" />
                    </div>

                    {/* Phone */}
                    <div>
                        <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
                        <div className="h-10 w-full bg-gray-200 rounded-md" />
                    </div>

                    {/* Email */}
                    <div className="md:col-span-2">
                        <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
                        <div className="h-10 w-full bg-gray-200 rounded-md" />
                    </div>

                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t">
                    <div className="h-10 w-24 bg-gray-200 rounded-md" />
                    <div className="h-10 w-32 bg-gray-200 rounded-md" />
                </div>

            </div>
        </div>
    );
}

export { BookingCardSkeleton, SidebarSkeleton, EditProfileSkeleton };