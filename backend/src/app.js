const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Health Check Route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Job Portal API Running"
    });
});

const authRoutes = require("./routes/authRoutes");

app.use("/api/auth", authRoutes);

module.exports = app;