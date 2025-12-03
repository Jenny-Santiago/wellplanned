import { useState } from 'react';

export const useConfirm = () => {
    const [confirmState, setConfirmState] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
        type: 'danger'
    });

    const showConfirm = ({ title, message, onConfirm, confirmText, cancelText, type }) => {
        setConfirmState({
            isOpen: true,
            title,
            message,
            onConfirm,
            confirmText: confirmText || 'Confirmar',
            cancelText: cancelText || 'Cancelar',
            type: type || 'danger'
        });
    };

    const hideConfirm = () => {
        setConfirmState(prev => ({ ...prev, isOpen: false }));
    };

    const handleConfirm = () => {
        if (confirmState.onConfirm) {
            confirmState.onConfirm();
        }
        hideConfirm();
    };

    return {
        confirmState,
        showConfirm,
        hideConfirm,
        handleConfirm
    };
};