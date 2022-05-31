import sendOtp from "./send-otp.js";
import verifyOtp from "./verify-otp.js";
import setPassword from "./set-password.js";
import addPersonalInfo from "./add-personal-info.js";
import addDeliveryLocation from "./add-delivery-location.js";
import login from "./login.js";
import logout from "./logout.js";
import getRiders from "./get-riders.js";
import getUser from "./get-user.js";
import getPendingOrders from "./get-pending-orders.js";
import getNotifications from "./get-notifications.js";
export default {
  paths: {
    "/api/v1/users/otp/phone": {
      ...sendOtp,
    },
    "/api/v1/users/otp/verify": {
      ...verifyOtp,
    },
    "/api/v1/users/set_password": {
      ...setPassword,
    },
    "/api/v1/users/add_personal_info": {
      ...addPersonalInfo,
    },
    "/api/v1/users/add_delivery_location": {
      ...addDeliveryLocation,
    },
    "/api/v1/users/login": {
      ...login,
    },
    "/api/v1/users/logout": {
      ...logout,
    },
    "/api/v1/users/get_user": {
      ...getUser,
    },
    "/api/v1/users/get_riders": {
      ...getRiders,
    },
    "/api/v1/users/get_pending_orders": {
      ...getPendingOrders,
    },
    "/api/v1/users/get_notifications": {
      ...getNotifications,
    },
  },
};
