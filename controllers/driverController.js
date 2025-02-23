const _db = require("../config/db");
const bcrypt = require("../utils/bcrypt");
const jwt = require("../utils/jwt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { ObjectId } = require("mongodb");
require("dotenv").config();

// Forgot Password: Request Password Reset
exports.forgotPassword = async (req, res) => {
  let { email } = req.body;
  let db = _db.getDb();
  let driver = await db.collection("drivers").findOne({ email });

  if (!driver) {
    return res.send("Email not found.");
  }

  // Generate a reset token (valid for 1 hour)
  let resetToken = crypto.randomBytes(32).toString("hex");
  let tokenExpiry = Date.now() + 3600000;

  // Store the token in the database
  await db.collection("drivers").updateOne(
    { email },
    { $set: { resetToken, tokenExpiry } }
  );

  // Send email with reset link
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  let resetLink = `http://localhost:3000/driver/reset-password/${resetToken}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset Request",
    html: `<p>You requested a password reset. Click <a href="${resetLink}">here</a> to reset your password.</p>`,
  });

  res.send("Password reset link has been sent to your email.");
};

// Get Reset Password Form
exports.getResetPasswordForm = async (req, res) => {
  let { token } = req.params;
  let db = _db.getDb();
  let driver = await db.collection("drivers").findOne({ resetToken: token, tokenExpiry: { $gt: Date.now() } });

  if (!driver) {
    return res.send("Invalid or expired reset token.");
  }

  res.render("driver/resetPasswordForm.ejs", { token });
};

// Reset Password: Update Password in Database
exports.resetPassword = async (req, res) => {
  let { token, newPassword } = req.body;
  let db = _db.getDb();
  let driver = await db.collection("drivers").findOne({ resetToken: token, tokenExpiry: { $gt: Date.now() } });

  if (!driver) {
    return res.send("Invalid or expired reset token.");
  }

  // Hash new password and update database
  let hashedPassword = bcrypt.hashPassword(newPassword);
  await db.collection("drivers").updateOne(
    { resetToken: token },
    { $set: { password: hashedPassword }, $unset: { resetToken: "", tokenExpiry: "" } }
  );

  res.send("Password has been reset successfully.");
};
