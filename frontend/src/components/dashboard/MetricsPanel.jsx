export const MetricsPanel = ({ metrics }) => {
  return (
    <div className="absolute bottom-4 right-4">
      <div className="bg-black/90 backdrop-blur-md px-4 py-3 rounded-lg border border-purple-500/30 shadow-xl select-none">
        <div className="text-purple-300 text-xs font-semibold mb-2 uppercase tracking-wider">Información</div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-6">
            <span className="text-gray-400 text-xs">Clientes</span>
            <span className="text-base font-semibold text-white">{metrics.totalClients}</span>
          </div>
          <div className="flex items-center justify-between gap-6">
            <span className="text-gray-400 text-xs">Workloads</span>
            <span className="text-base font-semibold text-white">{metrics.totalWorkloads}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
