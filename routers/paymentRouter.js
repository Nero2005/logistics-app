import paymentCtrl from "../controllers/paymentCtrl.js";
import { authToken, authOTPVerified } from "./auth.js";

import express from "express";

const paymentRouter = express.Router();


paymentRouter.route("/api/v1/payments/pay").post(authToken, paymentCtrl.pay);

export default paymentRouter;
