import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import path from "path";

import authRouter from "./routes/authRoutes.js";
import donorRouter from "./routes/donorRoutes.js";
import receiverRouter from "./routes/receiverRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;
const rootDir = path.resolve("../");

/* ---------- MIDDLEWARE ---------- */
// app.use(cors({
//   origin: "http://localhost:5173",
//   credentials: true
// }));
app.use(cors({
  origin: true,
  credentials: true
}));


app.use(express.json());

/* ---------- ROUTES ---------- */
app.use("/api/auth", authRouter);
app.use("/api/donor", donorRouter);
app.use("/api/receiver", receiverRouter);

/* ---------- FRONTEND (PROD) ---------- */
app.use(express.static(path.join(rootDir, "frontend", "dist")));

app.get(/^(?!\/api).*/, (_, res) => {
  res.sendFile(
    path.join(rootDir, "frontend", "dist", "index.html")
  );
});



/* ---------- DB ---------- */
const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Error:", err.message);
    process.exit(1);
  }
};

/* ---------- START SERVER ---------- */
await connectDb();
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
