import stripe from "../lib/stripe.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import { createError } from "../utils/error.js";
import { hydrateBooking } from "../utils/bookingHydration.js";
import { sendBookingConfirmationEmailOnce } from "../utils/bookingConfirmation.js";

const CHECKOUT_CURRENCY = "usd";
const LOCAL_CLIENT_URL = "http://localhost:5173";
const DEPLOYED_CLIENT_URL = "https://mern-client-iota.vercel.app";

const getDefaultClientUrl = () =>
  process.env.NODE_ENV === "production"
    ? process.env.DEPLOYED_CLIENT_URL || DEPLOYED_CLIENT_URL
    : LOCAL_CLIENT_URL;

const normalizeUrl = (url) => String(url || "").replace(/\/+$/, "");

const getClientUrl = (req) => {
  const allowedClientUrls = new Set(
    [
      LOCAL_CLIENT_URL,
      DEPLOYED_CLIENT_URL,
      process.env.CLIENT_URL,
      process.env.FRONTEND_URL,
      process.env.DEPLOYED_CLIENT_URL,
    ]
      .filter(Boolean)
      .map(normalizeUrl),
  );
  const requestOrigin = normalizeUrl(req.get?.("origin"));

  if (requestOrigin && allowedClientUrls.has(requestOrigin)) {
    return requestOrigin;
  }

  return normalizeUrl(
    process.env.CLIENT_URL || process.env.FRONTEND_URL || getDefaultClientUrl(),
  );
};

const getBookingOwnerId = (booking) =>
  String(booking.user?._id || booking.user);

const getPopulatedBooking = (id) =>
  Booking.findById(id).populate("hotel").populate("user", "username email");

const assertBookingOwner = (booking, user) => {
  if (!booking) {
    throw createError(404, "Booking not found.");
  }

  if (getBookingOwnerId(booking) !== user?.id) {
    throw createError(403, "You are not authorized to pay for this booking.");
  }
};

const getPaymentIntentId = (session) =>
  typeof session.payment_intent === "string"
    ? session.payment_intent
    : session.payment_intent?.id;

export const createCheckoutSession = async (req, res) => {
  try {
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    const { productName, amount, quantity = 1 } = req.body;

    const lineItems = items.length
      ? items
      : productName && amount
        ? [
            {
              name: productName,
              price: Number(amount),
              quantity: Number(quantity) || 1,
            },
          ]
        : [];

    if (!lineItems.length) {
      return res.status(400).json({
        message: "No line items provided for checkout session.",
      });
    }

    const clientUrl = getClientUrl(req);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name || "Item",
          },
          unit_amount: Math.round((item.price || 0) * 100),
        },
        quantity: Number(item.quantity) || 1,
      })),
      mode: "payment",
      success_url: `${clientUrl}/success`,
      cancel_url: `${clientUrl}/cancel`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const createBookingCheckoutSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createError(400, "Invalid booking ID format."));
    }

    const booking = await getPopulatedBooking(id);
    assertBookingOwner(booking, req.user);

    if (booking.status === "canceled") {
      return next(createError(400, "Canceled bookings cannot be paid."));
    }

    if (booking.paymentStatus === "paid") {
      return next(createError(400, "This booking has already been paid."));
    }

    if (booking.status !== "pending") {
      return next(createError(400, "Only pending bookings can be paid."));
    }

    const amount = Math.round(Number(booking.totalPrice || 0) * 100);
    if (amount <= 0) {
      return next(createError(400, "Booking total must be greater than zero."));
    }

    const bookingId = String(booking._id);
    const userId = String(req.user.id);
    const clientUrl = getClientUrl(req);
    const hotelName = booking.hotel?.name || "Hotel booking";
    const metadata = { bookingId, userId };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: booking.user?.email || undefined,
      line_items: [
        {
          price_data: {
            currency: CHECKOUT_CURRENCY,
            product_data: {
              name: `Booking at ${hotelName}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata,
      payment_intent_data: { metadata },
      success_url: `${clientUrl}/my-bookings/${bookingId}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/my-bookings/${bookingId}?payment=cancelled`,
    });

    booking.stripeCheckoutSessionId = session.id;
    await booking.save();

    return res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (error) {
    next(error);
  }
};

export const confirmBookingCheckoutSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sessionId = req.body.sessionId || req.body.session_id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createError(400, "Invalid booking ID format."));
    }

    if (!sessionId) {
      return next(createError(400, "Stripe checkout session ID is required."));
    }

    let booking = await getPopulatedBooking(id);
    assertBookingOwner(booking, req.user);

    let fallbackUser = null;

    if (booking.status === "canceled") {
      return next(createError(400, "Canceled bookings cannot be confirmed."));
    }

    if (!booking.user?.email && !booking.userEmail) {
      fallbackUser = await User.findById(req.user.id)
        .select("email username")
        .lean();
      if (fallbackUser?.email) {
        booking.user = {
          _id: booking.user?._id || booking.user,
          email: fallbackUser.email,
          username: booking.user?.username || fallbackUser.username,
        };
      }
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    const sessionBookingId = session.metadata?.bookingId;
    const sessionUserId = session.metadata?.userId;
    if (
      sessionBookingId !== String(booking._id) ||
      sessionUserId !== req.user.id
    ) {
      return next(
        createError(403, "Stripe session does not match this booking."),
      );
    }

    if (session.payment_status !== "paid") {
      return next(createError(400, "Stripe payment has not been completed."));
    }

    const expectedAmount = Math.round(Number(booking.totalPrice || 0) * 100);
    if (Number(session.amount_total) !== expectedAmount) {
      return next(
        createError(400, "Stripe payment amount does not match this booking."),
      );
    }

    if (String(session.currency || "").toLowerCase() !== CHECKOUT_CURRENCY) {
      return next(
        createError(
          400,
          "Stripe payment currency does not match this booking.",
        ),
      );
    }

    if (!["pending", "confirmed"].includes(booking.status)) {
      return next(
        createError(400, "This booking cannot be confirmed by payment."),
      );
    }

    const wasAlreadyPaid = booking.paymentStatus === "paid";
    booking.status = "confirmed";
    booking.paymentStatus = "paid";
    booking.stripeCheckoutSessionId = session.id;
    booking.stripePaymentIntentId = getPaymentIntentId(session);
    booking.paidAt = booking.paidAt || new Date();
    await booking.save();

    const hydratedBooking = await hydrateBooking(booking);

    if (!hydratedBooking.user?.email && !hydratedBooking.userEmail) {
      if (!fallbackUser) {
        fallbackUser = await User.findById(req.user.id)
          .select("email username")
          .lean();
      }
      hydratedBooking.user = {
        ...hydratedBooking.user,
        email: fallbackUser?.email,
        username: hydratedBooking.user?.username || fallbackUser?.username,
      };
    }

    try {
      const emailResult = await sendBookingConfirmationEmailOnce(
        booking,
        hydratedBooking,
      );

      return res.status(200).json({
        ...hydratedBooking,
        confirmationEmailSentAt: booking.confirmationEmailSentAt,
        paymentConfirmed: true,
        paymentAlreadyConfirmed: wasAlreadyPaid,
        emailSent: emailResult.sent || emailResult.alreadySent,
        emailAlreadySent: emailResult.alreadySent,
        emailSentTo: emailResult.to,
        emailUsed: hydratedBooking.user?.email,
      });
    } catch (emailError) {
      console.error(
        `Payment was recorded, but confirmation email could not be sent for booking ${booking._id}:`,
        emailError,
      );

      return res.status(200).json({
        ...hydratedBooking,
        paymentConfirmed: true,
        paymentAlreadyConfirmed: wasAlreadyPaid,
        emailSent: false,
        emailAlreadySent: false,
        emailError: emailError.message,
      });
    }
  } catch (error) {
    next(error);
  }
};
