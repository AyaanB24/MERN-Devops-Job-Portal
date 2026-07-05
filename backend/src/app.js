const express = require("express");
const cors = require("cors");

const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

// ── Core Middleware ───────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Job Portal API Running"
    });
});

// ── API Routes ────────────────────────────────────────────────────────────────
const authRoutes = require("./routes/authRoutes");

app.use("/api/auth", authRoutes);

// ── Error Handling (must be LAST) ─────────────────────────────────────────────
app.use(notFound);      // 404 — catches any unmatched route
app.use(errorHandler);  // handles all errors forwarded via next(err)

module.exports = app;