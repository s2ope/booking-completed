import express from "express";
import Subscriber from "../models/Subscriber.js";
import { sendMail } from "../utils/mailer.js";

const router = express.Router();

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const sendConfirmationEmail = async (email) => {
  try {
    return await sendMail({
      to: email,
      subject: "Mamabooking Subscription Confirmation",
      text: "Thank you for subscribing to Mamabooking deals.",
      html: "<p>Thank you for subscribing to Mamabooking deals.</p>",
    });
  } catch (error) {
    console.error("Subscription email failed:", error.message);
    return false;
  }
};

router.post("/", async (req, res, next) => {
  const email = String(req.body.email || "").trim().toLowerCase();

  if (!validateEmail(email)) {
    return res.status(400).json({ message: "Please enter a valid email address." });
  }

  try {
    const existingSubscriber = await Subscriber.findOne({ email });

    if (existingSubscriber) {
      return res.status(200).json({
        message: "You are already subscribed.",
        subscribed: true,
        alreadySubscribed: true,
        emailSent: false,
      });
    }

    await Subscriber.create({ email });
    const emailSent = await sendConfirmationEmail(email);

    res.status(201).json({
      message: emailSent
        ? "Subscribed successfully. Check your email for confirmation."
        : "Subscribed successfully.",
      subscribed: true,
      alreadySubscribed: false,
      emailSent,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
