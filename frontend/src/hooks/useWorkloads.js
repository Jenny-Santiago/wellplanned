import { useEffect, useState } from "react";
import { apiService } from "../services/api";

export const useWorkloads = (clientId, year) => {
    const [workloads, setWorkloads] = useState([]);
    const [availableYears, setAvailableYears] = useState([]);
    const [currentYear, setCurrentYear] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchWorkloads = async (y) => {
        if (!clientId) {
            setWorkloads([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        const startTime = Date.now();

        try {
            const response = await apiService.getWorkloads(clientId, y);
            const { data } = response;

            // Calcular tiempo transcurrido
            const elapsed = Date.now() - startTime;
            const minDelay = 300; // Mínimo 300ms para evitar parpadeo

            // Si la respuesta fue muy rápida, esperar el tiempo restante
            if (elapsed < minDelay) {
                await new Promise(resolve => setTimeout(resolve, minDelay - elapsed));
            }

            setWorkloads(data.workloads || []);
            setAvailableYears(data.availableYears || []);

            if (!y && data.year) {
                setCurrentYear(data.year);
            }
        } catch (err) {
            setError(err.message);
            setWorkloads([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkloads(year);
    }, [clientId, year]);

    return {
        workloads,
        availableYears,
        currentYear,
        isLoading,
        error,
        refetch: fetchWorkloads
    };
};
