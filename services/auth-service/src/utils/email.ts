import nodemailer from "nodemailer";
import { env } from "../config/env";

const transporter = nodemailer.createTransport({
  host: env.EMAIL_HOST,
  port: Number(env.EMAIL_PORT),
  secure: false,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});

export const sendEmailOtp = async (email: string, otp: string) => {
  console.log("Email Config:", {
    user: env.EMAIL_USER,
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
  });

  const mailOptions = {
    from: `"Slidee" <${env.EMAIL_USER}>`,
    to: email,
    subject: "Your Slidee Verification Code",
    html: `
      <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
        <div style="text-align: center;">
          <h2 style="color: #4F46E5;">Slidee</h2>
          <p style="font-size: 16px; color: #333;">Your OTP is</p>
          <div style="font-size: 32px; font-weight: bold; color: #4F46E5; letter-spacing: 4px; margin: 10px 0;">${otp}</div>
          <p style="font-size: 14px; color: #555;">This code is valid for <strong>5 minutes</strong>.</p>
        </div>
        <hr style="margin: 20px 0;">
        <p style="font-size: 13px; color: #999; text-align: center;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Email Send Error:", error);
    throw new Error("Failed to send OTP email");
  }
};
