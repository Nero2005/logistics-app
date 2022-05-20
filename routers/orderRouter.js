import orderCtrl from "../controllers/orderCtrl.js";
import { authToken, authOTPVerified } from "./auth.js";

import express from "express";

const orderRouter = express.Router();

orderRouter
  .route("/api/v1/orders/createOrder")
  .post(authToken, orderCtrl.createOrder);

export default orderRouter;
