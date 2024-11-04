import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import videoRoutes from "./routes/video.js";

dotenv.config();

// express app
const app = express();
const port = process.env.PORT || 5000;

//Middlewares
app.use(cors());
app.use(express.json());

app.use(errorHandler);

app.use("/api/videos", videoRoutes);

//Listen to the requests
app.listen(port, () => {
  //connect to the DB
  connectDB();
  console.log("Server Started listening on port", port);
});
