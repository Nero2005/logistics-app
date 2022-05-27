import orderCtrl from "../controllers/orderCtrl.js";
import { authToken, authOTPVerified } from "./auth.js";
import express from "express";
import { authRiderToken } from "./authRider.js";

const orderRouter = express.Router();

orderRouter
  .route("/api/v1/orders/create_order")
  .post(authToken, orderCtrl.createOrder);

orderRouter
  .route("/api/v1/orders/accept_order")
  .post(authRiderToken, orderCtrl.acceptOrder);

orderRouter
  .route("/api/v1/orders/picked_up_order")
  .post(authRiderToken, orderCtrl.pickedUp);

export default orderRouter;
