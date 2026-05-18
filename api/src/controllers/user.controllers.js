import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Hotel from "../models/Hotel.js";
import User from "../models/User.js";
import { createError } from "../utils/error.js";

const publicUserFields = "-password -resetPasswordToken -resetPasswordExpires -verificationCode";

const sanitizeProfileUpdate = (body) => ({
  phone: body.phone || "",
  city: body.city || "",
  country: body.country || "",
  img: body.img || "",
});

const sanitizeAdminUserUpdate = (body, isAdmin) => {
  const update = {};
  const adminFields = ["username", "email", "phone", "country", "city", "img"];
  const selfFields = ["phone", "country", "city", "img"];
  const allowedFields = isAdmin ? adminFields : selfFields;

  allowedFields.forEach((field) => {
    if (body[field] !== undefined) update[field] = body[field];
  });

  if (isAdmin && body.isAdmin !== undefined) {
    update.isAdmin = body.isAdmin === true || body.isAdmin === "true";
  }

  if (body.password && String(body.password).trim()) {
    const salt = bcrypt.genSaltSync(10);
    update.password = bcrypt.hashSync(body.password, salt);
  }

  return update;
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select(publicUserFields)
      .populate("savedHotels", "name city address photos rating cheapestPrice type");

    if (!user) return next(createError(404, "User not found"));

    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: sanitizeProfileUpdate(req.body) },
      { new: true, runValidators: true }
    ).select(publicUserFields);

    if (!updatedUser) return next(createError(404, "User not found"));

    res.status(200).json(updatedUser);
  } catch (err) {
    next(err);
  }
};

export const getSavedHotels = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate(
      "savedHotels",
      "name city address photos rating cheapestPrice type distance desc"
    );

    if (!user) return next(createError(404, "User not found"));

    res.status(200).json(user.savedHotels || []);
  } catch (err) {
    next(err);
  }
};

export const saveHotel = async (req, res, next) => {
  try {
    const { hotelId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(hotelId)) {
      return next(createError(400, "Invalid hotel ID"));
    }

    const hotel = await Hotel.findById(hotelId).select("_id");
    if (!hotel) return next(createError(404, "Hotel not found"));

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { savedHotels: hotelId } },
      { new: true }
    ).populate(
      "savedHotels",
      "name city address photos rating cheapestPrice type distance desc"
    );

    if (!user) return next(createError(404, "User not found"));

    res.status(200).json({ saved: true, savedHotels: user.savedHotels || [] });
  } catch (err) {
    next(err);
  }
};

export const unsaveHotel = async (req, res, next) => {
  try {
    const { hotelId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(hotelId)) {
      return next(createError(400, "Invalid hotel ID"));
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { savedHotels: hotelId } },
      { new: true }
    ).populate(
      "savedHotels",
      "name city address photos rating cheapestPrice type distance desc"
    );

    if (!user) return next(createError(404, "User not found"));

    res.status(200).json({ saved: false, savedHotels: user.savedHotels || [] });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const update = sanitizeAdminUserUpdate(req.body, req.user?.isAdmin);
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: true }
    ).select(publicUserFields);
    if (!updatedUser) return next(createError(404, "User not found"));
    res.status(200).json(updatedUser);
  } catch (err) {
    next(err);
  }
};
export const deleteUser = async (req, res, next) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return next(createError(404, "User not found"));
    res.status(200).json("User has been deleted.");
  } catch (err) {
    next(err);
  }
};
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(publicUserFields);
    if (!user) return next(createError(404, "User not found"));
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select(publicUserFields);
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};
