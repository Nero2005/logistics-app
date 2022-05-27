import otpCtrl from "../controllers/otpCtrl.js";

import express from "express";

const otpRouter = express.Router();

// otpRouter.route("/api/v1/email/otp").post(otpCtrl.otpEmail);

otpRouter.route("/api/v1/phone/otp").post(otpCtrl.otpPhone);

otpRouter.route("/api/v1/verify/otp").post(otpCtrl.verifyOtp);

export default otpRouter;
