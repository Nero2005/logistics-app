const userCtrl = require("../controllers/userCtrl");
const { authToken, authOTPVerified } = require("./auth");

const userRouter = require("express").Router();

userRouter.route("/api/v1/users").get(authToken, (req, res) => {
  res.send("User test is successful");
});

// userRouter.route("/api/v1/users/register").post(userCtrl.register);
userRouter
  .route("/api/v1/users/set_password")
  .post(authOTPVerified, userCtrl.setPassword);
userRouter
  .route("/api/v1/users/add_personal_info")
  .post(authOTPVerified, userCtrl.addPersonalInfo);
userRouter.route("/api/v1/users/login").post(userCtrl.login);
userRouter.route("/api/v1/users/logout").post(userCtrl.logout);

userRouter.route("/api/v1/users/get_user").get(authToken, userCtrl.getUser);

module.exports = userRouter;
