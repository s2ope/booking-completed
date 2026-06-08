import mongoose from "mongoose";
import Room from "../models/Room.js";

export const getRoomNumberId = (room) => room?.roomNumberId || room?._id || room;

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

export const hydrateBooking = async (bookingDoc) => {
  const booking =
    typeof bookingDoc.toObject === "function" ? bookingDoc.toObject() : bookingDoc;
  const roomNumberIds = (booking.rooms || []).map(getRoomNumberId).map(String);

  return {
    ...booking,
    rooms: await getRoomNumberDetails(roomNumberIds),
  };
};
