import nodemailer, {
  type Transporter,
} from "nodemailer";

export type SendTransactionalEmailInput = {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyToEmail?: string;
  replyToName?: string;
};

let cachedTransporter: Transporter | null = null;

function requireEnvironmentValue(
  name: string,
): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}`,
    );
  }

  return value;
}

function getSmtpPort(): number {
  const rawPort =
    process.env.BREVO_SMTP_PORT?.trim() ?? "587";

  const port = Number(rawPort);

  if (
    !Number.isInteger(port) ||
    port <= 0 ||
    port > 65535
  ) {
    throw new Error(
      "BREVO_SMTP_PORT must be a valid port number.",
    );
  }

  return port;
}

function getTransporter(): Transporter {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const host = requireEnvironmentValue(
    "BREVO_SMTP_HOST",
  );

  const port = getSmtpPort();

  const user = requireEnvironmentValue(
    "BREVO_SMTP_USER",
  );

  const pass = requireEnvironmentValue(
    "BREVO_SMTP_KEY",
  );

  cachedTransporter =
    nodemailer.createTransport({
      host,
      port,

      /*
       * Port 465 uses direct TLS.
       * Port 587 starts normally and upgrades
       * through STARTTLS.
       */
      secure: port === 465,

      auth: {
        user,
        pass,
      },

      requireTLS: port !== 465,

      connectionTimeout: 15_000,
      greetingTimeout: 15_000,
      socketTimeout: 20_000,
    });

  return cachedTransporter;
}

function getSender() {
  const name =
    process.env.EMAIL_FROM_NAME?.trim() ||
    "Sankhya Portfolio";

  const address = requireEnvironmentValue(
    "EMAIL_FROM_ADDRESS",
  );

  return {
    name,
    address,
  };
}

export async function verifyEmailTransport() {
  const transporter = getTransporter();

  await transporter.verify();
}

export async function sendTransactionalEmail({
  to,
  subject,
  text,
  html,
  replyToEmail,
  replyToName,
}: SendTransactionalEmailInput) {
  const transporter = getTransporter();

  const sender = getSender();

  const information =
    await transporter.sendMail({
      from: sender,
      to,
      subject,
      text,
      html,

      replyTo: replyToEmail
        ? {
            name:
              replyToName?.trim() ||
              replyToEmail,
            address: replyToEmail,
          }
        : undefined,

      /*
       * Prevent email content from loading
       * local or remote files.
       */
      disableFileAccess: true,
      disableUrlAccess: true,
    });

  return {
    messageId: information.messageId,
  };
}