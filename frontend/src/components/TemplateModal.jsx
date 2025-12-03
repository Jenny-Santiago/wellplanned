import { downloadJson } from '../utils/downloadJson';
import { templates } from '../data/templates';

export const TemplateModal = ({ isOpen, onClose }) => {

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-md max-h-[500px] overflow-hidden flex flex-col">
                <div className="bg-black border-b border-gray-700 px-5 py-3 flex items-center justify-between sticky top-0">
                    <div>
                        <h2 className="text-lg font-bold text-yellow-400">Templates</h2>
                        <p className="text-gray-400 text-xs mt-0.5">Descarga según necesites</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-yellow-400 transition text-2xl font-bold w-8 h-8 flex items-center justify-center"
                    >
                        ×
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 p-3 space-y-2.5">
                    {templates.map((template) => (
                        <div key={template.id} className="bg-gray-800 border border-gray-700 rounded p-3 hover:border-yellow-400 transition cursor-pointer group">
                            <div className="flex items-start justify-between mb-1">
                                <h3 className="text-sm font-semibold text-gray-100 group-hover:text-yellow-400 transition">{template.nombre}</h3>
                                <span className="bg-yellow-400 text-black text-xs font-bold px-1.5 py-0.5 rounded">JSON</span>
                            </div>
                            <p className="text-gray-400 text-xs mb-2">{template.desc}</p>
                            <button
                                className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold py-1 px-2 rounded transition text-xs"
                                onClick={() => {
                                    downloadJson(template.datos, template.archivo);
                                    onClose(); // Cerrar modal automáticamente después de descargar
                                }}
                            >
                                Descargar
                            </button>
                        </div>
                    ))}
                </div>

                <div className="bg-black border-t border-gray-700 px-5 py-2 sticky bottom-0">
                    <p className="text-gray-400 text-xs">💡 Completa y carga en la sección superior</p>
                </div>
            </div>
        </div>
    );
}