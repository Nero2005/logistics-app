import User from "../models/User.js";
import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";

const userCtrl = {
  setPassword: async (req, res) => {
    const phone_number = req.body.phone_number;
    const foundUser = await User.findOne({ phone_number: phone_number });
    if (foundUser.password === "To Be Added") {
      foundUser.password = CryptoJS.AES.encrypt(
        req.body.password,
        process.env.SECRET_PASSPHRASE
      ).toString();

      await foundUser.save();

      const accessToken = jwt.sign(
        {
          id: foundUser._id,
        },
        process.env.JWT_SECRET,
        { expiresIn: "3d" }
      );
      res.cookie("userToken", accessToken, {
        maxAge: 3 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      return res.status(201).json({ accessToken });
    } else {
      return res
        .status(400)
        .json({ Message: "You have already set the password" });
    }
  },
  addPersonalInfo: async (req, res) => {
    const { username, email } = req.body;
    const phone_number = req.body.phone_number;
    const foundUser = await User.findOne({ phone_number: phone_number });
    foundUser.username = username;
    foundUser.email = email;

    await foundUser.save();

    res
      .status(200)
      .json({
        username,
        email,
        phone_number,
        message: "Personal Info added successfully",
      });
  },
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
      const accessToken = jwt.sign(
        {
          id: savedUser._id,
        },
        process.env.JWT_SECRET,
        { expiresIn: "3d" }
      );
      res.cookie("userToken", accessToken, {
        maxAge: 3 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      // const { password, ...others } = savedUser._doc;
      res.status(201).json({ accessToken });
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
      const accessToken = jwt.sign(
        {
          id: user._id,
        },
        process.env.JWT_SECRET,
        { expiresIn: "3d" }
      );
      res.cookie("userToken", accessToken, {
        maxAge: 3 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      // const { password, ...others } = user._doc;
      if (psw !== req.body.password) res.status(401).json("Wrong password");
      else res.status(200).json({ accessToken });
    } catch (e) {
      console.log(e);
      res.status(500).json(e);
    }
  },
  logout: (req, res) => {
    res.clearCookie("userToken");
    res.json("Successfully logged out");
  },
  getUser: async (req, res) => {
    let foundUser;
    if (req.user) {
      foundUser = await User.findById(req.user.id);
    }
    if (!foundUser) return res.status(404).json("User not found!");
    const { password, createdAt, updatedAt, ...others } = foundUser._doc;
    console.log(others);
    res.status(200).json(others);
  },
};

export default userCtrl;
