const express = require("express");
const router = express.Router();
const passport = require("passport");
const OAuth2Strategy = require("passport-oauth2");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const demoMode = require("../services/demoMode");

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

// Demo login route
router.get("/demo-login", (req, res) => {
  if (!demoMode.isDemoModeEnabled()) {
    return res
      .status(403)
      .json({ error: "Demo mode is not enabled. Set DEMO_MODE=true" });
  }

  const demoUser = demoMode.getDemoUser();
  req.login(demoUser, (err) => {
    if (err) {
      return res.status(500).json({ error: "Demo login failed" });
    }
    res.json({
      success: true,
      message: "Demo login successful",
      user: {
        id: demoUser.id,
        email: demoUser.email,
        name: demoUser.name,
        isDemoMode: true,
      },
    });
  });
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
    isDemoMode: req.user.isDemoMode || false,
    email: req.user.email,
    name: req.user.name,
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
    isDemoMode: req.user?.isDemoMode || false,
    demoModeAvailable: demoMode.isDemoModeEnabled(),
    user: req.user
      ? {
          id: req.user.id,
          email: req.user.email,
          name: req.user.name,
          isDemoMode: req.user.isDemoMode || false,
          timestamp: req.user.timestamp,
        }
      : null,
  });
});

// Get demo mode status (no auth required)
router.get("/demo-status", (req, res) => {
  res.json(demoMode.getStatus());
});

module.exports = router;
