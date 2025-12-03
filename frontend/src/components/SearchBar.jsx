import { Search } from 'lucide-react';

export const SearchBar = ({ searchTerm, setSearchTerm, onSearchChange }) => {
    return (
        <div className="mb-8">
            <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 text-gray-500 z-10" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar cliente..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            onSearchChange?.();
                        }}
                        className="w-full bg-gray-900 border border-gray-800 rounded-lg py-2 pl-10 pr-4 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition"
                    />
                </div>
            </div>
        </div>
    );
};