import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
// Works with Gmail, Outlook, Mailgun SMTP, or any SMTP provider.

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,       // e.g. smtp.gmail.com
  family: 4,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === "true", // true for port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,     // use App Password for Gmail
  },
});

const FROM = `"${process.env.EMAIL_FROM_NAME || "Pharmacy App"}" <${process.env.EMAIL_USER}>`;


// Send OTP verification email
export const sendOTPEmail = async ({ toEmail, toName, otp }) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #1e3a8a; margin-bottom: 4px;">Verify Your Email</h2>
      <p style="color: #374151;">Hi <strong>${toName}</strong>,</p>
      <p style="color: #374151;">Use the OTP below to verify your account. It expires in <strong>10 minutes</strong>.</p>

      <div style="text-align: center; margin: 32px 0;">
        <span style="
          display: inline-block;
          font-size: 36px;
          font-weight: 700;
          letter-spacing: 12px;
          color: #1e3a8a;
          background: #eff6ff;
          padding: 16px 28px;
          border-radius: 8px;
          border: 2px dashed #93c5fd;
        ">${otp}</span>
      </div>

      <p style="color: #6b7280; font-size: 13px;">If you didn't create an account, you can safely ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
      <p style="color: #9ca3af; font-size: 12px; text-align: center;">${process.env.EMAIL_FROM_NAME || "Pharmacy App"}</p>
    </div>
  `;

  await transporter.sendMail({
    from: FROM,
    to: toEmail,
    subject: `${otp} is your verification OTP`,
    html,
  });
};

// ─────────────────────────────────────────────────────────────
// Send password reset email
// ─────────────────────────────────────────────────────────────
export const sendPasswordResetEmail = async ({ toEmail, toName, resetURL }) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #1e3a8a; margin-bottom: 4px;">Reset Your Password</h2>
      <p style="color: #374151;">Hi <strong>${toName}</strong>,</p>
      <p style="color: #374151;">Click the button below to reset your password. This link is valid for <strong>30 minutes</strong>.</p>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetURL}" style="
          display: inline-block;
          background: #1e3a8a;
          color: white;
          text-decoration: none;
          padding: 14px 32px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 15px;
        ">Reset Password</a>
      </div>

      <p style="color: #6b7280; font-size: 13px;">Or copy and paste this link into your browser:</p>
      <p style="color: #2563eb; font-size: 12px; word-break: break-all;">${resetURL}</p>

      <p style="color: #6b7280; font-size: 13px; margin-top: 24px;">If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
      <p style="color: #9ca3af; font-size: 12px; text-align: center;">${process.env.EMAIL_FROM_NAME || "Pharmacy App"}</p>
    </div>
  `;

  await transporter.sendMail({
    from: FROM,
    to: toEmail,
    subject: "Reset your password",
    html,
  });
};