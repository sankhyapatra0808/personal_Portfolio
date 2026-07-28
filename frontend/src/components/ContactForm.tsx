import { useState, type FormEvent } from "react";

type ContactFields = {
  name: string;
  email: string;
  subject: string;
  message: string;
  company: string;
};

type FormStatus = "idle" | "sending" | "success" | "error";

const initialFields: ContactFields = {
  name: "",
  email: "",
  subject: "",
  message: "",
  company: "",
};

const apiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "";

export default function ContactForm() {
  const [fields, setFields] = useState<ContactFields>(initialFields);

  const [status, setStatus] = useState<FormStatus>("idle");

  const [errorMessage, setErrorMessage] = useState("");

  const updateField = (field: keyof ContactFields, value: string) => {
    setFields((current) => ({
      ...current,
      [field]: value,
    }));

    if (status !== "idle") {
      setStatus("idle");
      setErrorMessage("");
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

    const controller = new AbortController();

    const timeout = window.setTimeout(() => {
      controller.abort();
    }, 15000);

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
      };

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(
            "Too many messages were sent. Please try again later.",
          );
        }

        throw new Error(result.message ?? "The message could not be sent.");
      }

      setFields(initialFields);
      setStatus("success");
    } catch (error) {
      setStatus("error");

      if (error instanceof DOMException && error.name === "AbortError") {
        setErrorMessage("The request took too long. Please try again.");
      } else {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Something went wrong while sending your message.",
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
          disabled={status === "sending"}
        >
          {status === "sending" ? "Sending..." : "Send Message"}
        </button>

        <span className="contact-form__count">
          {fields.message.length}/3000
        </span>
      </div>

      <div className="contact-form__feedback" aria-live="polite">
        {status === "success" ? (
          <p className="contact-form__success">
            Your message was sent successfully.
          </p>
        ) : null}

        {status === "error" ? (
          <p className="contact-form__error">{errorMessage}</p>
        ) : null}
      </div>
    </form>
  );
}
