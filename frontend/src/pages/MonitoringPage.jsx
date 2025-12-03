import { useState } from "react";
import { Header } from "../components/Header";
import { DropZone } from "../components/DropZone";
import { GalacticDashboard as Dashboard } from "../components/GalacticDashboard";
import { ClientsSection } from "../components/ClientsSection";
import { WellsModal } from "../components/workloads/WellsModal";
import { TemplateModal } from "../components/TemplateModal";
import { ValidationErrorModal } from "../components/ValidationErrorModal";
import { Spinner } from "../components/Spinner";
import { Toast } from "../components/Toast";
import { useClients } from "../hooks/useClients";
import { useToast } from "../hooks/useToast";

export const MonitoringPage = () => {
    // Estados para modales y UI
    const [openMenu, setOpenMenu] = useState(null);
    const [selectedClient, setSelectedClient] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [showErrors, setShowErrors] = useState(false);
    const [errores, setErrores] = useState([]);
    const [errorModalTipo, setErrorModalTipo] = useState('error'); // 'error' o 'partial'
    const [errorModalExitosos, setErrorModalExitosos] = useState(0);
    const [errorModalFallidos, setErrorModalFallidos] = useState(0);
    const [isSpinnerOpen, setIsSpinnerOpen] = useState(false);
    const [spinnerMessage, setSpinnerMessage] = useState('');

    // Hooks personalizados
    const { clientes, isLoading, refetch } = useClients();
    const { toast, showToast, hideToast } = useToast();

    const handleClientClick = (cliente) => {
        setSelectedClient(cliente);
        setIsModalOpen(true);
    };

    const handleTemplateClick = () => {
        setIsTemplateModalOpen(true);
    };

    const handleUploadSuccess = () => {
        refetch();
    };

    // Función helper para mostrar toast desde componentes hijos
    const setToast = (toastData) => {
        if (toastData.isOpen) {
            showToast(toastData.type, toastData.title, toastData.message);
        } else {
            hideToast();
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <Header onTemplateClick={handleTemplateClick} />

            <Dashboard clientes={clientes} isLoading={isLoading} />

            <div className="relative w-full mt-16">
                <img
                    src="/img.png"
                    alt="Logo Erizo"
                    className="absolute -top-3 left-[80%] transform -translate-x-1/2 h-32 w-30 opacity-80 z-0"
                />

                <div className="relative z-10">
                    <DropZone
                        handleUploadSuccess={handleUploadSuccess}
                        setErrores={setErrores}
                        setShowErrors={setShowErrors}
                        setErrorModalTipo={setErrorModalTipo}
                        setErrorModalExitosos={setErrorModalExitosos}
                        setErrorModalFallidos={setErrorModalFallidos}
                        setIsSpinnerOpen={setIsSpinnerOpen}
                        setSpinnerMessage={setSpinnerMessage}
                        setToast={setToast}
                    />
                </div>
            </div>


            <ClientsSection
                clientes={clientes}
                isLoading={isLoading}
                onClientClick={handleClientClick}
                openMenu={openMenu}
                onMenuClick={setOpenMenu}
                handleUploadSuccess={handleUploadSuccess}
                setIsSpinnerOpen={setIsSpinnerOpen}
                setSpinnerMessage={setSpinnerMessage}
                setToast={setToast}
            />

            {/* Modales */}
            {selectedClient && (
                <WellsModal
                    cliente={selectedClient}
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedClient(null);
                    }}
                    setIsSpinnerOpen={setIsSpinnerOpen}
                    setSpinnerMessage={setSpinnerMessage}
                    setToast={setToast}
                    refetchClients={refetch}
                />
            )}

            <TemplateModal
                isOpen={isTemplateModalOpen}
                onClose={() => setIsTemplateModalOpen(false)}
            />

            <ValidationErrorModal
                isOpen={showErrors}
                errores={errores}
                onClose={() => setShowErrors(false)}
                tipo={errorModalTipo}
                exitosos={errorModalExitosos}
                fallidos={errorModalFallidos}
            />

            <Toast
                isOpen={toast.isOpen}
                type={toast.type}
                title={toast.title}
                message={toast.message}
                onClose={hideToast}
            />

            <Spinner
                isOpen={isSpinnerOpen}
                message={spinnerMessage}
            />
        </div>
    );
};