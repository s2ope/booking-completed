import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import { createError } from "../utils/error.js";
import {
  getRoomNumberId,
  hydrateBooking,
} from "../utils/bookingHydration.js";
import { sendBookingConfirmationEmailOnce } from "../utils/bookingConfirmation.js";

const normalizeDate = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getStayDates = (startDate, endDate) => {
  const start = normalizeDate(startDate);
  const end = normalizeDate(endDate);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    start >= end
  ) {
    return [];
  }

  const dates = [];
  const current = new Date(start);

  while (current < end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

const getOwnerId = (booking) => {
  const user = booking.user;
  return String(user?._id || user);
};

const assertBookingAccess = (booking, user) => {
  if (!booking) {
    throw createError(404, "Booking not found");
  }

  if (!user?.isAdmin && getOwnerId(booking) !== user?.id) {
    throw createError(403, "You are not authorized to view this booking.");
  }
};

const assertHotelOwnerAccess = (booking, user) => {
  if (!booking) {
    throw createError(404, "Booking not found");
  }

  const ownerId = booking.hotel?.owner;
  if (!ownerId && user?.isAdmin) {
    return;
  }

  if (!ownerId || String(ownerId) !== String(user?.id)) {
    throw createError(403, "You are not authorized to manage this booking.");
  }
};

const findSelectedRoomNumbers = (hotelRooms, selectedRoomIds) => {
  return selectedRoomIds.map((selectedRoomId) => {
    for (const room of hotelRooms) {
      const roomNumber = room.roomNumbers.find(
        (number) => String(number._id) === String(selectedRoomId)
      );

      if (roomNumber) {
        return { room, roomNumber, selectedRoomId };
      }
    }

    throw createError(400, "Selected room is not available at this hotel.");
  });
};

const assertRoomsAvailable = (selectedRooms, stayDates) => {
  const requestedDays = new Set(
    stayDates.map((date) => normalizeDate(date).getTime())
  );

  selectedRooms.forEach(({ roomNumber }) => {
    const isUnavailable = roomNumber.unavailableDates?.some((date) =>
      requestedDays.has(normalizeDate(date).getTime())
    );

    if (isUnavailable) {
      throw createError(
        409,
        `Room ${roomNumber.number} is no longer available for those dates.`
      );
    }
  });
};

const releaseRoomHolds = async (booking) => {
  const stayDates = getStayDates(booking.startDate, booking.endDate);
  const roomNumberIds = (booking.rooms || []).map(getRoomNumberId);

  await Promise.all(
    roomNumberIds.map((roomNumberId) =>
      Room.updateOne(
        { "roomNumbers._id": roomNumberId },
        {
          $pull: {
            "roomNumbers.$.unavailableDates": { $in: stayDates },
          },
        }
      )
    )
  );
};

const getPopulatedBooking = (id) =>
  Booking.findById(id).populate("hotel").populate("user", "username email");

export const createBooking = async (req, res, next) => {
  try {
    const { hotel, rooms = [], startDate, endDate, specialRequests } = req.body;
    const selectedRoomIds = [...new Set(rooms.map(String))];
    const stayDates = getStayDates(startDate, endDate);

    if (!mongoose.Types.ObjectId.isValid(hotel)) {
      return next(createError(400, "Invalid hotel ID."));
    }

    if (!selectedRoomIds.length) {
      return next(createError(400, "Please select at least one room."));
    }

    if (selectedRoomIds.some((roomId) => !mongoose.Types.ObjectId.isValid(roomId))) {
      return next(createError(400, "Invalid room selection."));
    }

    if (stayDates.length === 0) {
      return next(createError(400, "Please choose a valid check-in and checkout date."));
    }

    const currentHotel = await Hotel.findById(hotel).lean();
    if (!currentHotel) {
      return next(createError(404, "Hotel not found."));
    }

    const hotelRooms = await Room.find({ _id: { $in: currentHotel.rooms } });
    const selectedRooms = findSelectedRoomNumbers(hotelRooms, selectedRoomIds);
    assertRoomsAvailable(selectedRooms, stayDates);

    const totalPrice = selectedRooms.reduce(
      (total, { room }) => total + room.price * stayDates.length,
      0
    );

    const currentUser = await User.findById(req.user.id).select("username email").lean();

    const newBooking = new Booking({
      user: req.user.id,
      userEmail: currentUser?.email,
      userName: currentUser?.username,
      hotel,
      rooms: selectedRoomIds,
      startDate: normalizeDate(startDate),
      endDate: normalizeDate(endDate),
      totalPrice,
      status: "pending",
      specialRequests,
    });

    const savedBooking = await newBooking.save();

    await Promise.all(
      selectedRoomIds.map((roomNumberId) =>
        Room.updateOne(
          { "roomNumbers._id": roomNumberId },
          {
            $addToSet: {
              "roomNumbers.$.unavailableDates": { $each: stayDates },
            },
          }
        )
      )
    );

    const booking = await Booking.findById(savedBooking._id)
      .populate("hotel")
      .populate("user", "username email");

    res.status(201).json(await hydrateBooking(booking));
  } catch (err) {
    next(err);
  }
};

export const getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("hotel")
      .populate("user", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json(await Promise.all(bookings.map(hydrateBooking)));
  } catch (err) {
    next(err);
  }
};

export const getBookingRequests = async (req, res, next) => {
  try {
    const requestedStatus = req.query.status || "pending";
    const normalizedStatus =
      requestedStatus === "cancelled" ? "canceled" : requestedStatus;
    const allowedStatuses = ["pending", "confirmed", "completed", "canceled"];

    if (normalizedStatus !== "all" && !allowedStatuses.includes(normalizedStatus)) {
      return next(createError(400, "Invalid booking status filter."));
    }

    const manageableHotelIds = await Hotel.find({
      $or: [
        { owner: req.user.id },
        { owner: { $exists: false } },
        { owner: null },
      ],
    }).distinct("_id");

    if (!manageableHotelIds.length) {
      return res.status(200).json([]);
    }

    const filter = {
      hotel: { $in: manageableHotelIds },
    };

    if (normalizedStatus !== "all") {
      filter.status = normalizedStatus;
    }

    const bookings = await Booking.find(filter)
      .populate("hotel")
      .populate("user", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json(await Promise.all(bookings.map(hydrateBooking)));
  } catch (err) {
    next(err);
  }
};

export const acceptBookingRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createError(400, "Invalid booking ID format"));
    }

    const booking = await getPopulatedBooking(id);
    assertHotelOwnerAccess(booking, req.user);

    if (booking.status !== "pending") {
      return next(createError(400, "Only pending booking requests can be accepted."));
    }

    booking.status = "confirmed";
    await booking.save();

    const updatedBooking = await getPopulatedBooking(id);
    const hydratedBooking = await hydrateBooking(updatedBooking);

    res.status(200).json({
      ...hydratedBooking,
      accepted: true,
      emailSent: false,
    });
  } catch (err) {
    next(err);
  }
};

export const sendAcceptedBookingEmail = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createError(400, "Invalid booking ID format"));
    }

    const booking = await getPopulatedBooking(id);
    assertHotelOwnerAccess(booking, req.user);

    if (booking.status !== "confirmed") {
      return next(
        createError(
          400,
          "Booking must be accepted before the confirmation email can be sent."
        )
      );
    }

    const hydratedBooking = await hydrateBooking(booking);

    try {
      const acceptedEmail = await sendBookingConfirmationEmailOnce(
        booking,
        hydratedBooking
      );

      return res.status(200).json({
        ...hydratedBooking,
        confirmationEmailSentAt: booking.confirmationEmailSentAt,
        accepted: true,
        emailSent: acceptedEmail.sent || acceptedEmail.alreadySent,
        emailAlreadySent: acceptedEmail.alreadySent,
        emailSentTo: acceptedEmail?.to,
      });
    } catch (emailError) {
      console.error(
        `Booking is accepted, but confirmation email could not be sent for booking ${booking._id}:`,
        emailError.message
      );

      return res.status(200).json({
        ...hydratedBooking,
        accepted: true,
        emailSent: false,
        emailAlreadySent: false,
        emailError: emailError.message,
      });
    }
  } catch (err) {
    next(err);
  }
};

export const declineBookingRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createError(400, "Invalid booking ID format"));
    }

    const booking = await getPopulatedBooking(id);
    assertHotelOwnerAccess(booking, req.user);

    if (booking.status !== "pending") {
      return next(createError(400, "Only pending booking requests can be declined."));
    }

    await releaseRoomHolds(booking);
    booking.status = "canceled";
    await booking.save();

    const updatedBooking = await getPopulatedBooking(id);
    res.status(200).json(await hydrateBooking(updatedBooking));
  } catch (err) {
    next(err);
  }
};

export const getBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createError(400, "Invalid booking ID format"));
    }

    const booking = await Booking.findById(id)
      .populate("hotel")
      .populate("user", "username email");

    assertBookingAccess(booking, req.user);

    res.status(200).json(await hydrateBooking(booking));
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(createError(400, "Invalid booking ID format"));
    }

    const status = req.body.status === "cancelled" ? "canceled" : req.body.status;
    const allowedStatuses = ["pending", "confirmed", "completed", "canceled"];

    if (!allowedStatuses.includes(status)) {
      return next(createError(400, "Invalid booking status."));
    }

    const booking = await getPopulatedBooking(req.params.id);
    assertHotelOwnerAccess(booking, req.user);

    if (booking.status === "completed" && status === "canceled") {
      return next(createError(400, "Completed bookings cannot be canceled."));
    }

    const wasPending = booking.status === "pending";

    if (status === "canceled" && booking.status !== "canceled") {
      await releaseRoomHolds(booking);
    }

    booking.status = status;
    await booking.save();

    const updatedBooking = await getPopulatedBooking(req.params.id);
    const hydratedBooking = await hydrateBooking(updatedBooking);

    if (status === "confirmed" && wasPending) {
      return res.status(200).json({
        ...hydratedBooking,
        accepted: true,
        emailSent: false,
      });
    }

    res.status(200).json(hydratedBooking);
  } catch (err) {
    next(err);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createError(400, "Invalid booking ID format"));
    }

    const booking = await Booking.findById(id);
    assertBookingAccess(booking, req.user);

    if (booking.status === "completed") {
      return next(createError(400, "Completed bookings cannot be canceled."));
    }

    if (booking.status !== "canceled") {
      await releaseRoomHolds(booking);
      booking.status = "canceled";
      await booking.save();
    }

    const updatedBooking = await Booking.findById(id)
      .populate("hotel")
      .populate("user", "username email");

    res.status(200).json(await hydrateBooking(updatedBooking));
  } catch (err) {
    next(err);
  }
};
