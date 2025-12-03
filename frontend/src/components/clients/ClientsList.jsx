import { ClientItem } from "./ClientItem"

export const ClientsList = ({
    paginatedClientes,
    clientes,
    openMenu,
    onMenuClick,
    onClientClick,
    handleUploadSuccess,
    setIsSpinnerOpen,
    setSpinnerMessage,
    setToast
}) => {
    return (
        paginatedClientes.length > 0 ? (
            <div className="space-y-4 mb-8">
                {paginatedClientes.map((cliente) => (
                    <ClientItem
                        key={cliente.id_cuenta}
                        cliente={cliente}
                        isMenuOpen={openMenu === cliente.id_cuenta}
                        onMenuClick={onMenuClick}
                        onClick={() => {
                            onClientClick(cliente)
                        }}
                        handleUploadSuccess={handleUploadSuccess}
                        setIsSpinnerOpen={setIsSpinnerOpen}
                        setSpinnerMessage={setSpinnerMessage}
                        setToast={setToast}
                    />
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-12">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-600 mb-2">Sin clientes</h2>
                    <p className="text-sm text-gray-500">
                        {clientes.length === 0
                            ? "No hay clientes registrados aún, agrega un cliente para verlo listado aquí."
                            : "No se encontraron clientes con ese criterio"}
                    </p>
                </div>
            </div>
        )
    );
}