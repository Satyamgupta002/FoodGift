import Donor from "../models/donorModel.js";
import Receiver from "../models/receiverModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

export const registerUser = async (req, res) => {
  const { name, phoneNumber, email, password, role, location } = req.body;

  try {
    /* ---------- ENV CHECK ---------- */
    if (!ACCESS_TOKEN_SECRET) {
      return res.status(500).json({
        message: "Server misconfiguration: ACCESS_TOKEN_SECRET missing",
      });
    }

    /* ---------- DUPLICATE USER CHECK ---------- */
    const existingUser =
      role === "donor"
        ? await Donor.findOne({ email })
        : await Receiver.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    /* ---------- PASSWORD HASH ---------- */
    const hashedPassword = await bcrypt.hash(password, 10);
    let newUser;

    /* ---------- DONOR REGISTRATION ---------- */
    if (role === "donor") {
      newUser = await Donor.create({
        name,
        phoneNumber,
        email,
        password: hashedPassword,
      });
    }

    /* ---------- RECEIVER REGISTRATION ---------- */
    else {
      if (!location) {
        return res
          .status(400)
          .json({ message: "Address is required for receivers" });
      }


     const geoRes = await axios.get(
  "https://api.opencagedata.com/geocode/v1/json",
  {
    params: {
      key: process.env.OPENCAGE_API_KEY,
      q: location,
      limit: 1,
    },
  }
);

if (!geoRes.data.results || geoRes.data.results.length === 0) {
  throw new Error("Could not geocode address");
}

const { lat, lng } = geoRes.data.results[0].geometry;


  

      newUser = await Receiver.create({
        name,
        phoneNumber,
        email,
        password: hashedPassword,
        location: {
          address: location,
          lattitude: lat.toString(),
          longitude: lng.toString(),
        },
      });
    }

    /* ---------- JWT TOKEN ---------- */
    const token = jwt.sign(
      { id: newUser._id, role },
      ACCESS_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    /* ---------- RESPONSE ---------- */
    res.status(201).json({
      message: "Registration successful",
      user: newUser,
      token,
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const user =
      role === "donor"
        ? await Donor.findOne({ email })
        : await Receiver.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role }, ACCESS_TOKEN_SECRET, {
      expiresIn: "7d",
    });
    res.status(200).json({ user, token });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};
