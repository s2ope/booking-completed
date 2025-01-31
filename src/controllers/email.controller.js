import express from "express";
import nodemailer from "nodemailer";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

// Mongoose schema for storing emails
const emailSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
});

const Email = mongoose.model("Email", emailSchema);

// Function to validate email format
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Subscribe route
router.post("/", async (req, res) => {
  const { email } = req.body;

  // Validate email format
  if (!validateEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  try {
    // Check if email already exists in the database
    const existingEmail = await Email.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Already subscribed" });
    }

    // Save email to MongoDB
    const newEmail = new Email({ email });
    await newEmail.save();

    // Nodemailer transporter configuration
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Resolve file path for attachment
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const attachmentPath = path.join(
      __dirname,
      "../../public/uploads/sample.png"
    );

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: "Subscription Confirmation",
      text: "Thank you for subscribing to our newsletter!",
      html: "<b>Feel free to contact us</b>",
      attachments: [
        {
          filename: "sample.png", // File name to show in the email
          path: attachmentPath, // Absolute path to the image file
          contentType: "image/png",
        },
      ],
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res
          .status(500)
          .json({ error: "Error sending email. Please try again later." });
      }
      console.log("Email sent successfully:", info.response);
      res.status(200).json({ message: `Subscribed email: ${email}` });
    });
  } catch (error) {
    console.error("Error subscribing:", error);
    res
      .status(500)
      .json({ error: "Error subscribing. Please try again later." });
  }
});

export default router;
