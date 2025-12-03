import { Check, AlertCircle, X } from 'lucide-react';
import { useEffect } from 'react';

export const Toast = ({
    type = 'success', // 'success' | 'error' | 'info'
    title = 'Notificación',
    message = '',
    isOpen = false,
    onClose = () => { },
    duration = 2500
}) => {

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isOpen, duration, onClose]);

    if (!isOpen) return null;

    const getStyles = () => {
        switch (type) {
            case 'success':
                return {
                    bg: 'bg-green-900/40 border-green-700',
                    icon: <Check className="text-green-400" size={20} />,
                    titleColor: 'text-green-400',
                    accent: 'bg-green-500'
                };
            case 'error':
                return {
                    bg: 'bg-red-900/40 border-red-700',
                    icon: <AlertCircle className="text-red-400" size={20} />,
                    titleColor: 'text-red-400',
                    accent: 'bg-red-500'
                };
            case 'info':
            default:
                return {
                    bg: 'bg-blue-900/40 border-blue-700',
                    icon: <AlertCircle className="text-blue-400" size={20} />,
                    titleColor: 'text-blue-400',
                    accent: 'bg-blue-500'
                };
        }
    };

    const styles = getStyles();

    return (
        <div className="fixed top-6 right-6 z-[9999] animate-in fade-in slide-in-from-top-4 duration-300">
            <div className={`${styles.bg} border rounded-lg p-4 w-96 max-w-sm shadow-lg backdrop-blur-sm`}>
                <div className="flex gap-4">
                    <div className="flex-shrink-0 pt-0.5">
                        {styles.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold ${styles.titleColor} text-sm`}>
                            {title}
                        </h3>
                        <p className="text-gray-300 text-xs mt-1 line-clamp-3">
                            {message}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-300 transition"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className={`${styles.accent} h-0.5 mt-4 rounded-full`} style={{
                    animation: `shrink ${duration}ms linear forwards`
                }}></div>
            </div>

            <style>{`
            @keyframes shrink {
            from { width: 100%; }
            to { width: 0%; }
            }
`           }</style>

        </div>
    );
};