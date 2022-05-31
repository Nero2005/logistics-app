import userCtrl from "../controllers/userCtrl.js";
import otpCtrl from "../controllers/otpCtrl.js";
import { authToken, authOTPVerified } from "./auth.js";

import express from "express";

const userRouter = express.Router();

userRouter.route("/api/v1/users/otp/phone").post(otpCtrl.otpPhone);
userRouter.route("/api/v1/users/otp/verify").post(otpCtrl.verifyOtp);
userRouter
  .route("/api/v1/users/set_password")
  .post(authToken, userCtrl.setPassword);
userRouter
  .route("/api/v1/users/add_personal_info")
  .post(authToken, userCtrl.addPersonalInfo);
userRouter
  .route("/api/v1/users/add_delivery_location")
  .post(authToken, userCtrl.addDeliveryLocation);
userRouter.route("/api/v1/users/login").post(userCtrl.login);
userRouter.route("/api/v1/users/logout").post(userCtrl.logout);

userRouter.route("/api/v1/users/get_user").get(authToken, userCtrl.getUser);

userRouter
  .route("/api/v1/users/get_pending_orders")
  .get(authToken, userCtrl.getPendingOrders);

userRouter
  .route("/api/v1/users/get_notifications")
  .get(authToken, userCtrl.getNotifications);

export default userRouter;
