import nodemailer from "nodemailer";

const DEFAULT_EMAIL_SERVICE = "gmail";

const getEmailUser = () => String(process.env.EMAIL_USERNAME || "").trim();
const getEmailPassword = () => String(process.env.EMAIL_PASSWORD || "").trim();
const getEmailService = () =>
  String(process.env.EMAIL_SERVICE || DEFAULT_EMAIL_SERVICE).trim();

const getMissingEmailConfig = () =>
  [
    ["EMAIL_USERNAME", getEmailUser()],
    ["EMAIL_PASSWORD", getEmailPassword()],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

const isGmailTransport = () => getEmailService().toLowerCase() === "gmail";

export const isMailerConfigured = () =>
  getMissingEmailConfig().length === 0;

export const getMailerFromAddress = () =>
  String(process.env.EMAIL_FROM || "").trim() ||
  `"Mamabooking" <${getEmailUser()}>`;

export const getMailerTestRecipient = () =>
  String(process.env.EMAIL_TEST_TO || "").trim() || getEmailUser();

export const describeMailerError = (error) => {
  const details = {
    code: error?.code,
    command: error?.command,
    responseCode: error?.responseCode,
    response: error?.response,
  };

  if (error?.code === "EMAIL_CONFIG_MISSING") {
    return {
      ...details,
      message: error.message,
    };
  }

  if (error?.code === "EAUTH" || error?.responseCode === 535) {
    const message = isGmailTransport()
      ? "Gmail authentication failed. Confirm EMAIL_USERNAME is the Gmail address and EMAIL_PASSWORD is a fresh Gmail app password for that same account."
      : "SMTP authentication failed. Confirm the configured email username and password are valid for the selected email service.";

    return {
      ...details,
      message,
    };
  }

  if (error?.code === "EDNS" || error?.code === "ENOTFOUND") {
    return {
      ...details,
      message:
        "Email server lookup failed. Check network access and the configured email service.",
    };
  }

  if (error?.code === "ECONNECTION" || error?.code === "ETIMEDOUT") {
    return {
      ...details,
      message:
        "Could not connect to the email server. Check network access and provider SMTP availability.",
    };
  }

  return {
    ...details,
    message: error?.message || "Email failed for an unknown reason.",
  };
};

const createMissingConfigError = () => {
  const missingConfig = getMissingEmailConfig();
  const error = new Error(
    `Email is not configured. Set ${missingConfig.join(
      " and "
    )} in api/.env.`
  );
  error.name = "MailerConfigurationError";
  error.code = "EMAIL_CONFIG_MISSING";
  return error;
};

export const createMailerError = (error) => {
  const description = describeMailerError(error);
  const mailerError = new Error(description.message, { cause: error });
  mailerError.name = "MailerError";
  mailerError.code = description.code;
  mailerError.command = description.command;
  mailerError.responseCode = description.responseCode;
  mailerError.response = description.response;
  return mailerError;
};

export const createMailerTransport = () => {
  if (!isMailerConfigured()) {
    throw createMissingConfigError();
  }

  return nodemailer.createTransport({
    service: getEmailService(),
    auth: {
      user: getEmailUser(),
      pass: getEmailPassword(),
    },
  });
};

export const sendMail = async (mailOptions) => {
  const transporter = createMailerTransport();

  try {
    await transporter.sendMail({
      from: getMailerFromAddress(),
      ...mailOptions,
    });
  } catch (error) {
    throw createMailerError(error);
  } finally {
    transporter.close();
  }

  return true;
};
