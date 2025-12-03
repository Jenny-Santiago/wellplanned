// services/email/providers/sesProvider.js
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const logger = require("../../../utils/logger");

const ses = new SESClient({
  region: process.env.AWS_REGION || "us-east-1",
});

exports.send = async ({ to, subject, html, text }) => {
  const params = {
    Source: process.env.FROM_EMAIL,
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject, Charset: "UTF-8" },
      Body: {
        Html: { Data: html, Charset: "UTF-8" },
        Text: { Data: text, Charset: "UTF-8" }
      }
    }
  };

  try {
    await ses.send(new SendEmailCommand(params));
    logger.info(`SES → Email enviado a ${to}`);
  } catch (err) {
    logger.error(`SES → Error enviando email a ${to}: ${err.message}`);
    throw err;
  }
};
