import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

export const useClients = () => {
    const [clientes, setClientes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchClientes = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await apiService.getClients();
            setClientes(data.clientes || []);
        } catch (err) {
            setError(err.message);
            setClientes([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchClientes();
    }, []);

    return {
        clientes,
        isLoading,
        error,
        refetch: fetchClientes
    };
};