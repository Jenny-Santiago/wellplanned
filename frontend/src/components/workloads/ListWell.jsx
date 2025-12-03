import { WorkLoadItem } from './WorkLoadItem';

export const ListWell = ({
    paginatedWells,
    selectedYear,
    openMenu, onMenuClick, setIsSpinnerOpen, setSpinnerMessage, fetchWorkloads, setToast, refetchClients }) => {
    return (
        paginatedWells.length > 0 ? (
            <div className="space-y-4">
                {paginatedWells.map((well) => (
                    <WorkLoadItem
                        key={well.id}
                        well={well}
                        selectedYear={selectedYear}
                        isMenuOpen={openMenu === well.id}
                        onMenuClick={onMenuClick}
                        setIsSpinnerOpen={setIsSpinnerOpen}
                        setSpinnerMessage={setSpinnerMessage}
                        fetchWorkloads={fetchWorkloads}
                        setToast={setToast}
                        refetchClients={refetchClients}
                    />
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-12">
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        Sin cargas de trabajo
                    </h3>
                    <p className="text-sm text-gray-500">
                        No hay wells registrados para el año {selectedYear}
                    </p>
                </div>
            </div>
        )
    );
}