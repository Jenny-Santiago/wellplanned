export const SearchBar = ({ 
  searchTerm, 
  setSearchTerm, 
  showSuggestions, 
  setShowSuggestions, 
  filteredClients, 
  onSearchSelect,
  onResetCamera 
}) => {
  return (
    <div className="absolute top-0 left-0 right-0 bg-black/95 backdrop-blur-md border-b border-gray-800 z-10 px-6 py-4">
      <div className="flex items-center gap-4 max-w-7xl mx-auto">
        <div className="text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex-1 max-w-xl relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Buscar cliente por nombre o ID..."
            className="w-full bg-gray-900/50 text-gray-100 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 focus:bg-gray-900/70 placeholder-gray-500 transition-all"
          />
          
          {showSuggestions && searchTerm && filteredClients.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-black/95 backdrop-blur-xl rounded-lg border border-purple-500/40 overflow-hidden shadow-2xl">
              <div className="max-h-48 overflow-y-auto">
                {filteredClients.map((client) => (
                  <button
                    key={client.id_cuenta}
                    onClick={() => onSearchSelect(client)}
                    className="w-full text-left px-4 py-3 hover:bg-purple-500/30 transition-colors border-b border-gray-700 last:border-b-0 bg-gray-900/50"
                  >
                    <div className="text-sm font-semibold text-purple-300">{client.cliente}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {client.id_cuenta} • {client.workloads_resumen?.totales || 0} workloads
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {showSuggestions && searchTerm && filteredClients.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-black/95 backdrop-blur-xl rounded-lg border border-gray-700 px-4 py-3">
              <div className="text-sm text-gray-400">No se encontraron clientes</div>
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-gray-700"></div>

        <button
          onClick={onResetCamera}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2.5 rounded-lg transition-all font-semibold shadow-lg hover:shadow-xl"
          title="Centrar vista"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2"/>
            <circle cx="12" cy="12" r="2" fill="currentColor"/>
            <line x1="12" y1="4" x2="12" y2="6" stroke="currentColor" strokeWidth="2"/>
            <line x1="12" y1="18" x2="12" y2="20" stroke="currentColor" strokeWidth="2"/>
            <line x1="4" y1="12" x2="6" y2="12" stroke="currentColor" strokeWidth="2"/>
            <line x1="18" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <span className="text-sm">Centrar</span>
        </button>
      </div>
    </div>
  );
};
