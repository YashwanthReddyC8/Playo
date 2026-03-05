import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

export default function Pagination({ currentPage, totalPages, onPageChange }) {

    const generatePages = () => {
        const pages = [];

        if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        if (currentPage <= 3) {
            return [1, 2, 3, "...", totalPages];
        }

        if (currentPage >= totalPages - 2) {
            return [1, "...", totalPages - 2, totalPages - 1, totalPages];
        }

        return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
    };

    const pages = generatePages();

    return (
        <nav className="inline-flex rounded-md shadow-sm" aria-label="Pagination">

            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-[#E3E8E6] bg-white rounded-l-md hover:bg-gray-50 disabled:opacity-50"
            >
                <ChevronLeftIcon className="w-5 h-5" />
            </button>

            {pages.map((page, index) =>
                page === "..." ? (
                    <span key={index} className="px-4 py-2 border border-[#E3E8E6] bg-white text-gray-500">
                        ...
                    </span>
                ) : (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`px-4 py-2 border ${currentPage === page
                                ? "bg-green-600 text-white border-green-600"
                                : "bg-white text-gray-700 border-[#E3E8E6] hover:bg-gray-50"
                            }`}
                    >
                        {page}
                    </button>
                )
            )}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-[#E3E8E6] bg-white rounded-r-md hover:bg-gray-50 disabled:opacity-50"
            >
                <ChevronRightIcon className="w-5 h-5" />
            </button>
        </nav>
    );
}