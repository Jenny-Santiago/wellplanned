import { X, AlertTriangle, CheckCircle } from 'lucide-react';

export const ValidationErrorModal = ({ 
    isOpen = false, 
    errores = [], 
    onClose = () => {},
    tipo = 'error', // 'error' o 'partial'
    exitosos = 0,
    fallidos = 0
}) => {
    
    if (!isOpen) return null;

    const isPartial = tipo === 'partial';
    
    // Calcular el total de errores individuales
    const totalErroresIndividuales = errores.reduce((total, error) => {
        if (typeof error === 'object' && Array.isArray(error.detalle)) {
            return total + error.detalle.length;
        }
        return total + 1;
    }, 0);
    const colorScheme = isPartial ? {
        border: 'border-blue-700/50',
        bg: 'bg-blue-900/30',
        borderB: 'border-blue-700/50',
        icon: 'text-blue-400',
        title: 'text-blue-400',
        itemBorder: 'border-blue-700/30',
        itemHover: 'hover:border-blue-600/50',
        bullet: 'text-blue-400',
        titleText: 'text-blue-300',
        button: 'bg-blue-600 hover:bg-blue-500',
        scrollThumb: '#3b82f6',
        scrollThumbHover: '#2563eb'
    } : {
        border: 'border-red-700/50',
        bg: 'bg-red-900/30',
        borderB: 'border-red-700/50',
        icon: 'text-red-400',
        title: 'text-red-400',
        itemBorder: 'border-red-700/30',
        itemHover: 'hover:border-red-600/50',
        bullet: 'text-red-400',
        titleText: 'text-red-300',
        button: 'bg-red-600 hover:bg-red-500',
        scrollThumb: '#ef4444',
        scrollThumbHover: '#dc2626'
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] animate-in fade-in duration-200">
            <div className={`bg-gray-900 border ${colorScheme.border} rounded-lg w-full max-w-md max-h-[500px] flex flex-col shadow-2xl`}>
                
                {/* Header */}
                <div className={`${colorScheme.bg} border-b ${colorScheme.borderB} px-5 py-4 flex items-start gap-3`}>
                    <div className="flex-shrink-0 mt-0.5">
                        {isPartial ? (
                            <CheckCircle className={colorScheme.icon} size={22} />
                        ) : (
                            <AlertTriangle className={colorScheme.icon} size={22} />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className={`text-lg font-bold ${colorScheme.title}`}>
                            {isPartial ? 'Creación Parcial' : 'Errores de Validación'}
                        </h2>
                        <p className="text-gray-300 text-sm mt-1">
                            {isPartial ? (
                                <>
                                    <span className="font-semibold text-green-400">{exitosos} exitosos</span>
                                    {' • '}
                                    <span className="font-semibold text-orange-400">{fallidos} fallaron</span>
                                </>
                            ) : (
                                <>
                                    {errores.length === 1 ? (
                                        `1 recurso con ${totalErroresIndividuales} ${totalErroresIndividuales === 1 ? 'error' : 'errores'}`
                                    ) : (
                                        `${errores.length} recursos con ${totalErroresIndividuales} errores en total`
                                    )}
                                </>
                            )}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className={`flex-shrink-0 text-gray-400 hover:${colorScheme.icon} transition`}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Lista de errores con scroll */}
                <div className="overflow-y-auto flex-1 p-4 custom-scrollbar">
                    {/* Texto descriptivo para creación parcial */}
                    {isPartial && (
                        <div className="mb-3 pb-3 border-b border-gray-700">
                            <p className="text-gray-400 text-sm">
                                Los siguientes recursos <span className="text-orange-400 font-semibold">no se procesaron</span> debido a errores de validación:
                            </p>
                        </div>
                    )}
                    <ul className="space-y-3">
                        {errores.map((error, index) => {
                            // Si error es un objeto, construir mensaje detallado
                            let titulo = '';
                            let subtitulo = '';
                            let detalle = '';
                            
                            if (typeof error === 'object') {
                                // Construir título con contexto
                                if (error.cliente) {
                                    titulo = error.cliente;
                                    if (error.id_cuenta) subtitulo = `ID: ${error.id_cuenta}`;
                                } else if (error.id_cliente) {
                                    titulo = `Carga de trabajo`;
                                    subtitulo = `Cliente: ${error.id_cliente}`;
                                    // No mostrar SDM en subtitulo
                                } else if (error.workload_index !== undefined) {
                                    titulo = `Carga de trabajo #${error.workload_index + 1}`;
                                    if (error.cliente) subtitulo = `Cliente: ${error.cliente}`;
                                    // No mostrar SDM en subtitulo
                                } else if (error.cliente_index !== undefined) {
                                    titulo = `Cliente #${error.cliente_index + 1}`;
                                }
                                
                                // Construir detalle del error como lista
                                if (error.razon && error.detalle) {
                                    // Si razon es "Validación fallida", el detalle puede ser array o string
                                    if (error.razon === 'Validación fallida') {
                                        // Si ya es array, usarlo directamente
                                        if (Array.isArray(error.detalle)) {
                                            detalle = error.detalle;
                                        } else {
                                            // Si es string, convertirlo en array de un elemento
                                            detalle = [error.detalle];
                                        }
                                    } else {
                                        // Para otros tipos de errores
                                        if (Array.isArray(error.detalle)) {
                                            detalle = error.detalle.map(d => `${error.razon} - ${d}`);
                                        } else {
                                            detalle = [`${error.razon} - ${error.detalle}`];
                                        }
                                    }
                                } else {
                                    detalle = [error.detalle || error.razon || JSON.stringify(error)];
                                }
                            } else {
                                detalle = [error];
                            }
                            
                            return (
                                <li 
                                    key={index}
                                    className={`bg-gray-800/50 border ${colorScheme.itemBorder} rounded px-3 py-2.5 text-sm text-gray-200 ${colorScheme.itemHover} transition`}
                                >
                                    <div className="flex items-start gap-2">
                                        <div className="flex-1">
                                            {titulo && (
                                                <div className={`font-semibold ${colorScheme.titleText} text-base mb-0.5`}>
                                                    {titulo}
                                                </div>
                                            )}
                                            {subtitulo && (
                                                <div className="text-gray-400 text-xs mb-1.5">
                                                    {subtitulo}
                                                </div>
                                            )}
                                            {/* Mostrar errores como lista */}
                                            {Array.isArray(detalle) ? (
                                                <ul className="text-gray-300 text-sm space-y-1 mt-1">
                                                    {detalle.map((err, idx) => (
                                                        <li key={idx} className="flex items-start gap-1.5">
                                                            <span className="text-orange-400 text-xs mt-0.5">▸</span>
                                                            <span>{err}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <div className="text-gray-300 text-sm">
                                                    {detalle}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Footer */}
                <div className="bg-gray-950 border-t border-gray-700 px-5 py-3 flex justify-end">
                    <button
                        onClick={onClose}
                        className={`${colorScheme.button} text-white font-semibold px-4 py-2 rounded transition text-sm`}
                    >
                        Entendido
                    </button>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #1f2937;
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: ${colorScheme.scrollThumb};
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: ${colorScheme.scrollThumbHover};
                }
            `}</style>
        </div>
    );
};