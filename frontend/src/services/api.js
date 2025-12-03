const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Servicio principal para todas las operaciones
export const apiService = {
    // Método genérico para procesar archivos JSON (CREATE/UPDATE)
    async processFile(jsonData) {
        const operacion = jsonData?.operacion;
        const method = (operacion === 'CLI_U' || operacion === 'WL_U') ? 'PUT' : 'POST';

        const response = await fetch(API_BASE_URL, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jsonData)
        });

        const data = await response.json();

        if (!response.ok) {
            // Para errores de validación (400), incluir los errores en el mensaje
            if (response.status === 400 && data.errors) {
                const error = new Error('Errores de validación');
                error.status = response.status;
                error.validationErrors = data.errors; // Array de strings
                throw error;
            }

            // Si hay errores específicos en el array, usar el primero como mensaje principal
            let errorMessage;
            if (data.errors && data.errors.length > 0) {
                errorMessage = data.errors[0];
            } else {
                // Si no hay mensaje específico, usar uno más descriptivo según el status
                errorMessage = data.error || data.message || 'Error en la operación';
                
                // Agregar contexto si es un mensaje genérico
                if (errorMessage === 'Recurso no encontrado') {
                    errorMessage = 'El recurso solicitado no existe o no se pudo encontrar';
                } else if (errorMessage === 'Recurso existente') {
                    errorMessage = 'El recurso que intentas crear ya existe en el sistema';
                }
            }
            
            const error = new Error(errorMessage);
            error.status = response.status;
            error.title = data.message; // Guardar el título genérico

            if (data.errors) {
                error.validationErrors = data.errors;
            }

            throw error;
        }

        return { data, status: response.status };
    },

    // Obtener clientes
    async getClients() {
        // Agregar timestamp para evitar caché del navegador
        const timestamp = new Date().getTime();
        const response = await fetch(`${API_BASE_URL}/clients?_t=${timestamp}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error al cargar clientes');
        }

        const clients = await response.json();
        return clients;
    },

    // Obtener workloads de un cliente
    async getWorkloads(clientId, year) {
        // Agregar timestamp para evitar caché del navegador
        const timestamp = new Date().getTime();
        const url = year
            ? `${API_BASE_URL}/workloads/${clientId}?year=${year}&_t=${timestamp}`
            : `${API_BASE_URL}/workloads/${clientId}?_t=${timestamp}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error al cargar workloads');
        }

        const rawData = await response.json();

        // Manejar diferentes formatos de respuesta
        let data;
        if (rawData.body) {
            data = typeof rawData.body === 'string'
                ? JSON.parse(rawData.body)
                : rawData.body;
        } else {
            data = rawData;
        }

        return data;
    },

    // Eliminar cliente
    async deleteClient(clientId) {
        const body = {
            tipo: 'cliente',
            id: clientId
        };

        const response = await fetch(API_BASE_URL, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.error || errorData.message || `Error ${response.status} al eliminar cliente`;
            throw new Error(errorMessage);
        }

        return await response.json();
    },

    // Eliminar workload
    async deleteWorkload(workloadId, clientId, year, month) {
        const body = {
            tipo: 'workload',
            id: workloadId,
            id_cliente: clientId,
            month: month,
            year: year
        };

        const response = await fetch(API_BASE_URL, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.error || errorData.message || `Error ${response.status} al eliminar workload`;
            throw new Error(errorMessage);
        }

        return await response.json();
    },

    // Obtener análisis de workloads de un cliente
    async getClientAnalysis(clientId) {
        // Agregar timestamp para evitar caché
        const timestamp = new Date().getTime();
        const response = await fetch(
            `${API_BASE_URL}/clients/${clientId}/analysis?_t=${timestamp}`,
            {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            }
        );

        if (!response.ok) {
            throw new Error('Error al cargar análisis del cliente');
        }

        const result = await response.json();
        
        return result.data;
    }
};
