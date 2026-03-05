import express from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import mongoose from "mongoose";
import { body, validationResult } from "express-validator";
import User from "../models/User.js";
import Store from "../models/Store.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { sendOTPEmail, sendPasswordResetEmail } from "../utils/emailService.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  });

const registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("storeName").trim().notEmpty().withMessage("Store name is required"),
];
router.post(
  "/register",
  ...registerValidation,
  async (req, res, next) => {
    console.log("inside backend register api line 32");
    const session = await mongoose.startSession();
    session.startTransaction();
console.log("inside backend register api line 35");
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      console.log("inside backend register api line 41");

      const { name, email, password, storeName, storePhone, gstNumber, storeAddress } = req.body;

      // Check duplicate email
      const existing = await User.findOne({ email }).session(session);
      if (existing) {
        await session.abortTransaction();
        return res.status(400).json({ error: "Email already registered" });
      }
console.log("inside backend register api line 51");
     const user = new User({ name, email, password });
await user.save({ session });

const store = new Store({
  name: storeName,
  owner: user._id,
  phone: storePhone,
  gstNumber,
  address: storeAddress
});

await store.save({ session });
console.log("inside backend register api line 60");
      // Link store back to user
      user.store = store._id;
console.log("inside backend register api line 63");
      // Generate OTP and attach to user
      const otpCode = user.generateOTP();
      await user.save({ session });

      await session.commitTransaction();
console.log("inside backend register api line 69");
      // Send OTP email (outside transaction — network call)
      await sendOTPEmail({ toEmail: email, toName: name, otp: otpCode });

      res.status(201).json({
        message: "Registration successful. Please check your email for the OTP to verify your account.",
        userId: user._id,  // frontend needs this to call /verify-otp
      });
console.log("inside backend register api line 77");
    } catch (error) {
      console.log("Error ", error);
      await session.abortTransaction();
      res.status(500).json({ error: error.message });
    } finally {
      session.endSession();
    }
  }
);


router.post(
  "/verify-otp",
  [
    body("userId").notEmpty().withMessage("userId is required"),
    body("otp").isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { userId, otp } = req.body;

      const user = await User.findById(userId).populate("store", "name gstNumber phone");
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user.isVerified) {
        return res.status(400).json({ error: "Account already verified. Please login." });
      }

      if (!user.verifyOTP(otp)) {
        return res.status(400).json({ error: "Invalid or expired OTP" });
      }

      // Mark verified and clear OTP
      user.isVerified = true;
      user.clearOTP();
      await user.save();

      const token = generateToken(user._id);

      res.json({
        message: "Email verified successfully. You are now logged in.",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          store: user.store,
        },
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);


router.post(
  "/resend-otp",
  [body("userId").notEmpty().withMessage("userId is required")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const user = await User.findById(req.body.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user.isVerified) {
        return res.status(400).json({ error: "Account already verified." });
      }

      const otpCode = user.generateOTP();
      await user.save();

      await sendOTPEmail({ toEmail: user.email, toName: user.name, otp: otpCode });

      res.json({ message: "A new OTP has been sent to your email." });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Explicitly select password (it's hidden by default via select:false)
      const user = await User.findOne({ email })
        .select("+password")
        .populate("store", "name gstNumber phone address logo");

      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (!user.isActive) {
        return res.status(403).json({ error: "Account is deactivated. Contact support." });
      }

      if (!user.isVerified) {
        // Resend a fresh OTP and ask them to verify
        const otpCode = user.generateOTP();
        await user.save();
        await sendOTPEmail({ toEmail: user.email, toName: user.name, otp: otpCode });

        return res.status(403).json({
          error: "Email not verified. A new OTP has been sent to your email.",
          userId: user._id,
          requiresVerification: true,
        });
      }

      const token = generateToken(user._id);

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          store: user.store,
        },
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);


router.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("Valid email is required")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const user = await User.findOne({ email: req.body.email });

      // Always return success — don't reveal if email exists
      if (!user) {
        return res.json({ message: "If this email is registered, a reset link has been sent." });
      }

      // Generate a secure random token
      const rawToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

      user.passwordReset = {
        token: hashedToken,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      };
      await user.save();

      // The reset link sent to the user contains the RAW token
      const resetURL = `${process.env.CLIENT_URL}/reset-password?token=${rawToken}`;
      await sendPasswordResetEmail({ toEmail: user.email, toName: user.name, resetURL });

      res.json({ message: "If this email is registered, a reset link has been sent." });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);


router.post(
  "/reset-password",
  [
    body("token").notEmpty().withMessage("Reset token is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { token, password } = req.body;

      
      const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

      const user = await User.findOne({
        "passwordReset.token": hashedToken,
        "passwordReset.expiresAt": { $gt: new Date() }, // not expired
      });

      if (!user) {
        return res.status(400).json({ error: "Reset link is invalid or has expired." });
      }

      user.password = password;
      user.passwordReset = { token: null, expiresAt: null };
      await user.save();

      res.json({ message: "Password reset successful. You can now log in." });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);


router.get("/me", authMiddleware, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      store: req.user.store,
    },
  });
});

export default router;