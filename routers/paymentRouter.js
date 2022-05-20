import paymentCtrl from "../controllers/paymentCtrl.js";
import { authToken, authOTPVerified } from "./auth.js";

import express from "express";

const paymentRouter = express.Router();

paymentRouter
  .route("/api/v1/payments/fund_wallet/pay")
  .post(authToken, paymentCtrl.payFundWallet);

paymentRouter
  .route("/api/v1/payments/fund_wallet/confirm")
  .get(authToken, paymentCtrl.confirmFundWalletPayment);

paymentRouter
  .route("/api/v1/payments/wallet/balance")
  .get(authToken, paymentCtrl.getWalletBalance);

export default paymentRouter;
