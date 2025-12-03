import { Edit, Trash2 } from 'lucide-react';

export const ItemMenu = ({ isMenuOpen, onEdit, onDelete }) => {
    return (
        isMenuOpen && (
            <div className="absolute right-0 mt-0 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10 w-40">
                <button
                    className="flex items-center gap-2 w-full px-4 py-2 text-gray-300 hover:text-yellow-400 hover:bg-gray-700 transition text-sm"
                    onClick={onEdit}
                >
                    <Edit size={16} />
                    Editar
                </button>
                <button
                    className="flex items-center gap-2 w-full px-4 py-2 text-gray-300 hover:text-red-400 hover:bg-gray-700 transition text-sm border-t border-gray-700"
                    onClick={onDelete}
                >
                    <Trash2 size={16} />
                    Eliminar
                </button>
            </div>
        )
    );
};
