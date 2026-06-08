import { sendMail } from "./mailer.js";
import User from "../models/User.js";
import mongoose from "mongoose";

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const formatRooms = (rooms = []) => {
  if (!rooms.length) return "Room details unavailable";
  return rooms
    .map((room) => [room.title, room.number ? `Room ${room.number}` : ""].filter(Boolean).join(" - "))
    .join(", ");
};

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const getBookingUserId = (booking) => booking?.user?._id || booking?.user;

const resolveBookingUser = async (booking) => {
  const userId = getBookingUserId(booking);

  if (userId && mongoose.Types.ObjectId.isValid(String(userId))) {
    const user = await User.findById(userId).select("username email").lean();
    if (user) {
      return {
        username: user.username,
        email: String(user.email || "").trim(),
      };
    }
  }

  return {
    username: booking?.user?.username,
    email: String(booking?.user?.email || "").trim(),
  };
};

export const sendBookingAcceptedEmail = async (booking) => {
  const bookingUser = await resolveBookingUser(booking);
  const recipient = bookingUser.email;
  if (!recipient) {
    throw new Error("Booking user email is missing.");
  }

  const hotelName = booking.hotel?.name || "your hotel";
  const guestName = bookingUser.username || "Guest";
  const checkIn = formatDate(booking.startDate);
  const checkOut = formatDate(booking.endDate);
  const rooms = formatRooms(booking.rooms);

  await sendMail(
    {
      to: recipient,
      subject: `Your Mamabooking request for ${hotelName} was accepted`,
      text: [
        `Hello ${guestName},`,
        "",
        `Good news! Your booking request for ${hotelName} has been accepted.`,
        `Check-in: ${checkIn}`,
        `Check-out: ${checkOut}`,
        `Rooms: ${rooms}`,
        `Total price: $${booking.totalPrice}`,
        "",
        "Thank you for booking with Mamabooking.",
      ].join("\n"),
      html: `
        <p>Hello ${escapeHtml(guestName)},</p>
        <p>Good news! Your booking request for <strong>${escapeHtml(hotelName)}</strong> has been accepted.</p>
        <ul>
          <li><strong>Check-in:</strong> ${escapeHtml(checkIn)}</li>
          <li><strong>Check-out:</strong> ${escapeHtml(checkOut)}</li>
          <li><strong>Rooms:</strong> ${escapeHtml(rooms)}</li>
          <li><strong>Total price:</strong> $${escapeHtml(booking.totalPrice)}</li>
        </ul>
        <p>Thank you for booking with Mamabooking.</p>
      `,
    }
  );

  return { to: recipient };
};
