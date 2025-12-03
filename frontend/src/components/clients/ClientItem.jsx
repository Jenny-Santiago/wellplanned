import { MoreVertical } from 'lucide-react';
import { ItemMenu } from '../ItemMenu';
import { downloadJson } from '../../utils/downloadJson';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useConfirm } from '../../hooks/useConfirm';
import { apiService } from '../../services/api';

export const ClientItem = ({
    cliente,
    onMenuClick,
    isMenuOpen,
    onClick,
    handleUploadSuccess,
    setIsSpinnerOpen,
    setSpinnerMessage,
    setToast
}) => {
    const { confirmState, showConfirm, hideConfirm, handleConfirm } = useConfirm();

    const handleEdit = async () => {
        // Cerrar el menú inmediatamente
        onMenuClick(null);

        try {
            // Verificar que tenemos los datos necesarios
            const clienteId = cliente.id_cuenta;

            const contenido = {
                operacion: "CLI_U",
                contenido: {
                    id_cuenta: clienteId,
                    cliente: cliente.cliente,
                    tipo_proyecto: cliente.tipo_proyecto,
                    compromiso: cliente.compromiso
                }
            };

            downloadJson(contenido, `c-${clienteId}.json`);

        } catch (error) {
            alert('Error al descargar el JSON: ' + error.message);
        }
    };

    const handleDeleteClick = () => {
        // Cerrar el menú inmediatamente
        onMenuClick(null);

        showConfirm({
            title: 'Eliminar Cliente',
            message: `¿Estás seguro de que deseas eliminar el cliente "${cliente.cliente}"? Esta acción también eliminará todas las cargas de trabajo asociadas y no se puede deshacer.`,
            confirmText: 'Sí, eliminar',
            cancelText: 'Cancelar',
            onConfirm: handleDelete
        });
    };

    const handleDelete = async () => {
        try {
            // Obtener el ID correcto del cliente
            const clienteId = cliente.id_cuenta;

            if (!clienteId) {
                throw new Error('No se pudo obtener el ID del cliente');
            }

            setIsSpinnerOpen(true);
            setSpinnerMessage("Eliminando cliente, espere un momento ...");

            const response = await apiService.deleteClient(clienteId);

            setIsSpinnerOpen(false);
            handleUploadSuccess?.();

            setToast({
                isOpen: true,
                type: 'success',
                title: response.title,
                message: response.data.mensaje
            });

        } catch (error) {
            setIsSpinnerOpen(false);
            setToast({
                isOpen: true,
                type: 'error',
                title: 'Error al eliminar',
                message: error.message || 'No se pudo eliminar el cliente, intente más tarde'
            });
        }
    };

    return (
        <>
            <div
                onClick={onClick}
                className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-yellow-400/30 transition cursor-pointer"
            >
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Cliente</p>
                        <p className="text-xl font-bold text-yellow-400 mt-1">{cliente.cliente}</p>
                    </div>
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => onMenuClick(isMenuOpen ? null : cliente.id_cuenta)}
                            className="text-gray-400 hover:text-yellow-400 transition p-2 hover:bg-gray-800 rounded-md"
                        >
                            <MoreVertical size={20} />
                        </button>

                        <ItemMenu
                            isMenuOpen={isMenuOpen}
                            onEdit={handleEdit}
                            onDelete={handleDeleteClick}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Tipo de Proyecto</p>
                        <p className="text-lg text-gray-300 font-semibold mt-1">{cliente.tipo_proyecto}</p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Compromiso</p>
                        <p className="text-lg text-gray-300 font-semibold mt-1">{cliente.compromiso}</p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">ID</p>
                        <p className="text-sm text-gray-400 font-mono mt-1">{cliente.id_cuenta}</p>
                    </div>
                </div>
            </div>

            <ConfirmDialog
                isOpen={confirmState.isOpen}
                onClose={hideConfirm}
                onConfirm={handleConfirm}
                title={confirmState.title}
                message={confirmState.message}
                confirmText={confirmState.confirmText}
                cancelText={confirmState.cancelText}
                type={confirmState.type}
            />
        </>
    );
}