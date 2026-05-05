const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const interviewRouter = require("./routes/interview.routes");
const authRouter = require("./routes/auth.routes");
const app = express();

function normalizeOrigin(origin) {
  return origin.replace(/\/$/, "");
}

function getAllowedOrigins() {
  const configuredOrigins =
    process.env.CLIENT_ORIGIN || process.env.FRONTEND_URL || "";

  return configuredOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map(normalizeOrigin);
}

const allowedOrigins = getAllowedOrigins();
const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(normalizeOrigin(origin))) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

app.options("/{*splat}", cors(corsOptions));

app.get("/", (req, res) => {
  res.status(200).json({
    status: 200,
    success: true,
    message: "Resume backend is running",
  });
});
/* using all routes here */
app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);

app.use((err, req, res, next) => {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.status || 500;

  res.status(statusCode).json({
    status: statusCode,
    success: false,
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;
