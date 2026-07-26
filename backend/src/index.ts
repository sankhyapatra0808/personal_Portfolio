import "dotenv/config";
import cors, {
  type CorsOptions,
} from "cors";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import portfolioContactRoutes from "./routes/portfolioContact.routes.js";
import { verifyEmailTransport } from "./utils/email.js";

const app = express();

function getPort(): number {
  const rawPort =
    process.env.PORT?.trim() ?? "5000";

  const port = Number(rawPort);

  if (
    !Number.isInteger(port) ||
    port <= 0 ||
    port > 65535
  ) {
    throw new Error(
      "PORT must be a valid port number.",
    );
  }

  return port;
}

function getAllowedOrigins(): Set<string> {
  const origins = String(
    process.env.CLIENT_URLS ?? "",
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return new Set(origins);
}

const port = getPort();
const allowedOrigins =
  getAllowedOrigins();

/*
 * Render and similar platforms place
 * one reverse proxy in front of Express.
 */
if (
  process.env.NODE_ENV === "production"
) {
  app.set("trust proxy", 1);
}

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    /*
     * Requests without Origin include
     * PowerShell, curl and server-to-server
     * requests.
     */
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    callback(
      new Error(
        `Origin ${origin} is not allowed by CORS.`,
      ),
    );
  },

  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  credentials: false,
  maxAge: 86_400,
};

app.disable("x-powered-by");

app.use(cors(corsOptions));

app.use(
  express.json({
    limit: "20kb",
  }),
);

app.get(
  "/health",
  (_request, response) => {
    response.status(200).json({
      status: "ok",
      service:
        "sankhya-portfolio-backend",
      timestamp:
        new Date().toISOString(),
    });
  },
);

app.use(
  "/api/portfolio",
  portfolioContactRoutes,
);

app.use(
  (
    _request: Request,
    response: Response,
  ) => {
    response.status(404).json({
      message: "Route not found.",
    });
  },
);

app.use(
  (
    error: Error,
    _request: Request,
    response: Response,
    _next: NextFunction,
  ) => {
    console.error(
      "Unhandled backend error:",
      error,
    );

    if (
      error.message.includes(
        "is not allowed by CORS",
      )
    ) {
      response.status(403).json({
        message:
          "This website is not allowed to access the backend.",
      });

      return;
    }

    response.status(500).json({
      message:
        "An unexpected server error occurred.",
    });
  },
);

app.listen(port, () => {
  console.log(
    `Portfolio backend running on http://localhost:${port}`,
  );

  console.log(
    "Allowed frontend origins:",
    [...allowedOrigins],
  );

  void verifyEmailTransport()
    .then(() => {
      console.log(
        "Brevo SMTP connection verified.",
      );
    })
    .catch((error: unknown) => {
      console.error(
        "Brevo SMTP verification failed:",
        error,
      );
    });
});