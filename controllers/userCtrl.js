const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

const userCtrl = {
  register: async (req, res) => {
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      phone_number: req.body.phone_number,
      password: CryptoJS.AES.encrypt(
        req.body.password,
        process.env.SECRET_PASSPHRASE
      ).toString(),
    });

    try {
      const savedUser = await newUser.save();
      res.status(201).json(savedUser);
    } catch (e) {
      console.log(e);
      res.status(500).json(e);
    }
  },
  login: async (req, res) => {
    try {
      const user = await User.findOne({ username: req.body.username });
      if (!user) res.status(401).json("Wrong credentials");
      const hashedPassword = CryptoJS.AES.decrypt(
        user.password,
        process.env.SECRET_PASSPHRASE
      );
      const psw = hashedPassword.toString(CryptoJS.enc.Utf8);
      const { password, ...others } = user._doc;
      if (psw !== req.body.password) res.status(401).json("Wrong password");
      else res.status(200).json(others);
    } catch (e) {
      console.log(e);
      res.status(500).json(e);
    }
  },
};

module.exports = userCtrl;
