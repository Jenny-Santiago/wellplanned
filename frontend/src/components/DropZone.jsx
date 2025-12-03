import { useState } from 'react';
import { Upload } from 'lucide-react';
import { apiService } from '../services/api';

export const DropZone = ({
    handleUploadSuccess,
    setErrores,
    setShowErrors,
    setErrorModalTipo,
    setErrorModalExitosos,
    setErrorModalFallidos,
    setIsSpinnerOpen,
    setSpinnerMessage,
    setToast
}) => {

    const [dragActive, setDragActive] = useState(false);

    // Manejar click
    const handleClick = () => {
        const fileInput = document.getElementById("file-input");
        fileInput?.click();
    };

    // Manejar el drag
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    // Manejar el drop
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (file.type === "application/json") {
                processFile(file);
            } else {
                setToast({
                    isOpen: true,
                    type: 'error',
                    title: 'Archivo inválido',
                    message: 'Por favor sube un archivo JSON'
                });
            }
        }
    };

    const processFile = (file) => {
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const json = JSON.parse(e.target.result);
                const operacion = json.operacion;

                const entidad =
                    (operacion === "CLI_L") ? "clientes" :
                        (operacion === "WL_L") ? "workloads" :
                            (operacion === "CLI_I" || operacion === "CLI_U") ? "cliente" : "workload";

                // Verificar si es operación en lote y si necesita dividirse
                const isLote = operacion === "CLI_L" || operacion === "WL_L";
                const contenido = json.contenido;
                const BATCH_SIZE = 10;

                if (isLote && Array.isArray(contenido) && contenido.length > BATCH_SIZE) {
                    // Procesar en lotes
                    await processInBatches(json, operacion, entidad);
                } else {
                    // Procesar normalmente
                    await processSingleRequest(json, entidad);
                }

            } catch (error) {
                setIsSpinnerOpen(false);

                // Manejar errores de validación de schema (400 con validationErrors)
                if (error.status === 400 && error.validationErrors) {
                    // Si todos fallaron, siempre es modal rojo de error
                    setErrorModalTipo('error');
                    setErrorModalExitosos(0);
                    setErrorModalFallidos(error.validationErrors.length);
                    setErrores(error.validationErrors);
                    setShowErrors(true);
                    return; 
                }

                // Manejar otros tipos de error
                // Usar el título del error si existe, sino usar genérico
                const title = error.title || (
                    error.status === 409 ? `Recurso existente` :
                    error.status === 404 ? 'Recurso no encontrado' :
                    error.status === 400 ? 'Error de validación' :
                        'Error procesando archivo'
                );

                setToast({
                    isOpen: true,
                    type: 'error',
                    title,
                    message: error.message,
                });
            }
        };

        reader.readAsText(file);
    };

    // Procesar una sola petición
    const processSingleRequest = async (json, entidad) => {
        setIsSpinnerOpen(true);
        setSpinnerMessage(`Validando y procesando ${entidad}...`);

        const result = await apiService.processFile(json);
        setIsSpinnerOpen(false);

        if (result.status === 207) {
            // Para status 207, los datos están en result.data.data
            const responseData = result.data.data || result.data;
            const exitosos = responseData.clientes_exitosos || responseData.exitosos || 0;
            const fallidos = responseData.clientes_fallidos || responseData.fallidos || 0;
            const errores = responseData.errores || [];

            // Mostrar modal de creación parcial en lugar de toast
            if (errores.length > 0) {
                setErrorModalTipo('partial');
                setErrorModalExitosos(exitosos);
                setErrorModalFallidos(fallidos);
                setErrores(errores);
                setShowErrors(true);
            }
            
            handleUploadSuccess?.();
        } else {
            setToast({
                isOpen: true,
                type: 'success',
                title: `Operación Éxitosa`,
                message: result.data.mensaje || result.data.data?.mensaje || `${entidad} procesado exitosamente`
            });
            handleUploadSuccess?.();
        }
    };

    // Procesar en lotes
    const processInBatches = async (json, operacion, entidad) => {
        const contenido = json.contenido;
        const BATCH_SIZE = 10;
        const totalItems = contenido.length;
        const totalBatches = Math.ceil(totalItems / BATCH_SIZE);

        let totalExitosos = 0;
        let totalErrores = [];
        let totalYaExistian = 0;

        setIsSpinnerOpen(true);

        for (let i = 0; i < totalBatches; i++) {
            const start = i * BATCH_SIZE;
            const end = Math.min(start + BATCH_SIZE, totalItems);
            const batch = contenido.slice(start, end);
            const currentBatch = i + 1;

            setSpinnerMessage(`Procesando lote ${currentBatch} de ${totalBatches} (${batch.length} ${entidad})...`);

            try {
                const batchJson = {
                    operacion: operacion,
                    contenido: batch
                };

                const result = await apiService.processFile(batchJson);

                // Acumular resultados
                if (result.status === 207 || result.status === 201 || result.status === 200) {
                    // Para status 201 y 207, los datos están en result.data.data
                    const responseData = result.data.data || result.data;
                    
                    // Obtener contadores del backend
                    const exitososEnLote = responseData.clientes_exitosos || responseData.exitosos || 0;
                    const errores = responseData.errores || [];
                    
                    totalExitosos += exitososEnLote;

                    if (errores.length > 0) {
                        const yaExistian = errores.filter(e => e.razon?.includes('ya existe')).length;
                        totalYaExistian += yaExistian;
                        totalErrores = [...totalErrores, ...errores];
                    }
                }
            } catch (error) {
                // Si el lote completo falló (status 400), acumular los errores
                if (error.status === 400 && error.validationErrors) {
                    totalErrores = [...totalErrores, ...error.validationErrors];
                    const yaExistian = error.validationErrors.filter(e => e.razon?.includes('ya existe')).length;
                    totalYaExistian += yaExistian;
                }
                // Continuar con el siguiente lote
            }
        }

        setIsSpinnerOpen(false);

        // Mostrar resultado final
        if (totalErrores.length > 0) {
            const totalFallidos = totalErrores.length;
            
            // Si todos fallaron (0 exitosos), modal rojo de error
            // Si algunos exitosos, modal azul de creación parcial
            if (totalExitosos === 0) {
                setErrorModalTipo('error');
            } else {
                setErrorModalTipo('partial');
            }
            
            setErrorModalExitosos(totalExitosos);
            setErrorModalFallidos(totalFallidos);
            setErrores(totalErrores);
            setShowErrors(true);
        } else {
            // Todo exitoso, mostrar toast
            setToast({
                isOpen: true,
                type: 'success',
                title: 'Procesamiento completado',
                message: `${totalExitosos} ${entidad} procesados exitosamente en ${totalBatches} lotes`
            });
        }

        handleUploadSuccess?.();
    };


    return (
        <>
            <div className="mb-10">
                <h3 className="text-xl font-semibold text-gray-300 mb-4">Cargar Template</h3>

                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-8 transition cursor-pointer ${dragActive
                        ? 'border-purple-400 bg-gray-900'
                        : 'border-gray-700 bg-gray-900'
                        }
`}
                    onClick={handleClick}
                >
                    <input
                        id="file-input"
                        type="file"
                        accept=".json"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) processFile(file);
                            e.target.value = "";
                        }}
                        className="hidden"
                    />
                    <div className="flex flex-col items-center justify-center">
                        <Upload className="text-yellow-400 mb-3" size={32} />
                        <p className="text-gray-300 font-medium">Arrastra tu archivo JSON aquí</p>
                        <p className="text-gray-500 text-sm mt-1">o haz clic para seleccionar</p>
                    </div>
                </div>
            </div>
        </>
    );
};