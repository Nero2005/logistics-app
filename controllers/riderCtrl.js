import Rider from "../models/Rider.js";
import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";
import Order from "../models/Order.js";
import Company from "../models/Company.js";
import NotificationRider from "../models/NotificationRider.js";
import LocationCol from "../models/Location.js";
import PhoneNumber from "../models/PhoneNumber.js";

const riderCtrl = {
  setPassword: async (req, res) => {
    const phone_number = req.body.phone_number;
    const foundNumber = await PhoneNumber.findOne({
      number: parseInt(phone_number.toString().substring(3)),
    });
    const foundRider = await Rider.findOne({
      phone_number: foundNumber._id,
    });
    if (!foundRider.password) {
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
    const { first_name, last_name, email, phone_number } = req.body;
    const foundNumber = await PhoneNumber.findOne({
      number: parseInt(phone_number.toString().substring(3)),
    });
    const foundRider = await Rider.findOne({
      phone_number: foundNumber._id,
    });
    foundRider.first_name = first_name;
    foundRider.last_name = last_name;
    foundRider.email = email;

    await foundRider.save();

    res.status(200).json({
      first_name,
      last_name,
      email,
      phone_number,
      message: "Personal Info added successfully",
    });
  },
  addBikeDetails: async (req, res) => {
    const { vehicle_type, plate_number, phone_number } = req.body;
    const foundNumber = await PhoneNumber.findOne({
      number: parseInt(phone_number.toString().substring(3)),
    });
    const foundRider = await Rider.findOne({
      phone_number: foundNumber._id,
    });
    foundRider.vehicle_type = vehicle_type;
    foundRider.plate_number = plate_number;

    await foundRider.save();

    const admin = await Company.findOne();
    if (admin.riders.indexOf(foundRider._id) > -1) {
      admin.riders.push(foundRider._id);
    }

    res.status(200).json({
      vehicle_type,
      plate_number,
      phone_number,
      message: "Bike details added successfully",
    });
  },
  addDeliveryLocation: async (req, res) => {
    const { location_id, name, longitude, latitude, phone_number } = req.body;
    const type = "delivery";
    const foundNumber = await PhoneNumber.findOne({
      number: parseInt(phone_number.toString().substring(3)),
    });
    const foundRider = await Rider.findOne({
      phone_number: foundNumber._id,
    });
    const loc = await LocationCol.create({
      location_id,
      name,
      longitude,
      latitude,
    });
    foundRider.current_location = loc._id;
    await foundRider.save();

    res.status(200).json({
      location_id,
      name,
      longitude,
      latitude,
      message: "Delivery Location added successfully",
    });
  },
  setStatus: async (req, res) => {
    try {
      const { rider_status, phone_number } = req.body;
      const foundNumber = await PhoneNumber.findOne({
        number: parseInt(phone_number.toString().substring(3)),
      });
      const foundRider = await Rider.findOne({
        phone_number: foundNumber._id,
      });
      foundRider.active = rider_status;
      await foundRider.save();
      const admin = await Company.findOne();
      if (admin.riders.indexOf(foundRider._id) > -1) {
        admin.riders.push(foundRider._id);
      }
      const index = admin.active_riders.indexOf(foundRider._id);
      if (index > -1 && rider_status) {
        admin.active_riders.push(foundRider._id);
      } else if (!rider_status && index > -1) {
        admin.active_riders.splice(index, 1);
      }
      res.status(200).json({
        message: `Status set successfully to ${
          rider_status ? "active" : "inactive"
        }`,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
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
    // const admin = await Company.findOne();
    // admin.riders.push(foundRider._id);
    console.log(others);
    res.status(200).json(others);
  },
  getPendingOrders: async (req, res) => {
    const pendingOrders = await Order.find({
      order_status: "pending",
      rider_id: req.user.id,
    });
    res.status(200).json(pendingOrders);
  },
  getRiders: async (req, res) => {
    const riders = await Rider.find({ active: true });
    res.status(200).json(riders);
  },
  removeRider: async (req, res) => {
    const { rider_id } = req.body;
    const deletedRider = Rider.findOneAndDelete({ _id: rider_id });
    res
      .status(200)
      .json({ ...deletedRider, message: "Rider removed successfully" });
  },
  getNotifications: async (req, res) => {
    const riderNots = await NotificationRider.find();
    res.status(200).json(riderNots);
  },
};

export default riderCtrl;
