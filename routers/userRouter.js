const userCtrl = require("../controllers/userCtrl");
const auth = require("./auth");
const authToken = require("./auth");

const router = require("express").Router();

router.route("/api/v1/users").get(authToken, (req, res) => {
  res.send("User test is successful");
});

router.route("/api/v1/users/register").post(userCtrl.register);
router.route("/api/v1/users/login").post(userCtrl.login);
router.route("/api/v1/users/logout").post(userCtrl.logout);

module.exports = router;
