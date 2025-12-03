import { useState, useMemo, useEffect } from 'react';

export const usePagination = (items, itemsPerPage = 3) => {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(items.length / itemsPerPage);

    // Si la página actual está fuera de rango, volver a la última página válida
    useEffect(() => {
        if (items.length > 0 && currentPage > totalPages) {
            setCurrentPage(Math.max(1, totalPages));
        }
    }, [items.length, currentPage, totalPages]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return items.slice(startIndex, endIndex);
    }, [items, currentPage, itemsPerPage]);

    const goToPage = (page) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    const nextPage = () => {
        goToPage(currentPage + 1);
    };

    const prevPage = () => {
        goToPage(currentPage - 1);
    };

    const resetPage = () => {
        setCurrentPage(1);
    };

    return {
        currentPage,
        totalPages,
        paginatedData,
        goToPage,
        nextPage,
        prevPage,
        resetPage,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1
    };
};