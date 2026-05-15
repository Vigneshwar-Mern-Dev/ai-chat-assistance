const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { asyncHandler } = require("../utils/asyncHandler");

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-it";
const DASHBOARD_USERNAME = process.env.DASHBOARD_USERNAME || "admin";
const DASHBOARD_PASSWORD_HASH = process.env.DASHBOARD_PASSWORD_HASH;

function createAuthRouter() {
  const router = express.Router();

  router.post("/login", asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!DASHBOARD_PASSWORD_HASH) {
       return res.status(500).json({ success: false, message: "Server auth misconfigured" });
    }

    if (username !== DASHBOARD_USERNAME) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, DASHBOARD_PASSWORD_HASH);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ user: username }, JWT_SECRET, { expiresIn: "7d" });

    res.cookie("dashboard_token", token, {
      httpOnly: true,
      // Set to false for now so you can login via IP/HTTP without SSL
      secure: false, 
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({ success: true, token });
  }));

  router.post("/logout", (req, res) => {
    res.clearCookie("dashboard_token");
    res.json({ success: true });
  });

  router.get("/verify", (req, res) => {
    const token = req.cookies.dashboard_token || req.headers["x-dashboard-token"];

    if (!token) {
      return res.status(401).json({ success: false, message: "No token" });
    }

    try {
      jwt.verify(token, JWT_SECRET);
      res.json({ success: true });
    } catch (err) {
      res.status(401).json({ success: false, message: "Invalid token" });
    }
  });

  return router;
}

module.exports = { createAuthRouter };
