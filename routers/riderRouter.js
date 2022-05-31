import express from "express";
import riderCtrl from "../controllers/riderCtrl.js";
import otpCtrl from "../controllers/otpCtrl.js";
import { authToken } from "./auth.js";
import { authRiderOTPVerified, authRiderToken } from "./authRider.js";

const riderRouter = express.Router();

riderRouter.route("/api/v1/riders/otp/phone").post(otpCtrl.otpPhone);
riderRouter.route("/api/v1/riders/otp/verify").post(otpCtrl.verifyOtp);

riderRouter
  .route("/api/v1/riders/set_password")
  .post(authRiderToken, riderCtrl.setPassword);

riderRouter
  .route("/api/v1/riders/add_personal_info")
  .post(authRiderToken, riderCtrl.addPersonalInfo);
riderRouter
  .route("/api/v1/riders/add_bike_details")
  .post(authRiderToken, riderCtrl.addBikeDetails);

riderRouter
  .route("/api/v1/riders/add_current_location")
  .post(authRiderToken, riderCtrl.addDeliveryLocation);

riderRouter
  .route("/api/v1/riders/set_status")
  .post(authRiderToken, riderCtrl.setStatus);
riderRouter.route("/api/v1/riders/login").post(riderCtrl.login);
riderRouter.route("/api/v1/riders/logout").post(riderCtrl.logout);

riderRouter
  .route("/api/v1/riders/get_rider")
  .get(authRiderToken, riderCtrl.getRider);

riderRouter
  .route("/api/v1/users/get_riders")
  .get(authToken, riderCtrl.getRiders);

riderRouter
  .route("/api/v1/riders/get_pending_orders")
  .get(authRiderToken, riderCtrl.getPendingOrders);

riderRouter
  .route("/api/v1/riders/get_notifications")
  .get(authRiderToken, riderCtrl.getNotifications);

export default riderRouter;
