import express from "express";
import orderCtrl from "../controllers/orderCtrl.js";
import riderCtrl from "../controllers/riderCtrl.js";
import { adminLogin, adminLogout, authAdminToken } from "./authAdmin.js";

const adminRouter = express.Router();

adminRouter.route("/api/v1/admin/login").post(adminLogin);
adminRouter.route("/api/v1/admin/logout").post(adminLogout);

adminRouter
  .route("/api/v1/admin/add_package")
  .post(authAdminToken, orderCtrl.addPackage);
adminRouter
  .route("/api/v1/admin/inc_package_quantity")
  .post(authAdminToken, orderCtrl.incPackageQty);

adminRouter
  .route("/api/v1/admin/get_riders")
  .get(authAdminToken, riderCtrl.getRiders);
adminRouter
  .route("/api/v1/admin/remove_rider")
  .post(authAdminToken, riderCtrl.removeRider);

export default adminRouter;
