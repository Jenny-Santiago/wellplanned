const { sendEmail } = require("../emailService");
const { workloadAssignedTemplate } = require("../templates/workloadAssigned");

exports.sendWorkloadNotification = async (workload, nombre_cliente, id_cuenta) => {
    const template = workloadAssignedTemplate(workload, nombre_cliente, id_cuenta);

    await sendEmail({
        to: workload.responsable_email,
        template
    });

    return true;
};
