import { SearchBar } from './SearchBar';
import { Pagination } from './Pagination';
import { ClientsList } from './clients/ClientsList';
import { Skeleton } from './Skeleton';
import { useSearch } from '../hooks/useSearch';
import { usePagination } from '../hooks/usePagination';

const ITEMS_PER_PAGE = 3;

export const ClientsSection = ({
    clientes,
    isLoading,
    onClientClick,
    openMenu,
    onMenuClick,
    handleUploadSuccess,
    setIsSpinnerOpen,
    setSpinnerMessage,
    setToast
}) => {
    const { searchTerm, setSearchTerm, filteredItems } = useSearch(clientes, ['cliente', 'id_cuenta', 'tipo_proyecto']);
    const {
        currentPage,
        totalPages,
        paginatedData,
        goToPage,
        resetPage
    } = usePagination(filteredItems, ITEMS_PER_PAGE);

    const handleSearchChange = () => {
        resetPage();
    };

    return (
        <>
            <h3 className="text-xl font-bold text-gray-100 mb-6">
                Clientes <span className="text-sm text-gray-400">({filteredItems.length})</span>
            </h3>

            <SearchBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onSearchChange={handleSearchChange}
            />

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
                filteredClientesLength={filteredItems.length}
                itemsPerPage={ITEMS_PER_PAGE}
            />

            {isLoading ? (
                <Skeleton items={[1, 2, 3]} />
            ) : (
                <ClientsList
                    paginatedClientes={paginatedData}
                    clientes={clientes}
                    openMenu={openMenu}
                    onMenuClick={onMenuClick}
                    onClientClick={onClientClick}
                    handleUploadSuccess={handleUploadSuccess}
                    setIsSpinnerOpen={setIsSpinnerOpen}
                    setSpinnerMessage={setSpinnerMessage}
                    setToast={setToast}
                />
            )}
        </>
    );
};