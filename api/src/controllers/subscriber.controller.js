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
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: "Subscription Confirmation",
      text: "Thank you for subscribing to our newsletter!",
    };

    // Using a promise-based approach for better error handling
    await transporter.sendMail(mailOptions);
    console.log(`Confirmation email sent to ${email}`);

    // Respond with success message
    res.status(200).json({ message: `Subscribed email: ${email}` });
  } catch (error) {
    console.error("Error in subscribeController:", error);
    res
      .status(500)
      .json({ error: "Internal server error. Please try again later." });
  }
};

export default { subscribe };
