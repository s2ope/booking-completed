import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { createError } from "../utils/error.js";
import jsonwebtoken from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Register function
export const register = async (req, res, next) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const newUser = new User({
      ...req.body,
      password: hash,
    });

    await newUser.save();

    // Generate email verification token
    const verificationToken = jsonwebtoken.sign(
      { email: newUser.email },
      process.env.JWT,
      { expiresIn: "1h" }
    );

    // Nodemailer transporter configuration
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: newUser.email,
      subject: "Email Verification",
      text: `Please verify your email by clicking on the following link: 
      https://mern-backend-j4gu.onrender.com/api/auth/verify-email?token=${verificationToken}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res
          .status(500)
          .json({ error: "Error sending email. Please try again later." });
      }
      console.log("Verification email sent successfully:", info.response);
      res
        .status(200)
        .send(
          "User has been created. Please check your email to verify your account."
        );
    });
  } catch (err) {
    next(err);
  }
};

// Email verification function
export const verifyEmail = async (req, res, next) => {
  const { token } = req.body;
  try {
    const decoded = jsonwebtoken.verify(token, process.env.JWT);
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(400).send("Invalid token or user does not exist.");
    }

    user.isEmailVerified = true;
    await user.save();
    res.status(200).send("Email verified successfully. You can now log in.");
  } catch (err) {
    next(err);
  }
};

// Login function
export const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) return next(createError(404, "User not found!"));

    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordCorrect)
      return next(createError(400, "Wrong username or password!"));

    const token = jsonwebtoken.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT
    );

    const { password, isAdmin, ...otherDetails } = user._doc;
    res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .status(200)
      .json({ details: { ...otherDetails }, isAdmin });
  } catch (err) {
    next(err);
  }
};

// Request password reset function
export const resetPasswordRequest = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return next(createError(404, "User not found"));

    // Generate password reset token
    const resetToken = jsonwebtoken.sign(
      { email: user.email },
      process.env.JWT,
      { expiresIn: "1h" }
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: user.email,
      subject: "Password Reset",
      text: `To reset your password, please click the following link: 
      https://mern-backend-j4gu.onrender.com/api/auth/reset-password?token=${resetToken}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res
          .status(500)
          .json({ error: "Error sending email. Please try again later." });
      }
      console.log("Password reset email sent:", info.response);
      res
        .status(200)
        .send("Password reset email sent. Please check your inbox.");
    });
  } catch (err) {
    next(err);
  }
};

// Verify reset code function
export const verifyResetCode = async (req, res, next) => {
  const { token } = req.body;
  try {
    if (!token) {
      return res.status(400).json({ error: "Token is required." });
    }

    const decoded = jsonwebtoken.verify(token, process.env.JWT);
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res
        .status(404)
        .json({ error: "Invalid token or user does not exist." });
    }

    res.status(200).json({ message: "Token verified successfully." });
  } catch (err) {
    console.error("Error verifying reset code:", err);
    res.status(500).json({ error: "Failed to verify reset code." });
  }
};

// Reset password function
export const resetPassword = async (req, res, next) => {
  const { token, password } = req.body;

  try {
    // Verify the reset token
    const decoded = jsonwebtoken.verify(token, process.env.JWT);
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return next(createError(404, "User not found!"));
    }

    // Encrypt the new password using the same method as register
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    // Update user's password
    user.password = hash;
    await user.save();

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(
        createError(400, "Reset token has expired. Please request a new one.")
      );
    } else if (err.name === "JsonWebTokenError") {
      return next(
        createError(400, "Invalid reset token. Please request a new one.")
      );
    }
    next(err);
  }
};
