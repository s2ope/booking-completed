import express from "express";
import {
  getMe,
  updateMe,
  getSavedHotels,
  saveHotel,
  unsaveHotel,
  updateUser,
  deleteUser,
  getUser,
  getUsers,
} from "../controllers/user.controllers.js";
import { verifyAdmin, verifyToken, verifyUser } from "../utils/verifyToken.js";

const router = express.Router();

// router.get("/checkauthentication", verifyToken, (req,res,next)=>{
//     res.send("hello user, you are logged in")
// })

// router.get("/checkuser/:id", verifyUser, (req,res,next)=>{
//     res.send("hello user, you are logged in and you can delete your account")
// })

// router.get("/checkadmin/:id", verifyAdmin, (req,res,next)=>{
//     res.send("hello admin, you are logged in and you can delete all accounts")
// })

// CURRENT USER
router.get("/me", verifyToken, getMe);
router.put("/me", verifyToken, updateMe);
router.get("/me/saved", verifyToken, getSavedHotels);
router.post("/me/saved/:hotelId", verifyToken, saveHotel);
router.delete("/me/saved/:hotelId", verifyToken, unsaveHotel);

//UPDATE
router.put("/:id", verifyUser, updateUser);
//DELETE
router.delete("/:id", verifyUser, deleteUser);
//GET
router.get("/:id", verifyUser, getUser);
//GET ALL
router.get("/", verifyAdmin, getUsers);

export default router;
