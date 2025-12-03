import { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { YearSelector } from '../YearSelector';
import { ListWell } from './ListWell';
import { Skeleton } from '../Skeleton';
import { useWorkloads } from '../../hooks/useWorkloads';
import { usePagination } from '../../hooks/usePagination';

export const WellsModal = ({ cliente, isOpen, onClose, setIsSpinnerOpen, setSpinnerMessage, setToast, refetchClients }) => {
    const [selectedYear, setSelectedYear] = useState("");
    const [openMenu, setOpenMenu] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isReady, setIsReady] = useState(false);

    const { workloads, availableYears, currentYear, isLoading, refetch } = useWorkloads(
        isOpen && cliente ? cliente.id_cuenta : null, selectedYear);

    const { currentPage, totalPages, paginatedData, goToPage } = usePagination(workloads, 3);

    // TODOS LOS HOOKS DEBEN ESTAR ANTES DEL RETURN
    useEffect(() => {
        if (!selectedYear && currentYear) {
            setSelectedYear(currentYear);
        }
    }, [currentYear, selectedYear]);

    // Reset cuando se cierra
    useEffect(() => {
        if (!isOpen) {
            setIsInitialized(false);
            setIsReady(false);
            setSelectedYear("");
            setOpenMenu(null);
        }
    }, [isOpen]);

    // Controlar cuando mostrar el contenido (evitar parpadeo)
    useEffect(() => {
        if (!isLoading) {
            // Pequeño delay para asegurar que todo esté renderizado
            const timer = setTimeout(() => {
                setIsReady(true);
            }, 100);
            return () => clearTimeout(timer);
        } else {
            setIsReady(false);
        }
    }, [isLoading]);
    
    // Forzar refresh cuando se abre el modal o cambia el cliente
    useEffect(() => {
        if (isOpen && cliente && selectedYear) {
            refetch(selectedYear);
        }
    }, [isOpen, cliente?.id_cuenta]);

    // Ajustar año seleccionado si ya no existe en availableYears
    useEffect(() => {
        if (selectedYear && availableYears.length > 0) {
            // Si el año seleccionado ya no existe en los años disponibles
            if (!availableYears.includes(selectedYear)) {
                setSelectedYear(availableYears[0]);
                goToPage(1); // Reset a la primera página
            }
        } else if (!selectedYear && availableYears.length > 0) {
            // Si no hay año seleccionado pero hay años disponibles
            setSelectedYear(availableYears[0]);
        }
    }, [availableYears, selectedYear]);

    // Mostrar el modal inmediatamente cuando se abre
    if (!isOpen || !cliente) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`bg-gray-950 border border-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-fadeIn ${
                !isLoading && workloads.length === 0 ? 'h-auto' : 'h-[600px]'
            }`}>

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <div>
                        <h2 className="text-2xl font-bold text-yellow-400">{cliente.cliente}</h2>
                        <p className="text-sm text-gray-400 mt-1">{cliente.tipo_proyecto}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-yellow-400 transition p-2 hover:bg-gray-800 rounded-md"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Mostrar selector de año solo si está listo */}
                {isReady && (workloads.length > 0 || availableYears.length > 0) && (
                    <YearSelector
                        selectedYear={selectedYear}
                        availableYears={availableYears}
                        onYearChange={(e) => {
                            setSelectedYear(Number(e.target.value));
                            goToPage(1);
                        }}
                    />
                )}

                <div className={`flex-1 overflow-y-auto p-6 ${
                    isReady && workloads.length === 0 ? '' : 'min-h-[400px]'
                }`}>
                    {!isReady ? (
                        <Skeleton items={[1, 2]} />
                    ) : workloads.length > 0 ? (
                        <ListWell
                            paginatedWells={paginatedData}
                            selectedYear={selectedYear}
                            openMenu={openMenu}
                            setIsSpinnerOpen={setIsSpinnerOpen}
                            setSpinnerMessage={setSpinnerMessage}
                            fetchWorkloads={refetch}
                            onMenuClick={setOpenMenu}
                            setToast={setToast}
                            refetchClients={refetchClients}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                            <Info size={48} className="mb-3 text-gray-500" />
                            <p className="text-sm md:text-base text-gray-400">
                                No hay información disponible.
                            </p>
                        </div>
                    )}
                </div>

                {isReady && workloads.length > 3 && (
                    <div className="flex items-center justify-end gap-2 p-6 border-t border-gray-800">
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-700 disabled:cursor-not-allowed text-black font-semibold py-1 px-2 rounded transition text-sm"
                        >
                            <ChevronLeft size={16} />
                        </button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => goToPage(page)}
                                    className={`w-7 h-7 rounded text-xs font-semibold transition flex items-center justify-center ${currentPage === page
                                        ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/50'
                                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-700 disabled:cursor-not-allowed text-black font-semibold py-1 px-2 rounded transition text-sm"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div >
    );
};
