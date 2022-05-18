import paymentCtrl from "../controllers/paymentCtrl.js";
import { authToken, authOTPVerified } from "./auth.js";

import express from "express";

const paymentRouter = express.Router();

paymentRouter.route("/api/v1/payments/pay").post(authToken, paymentCtrl.pay);

paymentRouter
  .route("/api/v1/payments/confirm")
  .get(authToken, paymentCtrl.confirmPayment);

paymentRouter
  .route("/api/v1/payments/wallet/balance")
  .get(authToken, paymentCtrl.getWalletBalance);

export default paymentRouter;
