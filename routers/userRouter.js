const userCtrl = require("../controllers/userCtrl");
const auth = require("./auth");

const router = require("express").Router();

router.route("/api/v1/users").get((req, res) => {
  res.send("User test is successfully");
});

router.route("/api/v1/users/register").post(userCtrl.register);
router.route("/api/v1/users/login").post(userCtrl.login);

module.exports = router;
