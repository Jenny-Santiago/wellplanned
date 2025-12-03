import { useState } from 'react';

export const useToast = () => {
    const [toast, setToast] = useState({
        isOpen: false,
        type: 'success',
        title: '',
        message: ''
    });

    const showToast = (type, title, message) => {
        setToast({
            isOpen: true,
            type,
            title,
            message
        });
    };

    const hideToast = () => {
        setToast(prev => ({ ...prev, isOpen: false }));
    };

    const showSuccess = (title, message) => showToast('success', title, message);
    const showError = (title, message) => showToast('error', title, message);
    const showWarning = (title, message) => showToast('warning', title, message);
    const showInfo = (title, message) => showToast('info', title, message);

    return {
        toast,
        showToast,
        hideToast,
        showSuccess,
        showError,
        showWarning,
        showInfo
    };
};