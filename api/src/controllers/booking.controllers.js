import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import mongoose from "mongoose";
import { createError } from "../utils/error.js";

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

const getRoomNumberId = (room) => room?.roomNumberId || room?._id || room;

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

const getRoomNumberDetails = async (roomNumberIds) => {
  if (!roomNumberIds.length) return [];

  const validRoomNumberIds = roomNumberIds.filter((id) =>
    mongoose.Types.ObjectId.isValid(id)
  );
  const ids = validRoomNumberIds.map((id) => new mongoose.Types.ObjectId(id));
  const rooms = await Room.find({
    $or: [{ "roomNumbers._id": { $in: ids } }, { _id: { $in: ids } }],
  })
    .select("title desc price maxPeople roomNumbers")
    .lean();

  return roomNumberIds.map((roomNumberId) => {
    const parentRoom = rooms.find((room) =>
      room.roomNumbers?.some(
        (number) => String(number._id) === String(roomNumberId)
      )
    );

    if (parentRoom) {
      const roomNumber = parentRoom.roomNumbers.find(
        (number) => String(number._id) === String(roomNumberId)
      );

      return {
        _id: String(roomNumber._id),
        roomId: String(parentRoom._id),
        title: parentRoom.title,
        desc: parentRoom.desc,
        price: parentRoom.price,
        maxPeople: parentRoom.maxPeople,
        number: roomNumber.number,
      };
    }

    const legacyRoom = rooms.find(
      (room) => String(room._id) === String(roomNumberId)
    );

    if (legacyRoom) {
      return {
        _id: String(legacyRoom._id),
        roomId: String(legacyRoom._id),
        title: legacyRoom.title,
        desc: legacyRoom.desc,
        price: legacyRoom.price,
        maxPeople: legacyRoom.maxPeople,
        number: legacyRoom.roomNumbers?.map((number) => number.number).join(", "),
      };
    }

    return {
      _id: String(roomNumberId),
      title: "Room details unavailable",
      number: "N/A",
    };
  });
};

const hydrateBooking = async (bookingDoc) => {
  const booking =
    typeof bookingDoc.toObject === "function" ? bookingDoc.toObject() : bookingDoc;
  const roomNumberIds = (booking.rooms || []).map(getRoomNumberId).map(String);

  return {
    ...booking,
    rooms: await getRoomNumberDetails(roomNumberIds),
  };
};

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

    const newBooking = new Booking({
      user: req.user.id,
      hotel,
      rooms: selectedRoomIds,
      startDate: normalizeDate(startDate),
      endDate: normalizeDate(endDate),
      totalPrice,
      status: "confirmed",
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
      .sort({ createdAt: -1 });

    res.status(200).json(await Promise.all(bookings.map(hydrateBooking)));
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
    const status = req.body.status === "cancelled" ? "canceled" : req.body.status;
    const allowedStatuses = ["pending", "confirmed", "completed", "canceled"];

    if (!allowedStatuses.includes(status)) {
      return next(createError(400, "Invalid booking status."));
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate("hotel")
      .populate("user", "username email");

    if (!updatedBooking) {
      return next(createError(404, "Booking not found"));
    }

    res.status(200).json(await hydrateBooking(updatedBooking));
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
