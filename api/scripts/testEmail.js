import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const {
  createMailerError,
  createMailerTransport,
  describeMailerError,
  getMailerFromAddress,
  getMailerTestRecipient,
} = await import("../src/utils/mailer.js");

const args = new Set(process.argv.slice(2));
const shouldVerify = args.has("--verify");
const shouldSend = args.has("--send");

const printUsage = () => {
  console.log("Usage:");
  console.log("  npm run email:verify");
  console.log("  npm run email:test");
  console.log("");
  console.log("Direct:");
  console.log("  node scripts/testEmail.js --verify");
  console.log("  node scripts/testEmail.js --send");
};

const printFailure = (label, error) => {
  const description = describeMailerError(error);

  console.error(`${label} failed: ${description.message}`);
  console.error(
    JSON.stringify(
      {
        code: description.code,
        command: description.command,
        responseCode: description.responseCode,
        response: description.response,
      },
      null,
      2
    )
  );
};

if ((shouldVerify && shouldSend) || (!shouldVerify && !shouldSend)) {
  printUsage();
  process.exit(1);
}

let transporter;

try {
  transporter = createMailerTransport();

  if (shouldVerify) {
    await transporter.verify();
    console.log("SMTP verify: ok");
  }

  if (shouldSend) {
    const recipient = getMailerTestRecipient();
    const sentAt = new Date().toISOString();
    const info = await transporter.sendMail({
      from: getMailerFromAddress(),
      to: recipient,
      subject: `Mamabooking test email - ${sentAt}`,
      text: [
        "Mamabooking test email",
        "",
        `Sent at: ${sentAt}`,
        "If you received this, Nodemailer is configured correctly.",
      ].join("\n"),
      html: `
        <h2>Mamabooking test email</h2>
        <p>Sent at: ${sentAt}</p>
        <p>If you received this, Nodemailer is configured correctly.</p>
      `,
    });

    console.log(`Test email sent to ${recipient}`);
    console.log(`Message ID: ${info.messageId || "unavailable"}`);
  }
} catch (error) {
  const label = shouldVerify ? "SMTP verify" : "Test email";
  printFailure(label, createMailerError(error));
  process.exit(1);
} finally {
  transporter?.close();
}
