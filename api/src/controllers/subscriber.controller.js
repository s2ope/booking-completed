import Subscriber from "../models/Subscriber.js";
import nodemailer from "nodemailer";

const subscribe = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // Check if email already exists
    const existingSubscriber = await Subscriber.findOne({ email });
    if (existingSubscriber) {
      return res.status(400).json({ error: "Email already subscribed" });
    }

    // Create a new subscriber
    const subscriber = new Subscriber({ email });
    await subscriber.save();

    // Send confirmation email using Nodemailer
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.verify();

    const mailOptions = {
      from: `"Mamabooking" <${process.env.EMAIL_USERNAME}>`,
      to: email,
      subject: "Subscription Confirmation",
      html: `
        <h2>Thanks for subscribing!</h2>
        <p>You have successfully subscribed to our newsletter.</p>
      `,
    };

    // Using a promise-based approach for better error handling
    await transporter.sendMail(mailOptions);
    console.log(`Confirmation email sent to ${email}`);

    // Respond with success message
    res.status(200).json({ message: "Subscription successful. Email sent." });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
};

export default { subscribe };
