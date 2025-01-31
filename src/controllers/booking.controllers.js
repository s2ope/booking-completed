import Booking from "../models/Booking.js";

export const createBooking = async (req, res, next) => {
  // Convert string dates to Date objects
  const startDate = new Date(req.body.startDate);
  const endDate = new Date(req.body.endDate);

  const newBooking = new Booking({
    user: req.body.user,
    hotel: req.body.hotel,
    rooms: req.body.rooms,
    startDate: startDate,
    endDate: endDate,
    totalPrice: req.body.totalPrice,
    status: req.body.status || "confirmed",
  });

  try {
    const savedBooking = await newBooking.save();
    res.status(200).json(savedBooking);
  } catch (err) {
    next(err);
  }
};

export const getUserBookings = async (req, res, next) => {
  try {
    const booking = await Booking.find(req.params.id)
      .populate("hotel")
      .populate("rooms");
    res.status(200).json(booking);
  } catch (err) {
    next(err);
  }
};

export const getBooking = async (req, res, next) => {
  try {
    console.log("Booking ID:", req.params.id);
    const booking = await Booking.findById(req.params.id)
      .populate("hotel")
      .populate("rooms");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json(booking);
  } catch (err) {
    next(err);
  }
};

export const updateBookingStatus = async (req, res, next) => {
  try {
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json(updatedBooking);
  } catch (err) {
    next(err);
  }
};

export const deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({ message: "Booking has been deleted" });
  } catch (err) {
    next(err);
  }
};
