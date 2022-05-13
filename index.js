require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path");
const helmet = require("helmet");
const logger = require("morgan");
const cors = require("cors");
const userRouter = require("./routers/userRouter");
const otpRouter = require("./routers/otpRouter");
const paymentRouter = require("./routers/paymentRouter");
const app = express();

const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.LOGISTICS_APP_DB);
    console.log("Database Connection successful");
  } catch (e) {
    console.log(e);
  }
};

let corsOption = {
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
