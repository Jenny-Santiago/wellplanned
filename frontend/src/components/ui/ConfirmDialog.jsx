import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';
import { motion, AnimatePresence } from 'framer-motion';

export const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Eliminar",
    cancelText = "Cancelar",
    type = "danger"
}) => {
    if (!isOpen) return null;

    const iconColor = type === 'danger' ? 'text-purple-500' : 'text-yellow-400';
    const confirmVariant = type === 'danger' ? 'danger' : 'primary';

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                >
                    <motion.div
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 40, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="bg-gray-900 border border-gray-800 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.4)] w-full max-w-sm overflow-hidden text-center"
                    >
                        {/* Icon */}
                        <div className="flex flex-col items-center gap-3 px-8 pt-10 pb-4">
                            <div className={`rounded-full bg-gray-800/50 p-4 ${iconColor}`}>
                                <AlertTriangle size={50} className={`${iconColor}`} />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-100">{title}</h2>
                            <p className="text-gray-300 text-sm leading-relaxed font-normal mt-1">
                                {message}
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-center gap-4 px-8 py-6 border-t border-gray-800 mt-4 bg-gray-950/50">
                            <Button
                                variant="secondary"
                                onClick={onClose}
                                className="px-6 py-2 text-sm rounded-full font-medium"
                            >
                                {cancelText}
                            </Button>
                            <Button
                                variant={confirmVariant}
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className="px-6 py-2 text-sm rounded-full font-medium"
                            >
                                {confirmText}
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
