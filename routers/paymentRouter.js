const paymentCtrl = require("../controllers/paymentCtrl");
const { authToken, authOTPVerified } = require("./auth");

const paymentRouter = require("express").Router();

paymentRouter.route("/api/v1/payments/pay").post(authToken, paymentCtrl.pay);

module.exports = paymentRouter;
