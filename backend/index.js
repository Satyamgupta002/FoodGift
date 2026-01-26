import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import authRouter from "./routes/authRoutes.js";
import donorRouter from "./routes/donorRoutes.js";
import receiverRouter from "./routes/receiverRoutes.js";
import path from "path";
const app = express();
const PORT = process.env.PORT || 4000;
const _dirname = path.resolve();


app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
// app.use(cors(corsOptions));
app.use(express.json());


app.use("/api/auth", authRouter);
app.use("/api/donor", donorRouter);
app.use("/api/receiver", receiverRouter);
app.listen(PORT, () => {
  console.log(`Serving on port :${PORT}`);
  connectDb();
});

app.use(express.static(path.join(_dirname, "/frontend/dist")));
app.get('/', (_,res)=>{
  res.sendFile(path.resolve(_dirname, "frontend", "dist", "index.html"));
});

export const connectDb = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log("✅ MongoDB Connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};
