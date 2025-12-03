import { Loader } from 'lucide-react';

export const Spinner = ({ isOpen, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-950 border border-gray-800 rounded-lg w-full max-w-sm p-8">
                <div className="space-y-6">
                    <div className="flex justify-center">
                        <Loader className="text-purple-500 animate-spin" size={40} />
                    </div>

                    <div className="space-y-2">
                        <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 to-purple-400"
                                style={{ animation: 'pulse 1.5s ease-in-out infinite', width: '40%' }}
                            ></div>
                        </div>
                        <p className="text-xs text-gray-500 text-center">{message}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};