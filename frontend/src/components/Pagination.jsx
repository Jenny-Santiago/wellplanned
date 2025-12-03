import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
    filteredClientesLength,
    itemsPerPage
}) => {
    // Función para calcular qué páginas mostrar
    const getVisiblePages = () => {
        const maxVisible = 3; // Máximo de páginas visibles
        
        if (totalPages <= maxVisible) {
            // Si hay pocas páginas, mostrar todas
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        
        const half = Math.floor(maxVisible / 2);
        let start = Math.max(1, currentPage - half);
        let end = Math.min(totalPages, start + maxVisible - 1);
        
        // Ajustar si estamos cerca del final
        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }
        
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    const visiblePages = getVisiblePages();
    const showFirstPage = visiblePages[0] > 1;
    const showLastPage = visiblePages[visiblePages.length - 1] < totalPages;
    const showFirstEllipsis = visiblePages[0] > 2;
    const showLastEllipsis = visiblePages[visiblePages.length - 1] < totalPages - 1;

    return (
        filteredClientesLength > itemsPerPage && (
            <div className="mt-10 mb-5">
                {/* Información de página actual - arriba */}
                <div className="flex justify-end mb-2">
                    <div className="text-sm text-gray-400">
                        Página {currentPage} de {totalPages}
                    </div>
                </div>

                {/* Controles de paginación */}
                <div className="flex items-center justify-end gap-2">
                    {/* Botón anterior */}
                    <button
                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-1 px-2 rounded transition text-sm"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    <div className="flex items-center gap-1">
                        {/* Primera página */}
                        {showFirstPage && (
                            <>
                                <button
                                    onClick={() => onPageChange(1)}
                                    className="w-7 h-7 rounded text-xs font-semibold transition flex items-center justify-center bg-gray-800 text-gray-300 hover:bg-gray-700"
                                >
                                    1
                                </button>
                                {showFirstEllipsis && (
                                    <span className="text-gray-500 px-1">...</span>
                                )}
                            </>
                        )}

                        {/* Páginas visibles */}
                        {visiblePages.map((page) => (
                            <button
                                key={page}
                                onClick={() => onPageChange(page)}
                                className={`w-7 h-7 rounded text-xs font-semibold transition flex items-center justify-center ${
                                    currentPage === page
                                        ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50'
                                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                }`}
                            >
                                {page}
                            </button>
                        ))}

                        {/* Última página */}
                        {showLastPage && (
                            <>
                                {showLastEllipsis && (
                                    <span className="text-gray-500 px-1">...</span>
                                )}
                                <button
                                    onClick={() => onPageChange(totalPages)}
                                    className="w-7 h-7 rounded text-xs font-semibold transition flex items-center justify-center bg-gray-800 text-gray-300 hover:bg-gray-700"
                                >
                                    {totalPages}
                                </button>
                            </>
                        )}
                    </div>

                    {/* Botón siguiente */}
                    <button
                        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-1 px-2 rounded transition text-sm"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        )
    );
};