const express = require("express");
const router = express.Router();
const passport = require("passport");
const OAuth2Strategy = require("passport-oauth2");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

// Configure EnergyID OAuth2 strategy
let energyIDStrategy = new OAuth2Strategy(
  {
    authorizationURL:
      process.env.ENERGYID_AUTH_URL ||
      "https://oauth.energyid.eu/oauth/authorize",
    tokenURL:
      process.env.ENERGYID_TOKEN_URL || "https://oauth.energyid.eu/oauth/token",
    clientID: process.env.ENERGYID_CLIENT_ID,
    clientSecret: process.env.ENERGYID_CLIENT_SECRET,
    callbackURL:
      process.env.ENERGYID_CALLBACK_URL ||
      "http://localhost:3000/api/auth/callback",
    state: true,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const user = {
        id: uuidv4(),
        accessToken,
        refreshToken,
        profile,
        timestamp: new Date(),
      };
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  },
);

passport.use("energyid", energyIDStrategy);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// OAuth login route
router.get(
  "/login",
  passport.authenticate("energyid", {
    scope: ["reading:interval_data", "reading:calendar"],
  }),
);

// OAuth callback
router.get(
  "/callback",
  passport.authenticate("energyid", {
    failureRedirect: "/login?error=auth_failed",
  }),
  (req, res) => {
    // Successful authentication
    res.redirect("/?auth_success=true");
  },
);

// Get current user
router.get("/user", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  res.json({
    id: req.user.id,
    authenticated: true,
    tokenExpiry: req.user.timestamp,
  });
});

// Logout
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    req.session.destroy();
    res.json({ message: "Logged out successfully" });
  });
});

// Check authentication status
router.get("/status", (req, res) => {
  res.json({
    authenticated: !!req.user,
    user: req.user
      ? {
          id: req.user.id,
          timestamp: req.user.timestamp,
        }
      : null,
  });
});

module.exports = router;
