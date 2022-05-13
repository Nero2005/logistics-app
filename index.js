import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import path from "path";
import helmet from "helmet";
import logger from "morgan";
import cors from "cors";
import userRouter from "./routers/userRouter.js";
import otpRouter from "./routers/otpRouter.js";
import paymentRouter from "./routers/paymentRouter.js";

const app = express();

const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.LOGISTICS_APP_DB);
    console.log("Database Connection successful");
  } catch (e) {
    console.log(e);
  }
};

const corsOption = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  exposedHeaders: ["x-auth-token"],
};

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOption));
app.use(helmet());
app.use(logger("common"));
app.use(userRouter);
app.use(otpRouter);
app.use(paymentRouter);

const PORT = 5000 || process.env.PORT;

app.listen(PORT, () => {
  dbConnection();
  console.log(`Server listening on port ${PORT}`);
});
