import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../src/models/User.js";

dotenv.config();

const adminUser = {
  username: process.env.SEED_ADMIN_USERNAME || "admin_test",
  email: process.env.SEED_ADMIN_EMAIL || "admin.test@mamabooking.local",
  password: process.env.SEED_ADMIN_PASSWORD || "Admin@12345",
  city: process.env.SEED_ADMIN_CITY || "Kathmandu",
  country: process.env.SEED_ADMIN_COUNTRY || "Nepal",
};

const run = async () => {
  if (!process.env.MONGO) {
    throw new Error("Missing MONGO connection string.");
  }

  await mongoose.connect(process.env.MONGO, { family: 4 });

  const existingByUsername = await User.findOne({ username: adminUser.username });
  const existingByEmail = await User.findOne({ email: adminUser.email });

  if (
    existingByUsername &&
    existingByEmail &&
    String(existingByUsername._id) !== String(existingByEmail._id)
  ) {
    throw new Error(
      "Seed admin username and email belong to different users. Resolve the conflict in MongoDB first."
    );
  }

  const password = bcrypt.hashSync(adminUser.password, bcrypt.genSaltSync(10));
  const user = existingByUsername || existingByEmail || new User();

  user.username = adminUser.username;
  user.email = adminUser.email;
  user.password = password;
  user.city = adminUser.city;
  user.country = adminUser.country;
  user.isAdmin = true;
  user.isEmailVerified = true;

  await user.save();

  console.log("Admin test user is ready:");
  console.log(`username: ${adminUser.username}`);
  console.log(`password: ${adminUser.password}`);
};

run()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
