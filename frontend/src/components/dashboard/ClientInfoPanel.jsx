export const ClientInfoPanel = ({ client }) => {
  if (!client) return null;

  const resumen = client.workloads_resumen || {};

  return (
    <div className="absolute bottom-4 right-4">
      <div 
        className="bg-gray-900/95 backdrop-blur-md px-4 py-3 rounded-lg border-2 border-red-500 shadow-2xl select-none" 
        style={{ boxShadow: '0 0 25px rgba(255, 0, 0, 0.4)' }}
      >
        <div className="text-sm font-bold text-white mb-2 text-red-500">
          {client.cliente}
        </div>
        <div className="text-[10px] text-gray-400 mb-2">
          {client.id_cuenta} • {client.tipo_proyecto || 'N/A'} • {client.compromiso || 'Sin compromiso'}
        </div>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between gap-4">
            <span className="text-gray-400">Total Workloads:</span>
            <span className="text-white font-bold">{resumen.totales || 0}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-yellow-400">En Progreso:</span>
            <span className="text-white font-semibold">{resumen.en_progreso || 0}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-green-400">Completados:</span>
            <span className="text-white font-semibold">{resumen.completado || 0}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-blue-400">Pausados:</span>
            <span className="text-white font-semibold">{resumen.pausado || 0}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-red-400">Cancelados:</span>
            <span className="text-white font-semibold">{resumen.cancelado || 0}</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-gray-700 text-[10px] text-gray-400">
          Click en el cliente para ver análisis completo
        </div>
      </div>
    </div>
  );
};
