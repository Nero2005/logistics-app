const otpCtrl = require("../controllers/otpCtrl");

const otpRouter = require("express").Router();

otpRouter.route("/api/v1/email/otp").post(otpCtrl.otpEmail);

// otpRouter.route("/api/v1/phone/otp").post(otpCtrl.otpPhone);

otpRouter.route("/api/v1/verify/otp").post(otpCtrl.verifyOtp);

module.exports = otpRouter;
