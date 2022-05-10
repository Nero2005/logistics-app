const userCtrl = require("../controllers/userCtrl");
const authToken = require("./auth");

const userRouter = require("express").Router();

userRouter.route("/api/v1/users").get(authToken, (req, res) => {
  res.send("User test is successful");
});

userRouter.route("/api/v1/users/register").post(userCtrl.register);
userRouter.route("/api/v1/users/login").post(userCtrl.login);
userRouter.route("/api/v1/users/logout").post(userCtrl.logout);

userRouter.route("/api/v1/users/getUser").get(authToken, userCtrl.getUser);

module.exports = userRouter;
