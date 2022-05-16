import Rider from "../models/Rider.js";
import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";

const riderCtrl = {
  setPassword: async (req, res) => {
    const phone_number = req.body.phone_number;
    const foundRider = await Rider.findOne({ phone_number: phone_number });
    if (foundRider.password === "To Be Added") {
      foundRider.password = CryptoJS.AES.encrypt(
        req.body.password,
        process.env.SECRET_PASSPHRASE
      ).toString();

      await foundRider.save();

      const accessToken = jwt.sign(
        {
          id: foundRider._id,
          isRider: true,
        },
        process.env.JWT_SECRET,
        { expiresIn: "3d" }
      );
      res.cookie("riderToken", accessToken, {
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
    const { username, email, phone_number } = req.body;
    const foundRider = await Rider.findOne({ phone_number: phone_number });
    foundRider.username = username;
    foundRider.email = email;

    await foundUser.save();

    res.status(200).json({
      username,
      email,
      phone_number,
      message: "Personal Info added successfully",
    });
  },
  login: async (req, res) => {
    try {
      const rider = await Rider.findOne({ email: req.body.email });
      if (!rider) res.status(401).json("Wrong credentials");
      const hashedPassword = CryptoJS.AES.decrypt(
        rider.password,
        process.env.SECRET_PASSPHRASE
      );
      const psw = hashedPassword.toString(CryptoJS.enc.Utf8);
      const accessToken = jwt.sign(
        {
          id: rider._id,
          isRider: true,
        },
        process.env.JWT_SECRET,
        { expiresIn: "3d" }
      );
      res.cookie("riderToken", accessToken, {
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
    res.clearCookie("riderToken");
    res.json("Successfully logged out");
  },
  getRider: async (req, res) => {
    let foundRider;
    if (req.user) {
      foundRider = await Rider.findById(req.user.id);
    }
    if (!foundRider) return res.status(404).json("Rider not found!");
    const { password, createdAt, updatedAt, ...others } = foundRider._doc;
    console.log(others);
    res.status(200).json(others);
  },
};

export default riderCtrl;
