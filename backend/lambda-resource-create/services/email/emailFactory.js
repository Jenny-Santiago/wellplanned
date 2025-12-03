// services/email/emailFactory.js
const sesProvider = require("./providers/sesProvider");
const brevoProvider = require("./providers/brevoProvider");

exports.getProvider = () => {
    const provider = process.env.EMAIL_PROVIDER || "ses";

    switch (provider) {
        case "brevo":
            return brevoProvider;
        case "ses":
            return sesProvider;
        default:
            throw new Error(`Proveedor no soportado: ${provider}`);
    }
};
