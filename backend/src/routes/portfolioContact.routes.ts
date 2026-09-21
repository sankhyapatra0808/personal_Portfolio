import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { sendTransactionalEmail } from "../utils/email.js";

const router = Router();

type PortfolioContactRequest = {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
  company?: unknown;
};

const contactRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,

  message: {
    message: "Too many messages were sent. Please try again after 15 minutes.",
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

router.post("/contact", contactRateLimiter, async (request, response) => {
  try {
    const body = (request.body ?? {}) as PortfolioContactRequest;

    const name = normalizeSingleLine(body.name);

    const email = normalizeSingleLine(body.email).toLowerCase();

    const subject = normalizeSingleLine(body.subject);

    const message = normalizeMessage(body.message);

    /*
     * Hidden honeypot field.
     * Real visitors leave this blank.
     */
    const company = normalizeSingleLine(body.company);

    if (company) {
      response.status(200).json({
        message: "Your message was received.",
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

    const recipientEmail = process.env.PORTFOLIO_TO_EMAIL?.trim();

    if (!recipientEmail) {
      console.error("PORTFOLIO_TO_EMAIL is missing.");

      response.status(503).json({
        message: "The contact service is temporarily unavailable.",
      });

      return;
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);

    const safeMessage = escapeHtml(message).replaceAll("\n", "<br />");

    const result = await sendTransactionalEmail({
      to: recipientEmail,
      replyToEmail: email,
      replyToName: name,
      subject: `[Portfolio] ${subject}`,

      text: [
        "New portfolio contact message",
        "",
        `Name: ${name}`,
        `Email: ${email}`,
        `Subject: ${subject}`,
        "",
        message,
      ].join("\n"),

      html: `
            <div
              style="
                margin: 0;
                padding: 32px;
                background: #f7f7f5;
                color: #171717;
                font-family: Arial, sans-serif;
              "
            >
              <div
                style="
                  max-width: 680px;
                  margin: 0 auto;
                  padding: 30px;
                  border: 1px solid #ddddda;
                  border-radius: 18px;
                  background: #ffffff;
                "
              >
                <p
                  style="
                    margin: 0 0 10px;
                    color: #6f716d;
                    font-size: 12px;
                    letter-spacing: 0.18em;
                    text-transform: uppercase;
                  "
                >
                  Portfolio contact
                </p>

                <h1
                  style="
                    margin: 0 0 28px;
                    font-size: 28px;
                    line-height: 1.2;
                  "
                >
                  New message from ${safeName}
                </h1>

                <p>
                  <strong>Name:</strong>
                  ${safeName}
                </p>

                <p>
                  <strong>Email:</strong>
                  ${safeEmail}
                </p>

                <p>
                  <strong>Subject:</strong>
                  ${safeSubject}
                </p>

                <hr
                  style="
                    margin: 26px 0;
                    border: 0;
                    border-top: 1px solid #ddddda;
                  "
                />

                <p
                  style="
                    margin: 0;
                    line-height: 1.75;
                  "
                >
                  ${safeMessage}
                </p>
              </div>
            </div>
          `,
    });

    console.log("Portfolio contact email sent:", result.messageId);

    response.status(200).json({
      message: "Your message was sent successfully.",
    });
  } catch (error) {
    console.error("Portfolio contact request failed:", error);

    const isEmailFailure =
      error instanceof Error &&
      (error.message.includes("Mail command failed") ||
        error.message.includes("Invalid login") ||
        error.message.includes("Connection timeout") ||
        error.message.includes("Greeting never received"));

    if (isEmailFailure) {
      response.status(502).json({
        message:
          "The email service is temporarily unavailable. Please try again later.",
      });

      return;
    }

    response.status(500).json({
      message:
        "Something went wrong while sending your message. Please try again later.",
    });
  }
});

export default router;
