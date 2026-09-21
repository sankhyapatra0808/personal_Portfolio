import { useEffect, useState, type FormEvent } from "react";

type ContactFields = {
  name: string;
  email: string;
  subject: string;
  message: string;
  company: string;
};

type FormStatus =
  | "idle"
  | "sending"
  | "verification-sent"
  | "verifying"
  | "success"
  | "error";

const initialFields: ContactFields = {
  name: "",
  email: "",
  subject: "",
  message: "",
  company: "",
};

const apiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "";
const handledVerificationTokens = new Set<string>();

function getMailProviderLink(email: string) {
  const domain = email.trim().toLowerCase().split("@")[1] ?? "";

  if (domain === "gmail.com" || domain === "googlemail.com") {
    return {
      label: "Open Gmail",
      href: "https://mail.google.com/mail/u/0/#inbox",
    };
  }

  if (
    domain === "outlook.com" ||
    domain === "hotmail.com" ||
    domain === "live.com"
  ) {
    return {
      label: "Open Outlook",
      href: "https://outlook.live.com/mail/0/inbox",
    };
  }

  if (domain === "yahoo.com" || domain.endsWith(".yahoo.com")) {
    return {
      label: "Open Yahoo Mail",
      href: "https://mail.yahoo.com/",
    };
  }

  if (domain === "proton.me" || domain === "protonmail.com") {
    return {
      label: "Open Proton Mail",
      href: "https://mail.proton.me/u/0/inbox",
    };
  }

  if (domain === "icloud.com" || domain === "me.com" || domain === "mac.com") {
    return {
      label: "Open iCloud Mail",
      href: "https://www.icloud.com/mail/",
    };
  }

  return null;
}

function removeVerificationTokenFromUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete("contact_verify");
  url.hash = "contact";
  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}

export default function ContactForm() {
  const [fields, setFields] = useState<ContactFields>(initialFields);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [verificationEmail, setVerificationEmail] = useState("");

  const mailProviderLink = getMailProviderLink(verificationEmail);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get(
      "contact_verify",
    );

    if (!token || handledVerificationTokens.has(token)) {
      return;
    }

    handledVerificationTokens.add(token);

    if (!apiUrl) {
      setStatus("error");
      setErrorMessage("The contact service has not been configured.");
      return;
    }

    setStatus("verifying");
    setErrorMessage("");
    setStatusMessage("Verifying your email and sending your message...");

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);

    void fetch(`${apiUrl}/api/portfolio/contact/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = (await response.json().catch(() => ({}))) as {
          message?: string;
        };

        if (!response.ok) {
          throw new Error(
            result.message ?? "The verification link could not be verified.",
          );
        }

        setFields(initialFields);
        setVerificationEmail("");
        setStatusMessage(
          result.message ?? "Email verified. Your message was sent successfully.",
        );
        setStatus("success");
        removeVerificationTokenFromUrl();
      })
      .catch((error: unknown) => {
        setStatus("error");

        if (error instanceof DOMException && error.name === "AbortError") {
          setErrorMessage(
            "Verification took too long. Please reopen the verification link.",
          );
        } else {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Something went wrong while verifying your email.",
          );
        }
      })
      .finally(() => {
        window.clearTimeout(timeout);
      });
  }, []);

  const updateField = (field: keyof ContactFields, value: string) => {
    setFields((current) => ({
      ...current,
      [field]: value,
    }));

    if (status !== "idle") {
      setStatus("idle");
      setErrorMessage("");
      setStatusMessage("");
      setVerificationEmail("");
    }
  };

  const validate = () => {
    if (fields.name.trim().length < 2) {
      return "Please enter your name.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
      return "Please enter a valid email address.";
    }

    if (fields.subject.trim().length < 3) {
      return "Please enter a subject.";
    }

    if (fields.message.trim().length < 20) {
      return "Your message must contain at least 20 characters.";
    }

    if (fields.message.length > 3000) {
      return "Your message must be under 3,000 characters.";
    }

    return "";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = validate();

    if (validationError) {
      setStatus("error");
      setErrorMessage(validationError);
      return;
    }

    if (!navigator.onLine) {
      setStatus("error");
      setErrorMessage(
        "You appear to be offline. Check your internet connection and try again.",
      );
      return;
    }

    if (!apiUrl) {
      setStatus("error");
      setErrorMessage("The contact service has not been configured.");
      return;
    }

    setStatus("sending");
    setErrorMessage("");
    setStatusMessage("");

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(`${apiUrl}/api/portfolio/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fields),
        signal: controller.signal,
      });

      const result = (await response.json().catch(() => ({}))) as {
        message?: string;
        email?: string;
        verificationRequired?: boolean;
      };

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(
            result.message ?? "Too many requests. Please try again later.",
          );
        }

        throw new Error(result.message ?? "Verification could not be started.");
      }

      setVerificationEmail(result.email ?? fields.email.trim().toLowerCase());
      setStatusMessage(
        result.message ??
          "A verification link was sent. Open your email and click Verify & Send Message.",
      );
      setStatus("verification-sent");
    } catch (error) {
      setStatus("error");

      if (error instanceof DOMException && error.name === "AbortError") {
        setErrorMessage("The request took too long. Please try again.");
      } else {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Something went wrong while requesting verification.",
        );
      }
    } finally {
      window.clearTimeout(timeout);
    }
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="contact-form__row">
        <label>
          <span>Name</span>

          <input
            type="text"
            value={fields.name}
            onChange={(event) => updateField("name", event.target.value)}
            autoComplete="name"
            maxLength={80}
            required
          />
        </label>

        <label>
          <span>Email</span>

          <input
            type="email"
            value={fields.email}
            onChange={(event) => updateField("email", event.target.value)}
            autoComplete="email"
            maxLength={160}
            required
          />
        </label>
      </div>

      <label>
        <span>Subject</span>

        <input
          type="text"
          value={fields.subject}
          onChange={(event) => updateField("subject", event.target.value)}
          maxLength={140}
          required
        />
      </label>

      <label>
        <span>Message</span>

        <textarea
          value={fields.message}
          onChange={(event) => updateField("message", event.target.value)}
          rows={6}
          maxLength={3000}
          required
        />
      </label>

      <label className="contact-form__honeypot" aria-hidden="true">
        <span>Company</span>

        <input
          type="text"
          value={fields.company}
          onChange={(event) => updateField("company", event.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </label>

      <div className="contact-form__footer">
        <button
          className="button button--primary"
          type="submit"
          disabled={status === "sending" || status === "verifying"}
        >
          {status === "sending"
            ? "Sending verification..."
            : status === "verifying"
              ? "Verifying..."
              : status === "verification-sent"
                ? "Resend Verification"
                : "Send Message"}
        </button>

        <span className="contact-form__count">
          {fields.message.length}/3000
        </span>
      </div>

      <div className="contact-form__feedback" aria-live="polite">
        {status === "verification-sent" ? (
          <div className="contact-form__verification">
            <p>{statusMessage}</p>

            {mailProviderLink ? (
              <a
                className="contact-form__mail-link"
                href={mailProviderLink.href}
                target="_blank"
                rel="noreferrer"
              >
                {mailProviderLink.label}
              </a>
            ) : null}
          </div>
        ) : null}

        {status === "verifying" ? (
          <p className="contact-form__verification-status">{statusMessage}</p>
        ) : null}

        {status === "success" ? (
          <p className="contact-form__success">
            {statusMessage || "Your message was sent successfully."}
          </p>
        ) : null}

        {status === "error" ? (
          <p className="contact-form__error">{errorMessage}</p>
        ) : null}
      </div>
    </form>
  );
}
