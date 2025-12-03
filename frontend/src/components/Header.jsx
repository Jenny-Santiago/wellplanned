import { Cloud } from 'lucide-react';

export const Header = ({ onTemplateClick }) => {
    return (
        <div className="bg-black border-b border-yellow-400 px-8 py-6 sticky top-0 z-50 mb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-5xl font-black text-yellow-400 tracking-tight">
                        XAL DIGITAL
                    </h1>
                    <p className="text-gray-400 text-sm mt-2">Panel de Monitorización • Well Architected</p>
                </div>

                <div
                    className="flex items-center gap-3 bg-gray-900 rounded-lg px-4 py-2 border border-gray-800 hover:border-yellow-400 transition cursor-pointer"
                    onClick={onTemplateClick}
                >
                    <Cloud size={18} className="text-yellow-400" />
                    <span className="text-sm text-gray-300 font-medium">Templates disponibles</span>
                </div>
            </div>
        </div>
    );
};