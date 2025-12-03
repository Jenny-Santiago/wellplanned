// services/email/emailService.js
const { getProvider } = require("./emailFactory");

exports.sendEmail = async ({ to, template }) => {
    const provider = getProvider();

    await provider.send({
        to,
        subject: template.subject,
        html: template.html,
        text: template.text
    });
};
