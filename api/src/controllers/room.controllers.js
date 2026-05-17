import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";
import { createError } from "../utils/error.js";

const normalizeRoomNumbers = (incomingRoomNumbers, existingRoomNumbers = []) => {
  if (!Array.isArray(incomingRoomNumbers)) return undefined;

  const existingById = new Map(
    existingRoomNumbers.map((roomNumber) => [String(roomNumber._id), roomNumber])
  );
  const existingByNumber = new Map(
    existingRoomNumbers.map((roomNumber) => [String(roomNumber.number), roomNumber])
  );

  return incomingRoomNumbers
    .map((roomNumber) => {
      const number = Number(roomNumber?.number ?? roomNumber);
      if (!Number.isFinite(number)) return null;

      const existing =
        (roomNumber?._id && existingById.get(String(roomNumber._id))) ||
        existingByNumber.get(String(number));

      return {
        ...(existing?._id ? { _id: existing._id } : {}),
        number,
        unavailableDates:
          existing?.unavailableDates || roomNumber?.unavailableDates || [],
      };
    })
    .filter(Boolean);
};

export const createRoom = async (req, res, next) => {
  const hotelId = req.params.hotelid;

  try {
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return next(createError(404, "Hotel not found"));

    const newRoom = new Room(req.body);
    const savedRoom = await newRoom.save();
    await Hotel.findByIdAndUpdate(hotelId, {
      $addToSet: { rooms: String(savedRoom._id) },
    });
    res.status(200).json(savedRoom);
  } catch (err) {
    next(err);
  }
};

export const updateRoom = async (req, res, next) => {
  try {
    const existingRoom = await Room.findById(req.params.id);
    if (!existingRoom) return next(createError(404, "Room not found"));

    const { hotelId, ...body } = req.body;
    const update = {};

    ["title", "desc"].forEach((field) => {
      if (body[field] !== undefined) update[field] = body[field];
    });

    ["price", "maxPeople"].forEach((field) => {
      if (body[field] !== undefined) update[field] = Number(body[field]);
    });

    if (body.roomNumbers !== undefined) {
      update.roomNumbers = normalizeRoomNumbers(
        body.roomNumbers,
        existingRoom.roomNumbers
      );
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: true }
    );

    if (hotelId !== undefined && hotelId !== "") {
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) return next(createError(404, "Hotel not found"));

      await Hotel.updateMany(
        { rooms: String(req.params.id) },
        { $pull: { rooms: String(req.params.id) } }
      );
      await Hotel.findByIdAndUpdate(hotelId, {
        $addToSet: { rooms: String(req.params.id) },
      });
    }

    res.status(200).json(updatedRoom);
  } catch (err) {
    next(err);
  }
};

export const updateRoomAvailability = async (req, res, next) => {
  try {
    await Room.updateOne(
      { "roomNumbers._id": req.params.id },
      {
        $push: {
          "roomNumbers.$.unavailableDates": req.body.dates,
        },
      }
    );
    res.status(200).json("Room status has been updated");
  } catch (err) {
    next(err);
  }
};

export const deleteRoom = async (req, res, next) => {
  try {
    const deletedRoom = await Room.findByIdAndDelete(req.params.id);
    if (!deletedRoom) return next(createError(404, "Room not found"));

    await Hotel.updateMany(
      { rooms: String(req.params.id) },
      { $pull: { rooms: String(req.params.id) } }
    );
    res.status(200).json("Room has been deleted.");
  } catch (err) {
    next(err);
  }
};
export const getRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).lean();
    if (!room) return next(createError(404, "Room not found"));

    const hotel = await Hotel.findOne({ rooms: String(req.params.id) }).select(
      "_id name"
    );

    res.status(200).json({
      ...room,
      hotelId: hotel?._id || "",
      hotel: hotel || null,
    });
  } catch (err) {
    next(err);
  }
};
export const getRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find();
    res.status(200).json(rooms);
  } catch (err) {
    next(err);
  }
};
