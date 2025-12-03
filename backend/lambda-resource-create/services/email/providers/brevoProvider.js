// services/email/providers/brevoProvider.js
const nodemailer = require("nodemailer");
const logger = require("../../../utils/logger");

const transporter = nodemailer.createTransport({
  host: process.env.BREVO_HOST || "smtp-relay.brevo.com",
  port: Number(process.env.BREVO_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS
  }
});

exports.send = async ({ to, subject, html, text }) => {
  const mailOptions = {
    from: `"WellPlanned" <${process.env.BREVO_FROM_EMAIL}>`,
    to,
    subject,
    html,
    text,
    replyTo: process.env.BREVO_REPLY_TO || process.env.BREVO_FROM_EMAIL,
    headers: {
      "List-Unsubscribe": "<mailto:unsubscribe@wellplanned.mx>",
      "X-Entity-Ref-ID": Date.now().toString()
    },
    envelope: {
      from: process.env.BREVO_USER,
      to
    }
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Brevo → Email enviado a ${to}`, { messageId: info.messageId });
    return info;
  } catch (error) {
    logger.error(`Brevo → Error enviando email a ${to}`, { error: error.message });
    throw error;
  }
};
