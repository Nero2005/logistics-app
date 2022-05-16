import express from "express";
import riderCtrl from "../controllers/riderCtrl.js";
import { authRiderOTPVerified, authRiderToken } from "./authRider.js";

const riderRouter = express.Router();

riderRouter
  .route("/api/v1/riders/set_password")
  .post(authRiderOTPVerified, riderCtrl.setPassword);

riderRouter
  .route("/api/v1/riders/add_personal_info")
  .post(authRiderOTPVerified, riderCtrl.addPersonalInfo);
riderRouter.route("/api/v1/riders/login").post(riderCtrl.login);
riderRouter.route("/api/v1/riders/logout").post(riderCtrl.logout);

riderRouter
  .route("/api/v1/riders/get_user")
  .get(authRiderToken, riderCtrl.getRider);

export default riderRouter;
