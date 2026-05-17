import express from "express";
import nodemailer from "nodemailer";
import Subscriber from "../models/Subscriber.js";

const router = express.Router();

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const sendConfirmationEmail = async (email) => {
  if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: "Mamabooking Subscription Confirmation",
      text: "Thank you for subscribing to Mamabooking deals.",
      html: "<p>Thank you for subscribing to Mamabooking deals.</p>",
    });

    return true;
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
