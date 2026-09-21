import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { deflateRawSync, inflateRawSync } from "node:zlib";
import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { sendTransactionalEmail } from "../utils/email.js";

const router = Router();

const VERIFICATION_TTL_MS = 15 * 60 * 1000;
const VERIFICATION_RESEND_COOLDOWN_MS = 60 * 1000;

type PortfolioContactRequest = {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
  company?: unknown;
};

type VerificationRequest = {
  token?: unknown;
};

type PendingContact = {
  name: string;
  email: string;
  subject: string;
  message: string;
  expiresAt: number;
  processing: boolean;
};

const consumedVerificationTokens = new Map<string, number>();
const processingVerificationTokens = new Set<string>();
const lastVerificationSentAt = new Map<string, number>();

const contactRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message:
      "Too many verification emails were requested. Please try again after 15 minutes.",
  },
});

const verificationRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many verification attempts. Please try again later.",
  },
});

function readString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function normalizeSingleLine(value: unknown): string {
  return readString(value)
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function normalizeMessage(value: unknown): string {
  return readString(value).replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function getVerificationEncryptionKey(): Buffer {
  const secret =
    process.env.CONTACT_VERIFICATION_SECRET?.trim() ||
    process.env.BREVO_SMTP_KEY?.trim();

  if (!secret) {
    throw new Error(
      "CONTACT_VERIFICATION_SECRET or BREVO_SMTP_KEY must be configured.",
    );
  }

  return createHash("sha256")
    .update(`sankhya-portfolio-contact:${secret}`)
    .digest();
}

function createVerificationToken(contact: Omit<PendingContact, "processing">): string {
  const payload = Buffer.from(JSON.stringify(contact), "utf8");
  const compressedPayload = deflateRawSync(payload);
  const iv = randomBytes(12);
  const cipher = createCipheriv(
    "aes-256-gcm",
    getVerificationEncryptionKey(),
    iv,
  );
  const encryptedPayload = Buffer.concat([
    cipher.update(compressedPayload),
    cipher.final(),
  ]);
  const authenticationTag = cipher.getAuthTag();

  return Buffer.concat([iv, authenticationTag, encryptedPayload]).toString(
    "base64url",
  );
}

function readVerificationToken(token: string): PendingContact | null {
  try {
    const packedToken = Buffer.from(token, "base64url");

    if (packedToken.length <= 28) {
      return null;
    }

    const iv = packedToken.subarray(0, 12);
    const authenticationTag = packedToken.subarray(12, 28);
    const encryptedPayload = packedToken.subarray(28);
    const decipher = createDecipheriv(
      "aes-256-gcm",
      getVerificationEncryptionKey(),
      iv,
    );

    decipher.setAuthTag(authenticationTag);

    const compressedPayload = Buffer.concat([
      decipher.update(encryptedPayload),
      decipher.final(),
    ]);
    const payloadBuffer = inflateRawSync(compressedPayload, {
      maxOutputLength: 20_000,
    });
    const parsed = JSON.parse(payloadBuffer.toString("utf8")) as Partial<PendingContact>;

    if (
      typeof parsed.name !== "string" ||
      typeof parsed.email !== "string" ||
      typeof parsed.subject !== "string" ||
      typeof parsed.message !== "string" ||
      typeof parsed.expiresAt !== "number"
    ) {
      return null;
    }

    if (
      parsed.name.length < 2 ||
      parsed.name.length > 80 ||
      parsed.email.length > 160 ||
      !isValidEmail(parsed.email) ||
      parsed.subject.length < 3 ||
      parsed.subject.length > 140 ||
      parsed.message.length < 20 ||
      parsed.message.length > 3000
    ) {
      return null;
    }

    return {
      name: parsed.name,
      email: parsed.email,
      subject: parsed.subject,
      message: parsed.message,
      expiresAt: parsed.expiresAt,
      processing: false,
    };
  } catch {
    return null;
  }
}

function getPublicSiteUrl(requestOrigin?: string): string {
  if (requestOrigin?.trim()) {
    return requestOrigin.trim();
  }

  const configuredUrl = process.env.PUBLIC_SITE_URL?.trim();

  if (configuredUrl) {
    return configuredUrl;
  }

  const firstClientUrl = String(process.env.CLIENT_URLS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .find(Boolean);

  if (firstClientUrl) {
    return firstClientUrl;
  }

  throw new Error("PUBLIC_SITE_URL or CLIENT_URLS must be configured.");
}

function buildVerificationUrl(token: string, requestOrigin?: string): string {
  const verificationUrl = new URL(getPublicSiteUrl(requestOrigin));
  verificationUrl.searchParams.set("contact_verify", token);
  verificationUrl.hash = "contact";
  return verificationUrl.toString();
}

function cleanExpiredEntries() {
  const now = Date.now();

  for (const [tokenHash, expiresAt] of consumedVerificationTokens) {
    if (expiresAt <= now) {
      consumedVerificationTokens.delete(tokenHash);
    }
  }

  for (const [email, sentAt] of lastVerificationSentAt) {
    if (now - sentAt > VERIFICATION_TTL_MS) {
      lastVerificationSentAt.delete(email);
    }
  }
}

const cleanupTimer = setInterval(cleanExpiredEntries, 5 * 60 * 1000);
cleanupTimer.unref();

function isEmailTransportFailure(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.includes("Mail command failed") ||
      error.message.includes("Invalid login") ||
      error.message.includes("Connection timeout") ||
      error.message.includes("Greeting never received"))
  );
}

async function sendPortfolioContactEmail(contact: PendingContact) {
  const recipientEmail = process.env.PORTFOLIO_TO_EMAIL?.trim();

  if (!recipientEmail) {
    throw new Error("PORTFOLIO_TO_EMAIL is missing.");
  }

  const safeName = escapeHtml(contact.name);
  const safeEmail = escapeHtml(contact.email);
  const safeSubject = escapeHtml(contact.subject);
  const safeMessage = escapeHtml(contact.message).replaceAll("\n", "<br />");

  return sendTransactionalEmail({
    to: recipientEmail,
    replyToEmail: contact.email,
    replyToName: contact.name,
    subject: `[Portfolio] ${contact.subject}`,
    text: [
      "New verified portfolio contact message",
      "",
      `Name: ${contact.name}`,
      `Email: ${contact.email}`,
      `Subject: ${contact.subject}`,
      "Email ownership: Verified by magic link",
      "",
      contact.message,
    ].join("\n"),
    html: `
      <div style="margin:0;padding:32px;background:#f7f7f5;color:#171717;font-family:Arial,sans-serif;">
        <div style="max-width:680px;margin:0 auto;padding:30px;border:1px solid #ddddda;border-radius:18px;background:#ffffff;">
          <p style="margin:0 0 10px;color:#6f716d;font-size:12px;letter-spacing:.18em;text-transform:uppercase;">
            Portfolio contact · Verified email
          </p>
          <h1 style="margin:0 0 28px;font-size:28px;line-height:1.2;">
            New message from ${safeName}
          </h1>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Subject:</strong> ${safeSubject}</p>
          <p><strong>Email ownership:</strong> Verified by magic link</p>
          <hr style="margin:26px 0;border:0;border-top:1px solid #ddddda;" />
          <p style="margin:0;line-height:1.75;">${safeMessage}</p>
        </div>
      </div>
    `,
  });
}

router.post("/contact", contactRateLimiter, async (request, response) => {
  try {
    cleanExpiredEntries();

    const body = (request.body ?? {}) as PortfolioContactRequest;
    const name = normalizeSingleLine(body.name);
    const email = normalizeSingleLine(body.email).toLowerCase();
    const subject = normalizeSingleLine(body.subject);
    const message = normalizeMessage(body.message);
    const company = normalizeSingleLine(body.company);

    // Honeypot: bots receive a harmless success response and no email is sent.
    if (company) {
      response.status(200).json({
        message: "Please check your email to continue.",
        verificationRequired: true,
      });
      return;
    }

    if (name.length < 2 || name.length > 80) {
      response.status(400).json({
        message: "Your name must contain between 2 and 80 characters.",
      });
      return;
    }

    if (email.length > 160 || !isValidEmail(email)) {
      response.status(400).json({
        message: "Please enter a valid email address.",
      });
      return;
    }

    if (subject.length < 3 || subject.length > 140) {
      response.status(400).json({
        message: "The subject must contain between 3 and 140 characters.",
      });
      return;
    }

    if (message.length < 20 || message.length > 3000) {
      response.status(400).json({
        message: "The message must contain between 20 and 3,000 characters.",
      });
      return;
    }

    if (!process.env.PORTFOLIO_TO_EMAIL?.trim()) {
      console.error("PORTFOLIO_TO_EMAIL is missing.");
      response.status(503).json({
        message: "The contact service is temporarily unavailable.",
      });
      return;
    }

    // Prevent the contact form from becoming an email-bombing endpoint.
    const now = Date.now();
    const lastSentAt = lastVerificationSentAt.get(email);

    if (lastSentAt && now - lastSentAt < VERIFICATION_RESEND_COOLDOWN_MS) {
      const secondsRemaining = Math.ceil(
        (VERIFICATION_RESEND_COOLDOWN_MS - (now - lastSentAt)) / 1000,
      );

      response.status(429).json({
        message: `Please wait ${secondsRemaining} seconds before requesting another verification email.`,
      });
      return;
    }

    const expiresAt = now + VERIFICATION_TTL_MS;
    const rawToken = createVerificationToken({
      name,
      email,
      subject,
      message,
      expiresAt,
    });

    lastVerificationSentAt.set(email, now);

    const verificationUrl = buildVerificationUrl(
      rawToken,
      request.get("origin"),
    );
    const safeName = escapeHtml(name);
    const safeSubject = escapeHtml(subject);

    try {
      await sendTransactionalEmail({
        to: email,
        subject: "Verify your email to send your portfolio message",
        text: [
          `Hi ${name},`,
          "",
          "Please verify your email address to send your message to Sankhya.",
          `Subject: ${subject}`,
          "",
          `Verify and send: ${verificationUrl}`,
          "",
          "This link expires in 15 minutes and can be used only once.",
          "If you did not submit this contact form, you can ignore this email.",
        ].join("\n"),
        html: `
          <div style="margin:0;padding:32px;background:#f7f7f5;color:#171717;font-family:Arial,sans-serif;">
            <div style="max-width:600px;margin:0 auto;padding:32px;border:1px solid #ddddda;border-radius:18px;background:#ffffff;">
              <p style="margin:0 0 10px;color:#6f716d;font-size:12px;letter-spacing:.18em;text-transform:uppercase;">
                Sankhya Portfolio
              </p>
              <h1 style="margin:0 0 18px;font-size:28px;line-height:1.2;">Verify your email</h1>
              <p style="margin:0 0 14px;line-height:1.7;">Hi ${safeName},</p>
              <p style="margin:0 0 14px;line-height:1.7;">
                Click the button below to verify that you own this email address and send your portfolio message.
              </p>
              <p style="margin:0 0 24px;color:#6f716d;line-height:1.6;">
                <strong>Subject:</strong> ${safeSubject}
              </p>
              <a href="${escapeHtml(verificationUrl)}" style="display:inline-block;padding:13px 22px;border-radius:999px;background:#171717;color:#ffffff;text-decoration:none;font-weight:700;">
                Verify &amp; Send Message
              </a>
              <p style="margin:26px 0 0;color:#6f716d;font-size:13px;line-height:1.65;">
                This link expires in 15 minutes and works only once. If you did not submit this form, simply ignore this email.
              </p>
            </div>
          </div>
        `,
      });
    } catch (error) {
      lastVerificationSentAt.delete(email);
      throw error;
    }

    response.status(200).json({
      message: `A verification link was sent to ${email}. Open your email and click “Verify & Send Message”.`,
      verificationRequired: true,
      email,
    });
  } catch (error) {
    console.error("Portfolio verification email request failed:", error);

    if (isEmailTransportFailure(error)) {
      response.status(502).json({
        message:
          "The email service is temporarily unavailable. Please try again later.",
      });
      return;
    }

    response.status(500).json({
      message:
        "Something went wrong while preparing email verification. Please try again later.",
    });
  }
});

router.post(
  "/contact/verify",
  verificationRateLimiter,
  async (request, response) => {
    const body = (request.body ?? {}) as VerificationRequest;
    const token = readString(body.token).trim();

    if (!token || token.length > 12_000) {
      response.status(400).json({
        message: "This verification link is invalid.",
      });
      return;
    }

    const tokenHash = hashToken(token);

    if (consumedVerificationTokens.has(tokenHash)) {
      response.status(400).json({
        message: "This verification link has already been used.",
      });
      return;
    }

    if (processingVerificationTokens.has(tokenHash)) {
      response.status(409).json({
        message: "This message is already being verified and sent.",
      });
      return;
    }

    const pendingContact = readVerificationToken(token);

    if (!pendingContact) {
      response.status(400).json({
        message: "This verification link is invalid.",
      });
      return;
    }

    if (pendingContact.expiresAt <= Date.now()) {
      response.status(410).json({
        message:
          "This verification link has expired. Please submit the contact form again.",
      });
      return;
    }

    processingVerificationTokens.add(tokenHash);

    try {
      const result = await sendPortfolioContactEmail(pendingContact);
      processingVerificationTokens.delete(tokenHash);
      consumedVerificationTokens.set(tokenHash, pendingContact.expiresAt);
      lastVerificationSentAt.delete(pendingContact.email);

      console.log("Verified portfolio contact email sent:", result.messageId);

      response.status(200).json({
        message: "Email verified. Your message was sent successfully.",
      });
    } catch (error) {
      processingVerificationTokens.delete(tokenHash);
      console.error("Verified portfolio contact send failed:", error);

      if (isEmailTransportFailure(error)) {
        response.status(502).json({
          message:
            "Your email was verified, but the message could not be sent right now. Please try the verification link again shortly.",
        });
        return;
      }

      response.status(500).json({
        message:
          "Your email was verified, but something went wrong while sending the message. Please try the verification link again.",
      });
    }
  },
);

export default router;
