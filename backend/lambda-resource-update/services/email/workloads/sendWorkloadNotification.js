const { sendEmail } = require("../emailService");
const { workloadAssigned } = require("../templates/workloadAssigned");
const { workloadCanceled } = require("../templates/workloadCanceled");

exports.sendWorkloadNotification = async (workload, nombre_cliente, id_cuenta, tipo) => {
    let template;

    switch (tipo) {
        case "assign":
            template = workloadAssigned(workload, nombre_cliente, id_cuenta);
            break;

        case "cancel":
            template = workloadCanceled(workload, nombre_cliente, id_cuenta);
            break;

        default:
            throw new Error(`Tipo de notificación no válido: ${tipo}`);
    }

    await sendEmail({
        to: workload.responsable_email,
        template
    });

    return true;
};
