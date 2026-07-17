const express = require("express");
const cors = require("cors");
const path = require("path");

const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

// ── Core Middleware ───────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// ── Static File Serving ───────────────────────────────────────────────────────
// Serve uploaded files (resumes, etc.) from /uploads directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Job Portal API Running"
    });
});

// ── API Routes ────────────────────────────────────────────────────────────────
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const companyRoutes = require("./routes/companyRoutes");
const adminRoutes = require("./routes/adminRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const oauthRoutes = require("./routes/oauthRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/oauth", oauthRoutes);

// ── Error Handling (must be LAST) ─────────────────────────────────────────────
app.use(notFound);      // 404 — catches any unmatched route
app.use(errorHandler);  // handles all errors forwarded via next(err)

module.exports = app;
