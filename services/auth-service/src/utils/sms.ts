import twilio from "twilio";
import { env } from "../config/env";

const twilioClient = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

export const sendSmsOtp = async (phoneNumber: string, otp: string) => {
  console.log("Twilio Config:", {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    fromNumber: process.env.TWILIO_PHONE_NUMBER,
  });

  try {
    const message = await twilioClient.messages.create({
      body: `Your GroceryGo verification code: ${otp} (valid for 5 mins)`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
    console.log("SMS sent:", message.sid);
    return message;
  } catch (error) {
    console.error("Twilio Error:", error);
    throw new Error("Failed to send SMS");
  }
};
