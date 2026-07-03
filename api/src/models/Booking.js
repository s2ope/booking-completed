import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userEmail: { type: String },
  userName: { type: String },
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true },
  rooms: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  ],
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "confirmed", "completed", "canceled"],
    default: "pending",
  },
  paymentStatus: {
    type: String,
    enum: ["unpaid", "paid"],
    default: "unpaid",
  },
  stripeCheckoutSessionId: String,
  stripePaymentIntentId: String,
  paidAt: Date,
  confirmationEmailSentAt: Date,
  specialRequests: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Booking", BookingSchema);
