import { MoreVertical, Check, AlertTriangle } from 'lucide-react';
import { ItemMenu } from '../ItemMenu';
import { downloadJson } from '../../utils/downloadJson';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useConfirm } from '../../hooks/useConfirm';
import { apiService } from '../../services/api';

const getStatusColor = (status) => {
    switch (status) {
        case 'en_progreso':
            return 'from-yellow-500 to-yellow-600';
        case 'pausado':
            return 'from-blue-500 to-blue-600';
        case 'completado':
            return 'from-green-500 to-green-600';
        case 'cancelado':
            return 'from-red-500 to-red-600';
        default:
            return 'from-gray-500 to-gray-600';
    }
};

const getStatusProgress = (status) => {
    switch (status) {
        case 'en_progreso':
            return 25;
        case 'pausado':
            return 100;
        case 'completado':
            return 100;
        case 'cancelado':
            return 100; // Barra llena pero sin texto
        default:
            return 0;
    }
};

const getStatusLabel = (status) => {
    switch (status) {
        case 'en_progreso':
            return 'En Progreso';
        case 'pausado':
            return 'Pausado';
        case 'completado':
            return 'Completado';
        case 'cancelado':
            return 'Cancelado';
        default:
            return 'Desconocido';
    }
};

export const WorkLoadItem = ({
    well,
    isMenuOpen,
    selectedYear,
    onMenuClick,
    setIsSpinnerOpen,
    setSpinnerMessage,
    fetchWorkloads,
    setToast,
    refetchClients
}) => {
    const { confirmState, showConfirm, hideConfirm, handleConfirm } = useConfirm();

    const handleEdit = async () => {
        // Cerrar el menú inmediatamente
        onMenuClick(null);

        try {
            const contenido = {
                operacion: 'WL_U',
                contenido: {
                    id: well.id,
                    periodo: well.periodo,
                    id_cliente: well.id_cliente,
                    fecha_inicio: well.fecha_inicio,
                    fecha_fin: well.fecha_fin,
                    sdm: well.sdm,
                    status: well.status,
                    responsable_email: well.responsable_email
                }
            };

            downloadJson(contenido, `w-${well.id}.json`);
        } catch (error) {
            alert('Error al descargar el JSON: ' + error.message);
        }
    };

    const handleDeleteClick = () => {
        // Cerrar el menú inmediatamente
        onMenuClick(null);

        showConfirm({
            title: 'Eliminar Carga de Trabajo',
            message: `¿Estás seguro de que deseas eliminar la carga de trabajo "${well.id}"? Esta acción no se puede deshacer.`,
            confirmText: 'Sí, eliminar',
            cancelText: 'Cancelar',
            onConfirm: handleDelete
        });
    };

    const handleDelete = async () => {
        try {
            setIsSpinnerOpen(true);
            setSpinnerMessage("Eliminando carga de trabajo...");

            // Extraer año y mes desde periodo
            const [realYear, realMonth] = well.periodo.split("-");

            await apiService.deleteWorkload(
                well.id,
                well.id_cliente,
                realYear,
                realMonth
            );

            // Refrescar workloads del modal con el año seleccionado
            await fetchWorkloads?.(selectedYear);

            // Refrescar clientes en el dashboard
            await refetchClients?.();

            setIsSpinnerOpen(false);

            setToast({
                isOpen: true,
                type: 'success',
                title: 'Carga eliminada',
                message: 'Carga de trabajo eliminada correctamente'
            });

        } catch (error) {
            setIsSpinnerOpen(false);
            setToast({
                isOpen: true,
                type: 'error',
                title: 'Error al eliminar',
                message: error.message || 'No se pudo eliminar la carga de trabajo, intente más tarde'
            });
        }
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition">

            {/* Header: Well ID y menú */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Well ID</p>
                    <p className="text-lg font-bold text-yellow-400 mt-1">{well.id}</p>
                </div>
                <div className="relative">
                    <button
                        onClick={() => onMenuClick(isMenuOpen ? null : well.id)}
                        className="text-gray-400 hover:text-yellow-400 transition p-2 hover:bg-gray-800 rounded-md"
                    >
                        <MoreVertical size={20} />
                    </button>

                    {isMenuOpen && (
                        <ItemMenu
                            isMenuOpen={isMenuOpen}
                            onEdit={handleEdit}
                            onDelete={handleDeleteClick}
                        />
                    )}
                </div>
            </div>

            {/* Fila: Encargado Técnico y Notificación centrada */}
            <div className="flex items-center mb-4 relative">
                {/* Encargado Técnico */}
                <div className="flex-shrink-0">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Encargado Técnico</p>
                    <p className="text-sm text-gray-300 mt-1">{well.responsable}</p>
                </div>

                {/* Notificación desplazada ligeramente más a la derecha */}
                <div className="absolute left-[70%] transform -translate-x-1/2 flex flex-col items-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Notificación</p>
                    <div className="flex items-center gap-2 mt-1">
                        {well.notificacion === 'enviada' ? (
                            <Check size={20} className="text-gray-300" />
                        ) : (
                            <AlertTriangle size={20} className="text-gray-300" />
                        )}
                        <p className="text-sm text-gray-300">
                            {well.notificacion === 'enviada' ? 'Enviada' : 'Pendiente'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Barra de progreso completa con % al lado */}
            <p className="text-xs text-gray-500 uppercase tracking-wide">Estado</p>
            <p className={`text-xs font-bold text-gray-300 mt-1 ${well.status === "cancelado" || well.status === "pausado" && "mb-2"}`}>{getStatusLabel(well.status)}</p>


            <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                    <div
                        className={`h-full bg-gradient-to-r ${getStatusColor(well.status)} transition-all duration-500`}
                        style={{ width: `${getStatusProgress(well.status)}%` }}
                    />
                </div>
                <p className="text-sm text-gray-300">
                    {(well.status !== "cancelado" && well.status !== "pausado") && `${getStatusProgress(well.status)}%`}
                </p>
            </div >


            {/* Período */}
            < div className="mb-4" >
                <p className="text-xs text-gray-500 uppercase tracking-wide">Período</p>
                <p className="text-sm text-gray-300 mt-1">{well.fecha_inicio} a {well.fecha_fin}</p>
            </div >

            {/* SDM */}
            < div >
                <p className="text-xs text-gray-500 uppercase tracking-wide">SDM</p>
                <p className="text-sm text-gray-300 mt-1">{well.sdm}</p>
            </div >

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
        </div >
    );
};
