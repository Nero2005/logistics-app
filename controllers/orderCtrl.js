import Order from "../models/Order.js";
import got from "got";
import otpGenerator from "otp-generator";
import Package from "../models/Package.js";

const genOrderId = () => {
  return (
    "OO-" +
    otpGenerator.generate(5, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    })
  );
};

const orderCtrl = {
  createOrder: async (req, res) => {
    const { packageId, deliveryLocation } = req.body;
    const userId = req.user.id;
    const orderId = genOrderId();
    const packageOrdered = await Package.findById(packageId);
    const pickupLocation = packageOrdered.location;
    try {
      const newOrder = await Order.create({
        orderId,
        userId,
        packageId,
        pickupLocation,
        deliveryLocation,
      });
      return res.status(201).json({ ...newOrder, status: "successful" });
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  },
  getOrderById: async (orderId) => {
    try {
      const orderReq = await Order.findById(orderId);
      return res.status(200).json({ ...orderReq, status: "successful" });
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  },
  addPackage: async (req, res) => {
    const { packageName, packageDetails, price, location } = req.body;
    try {
      const newPackage = await Package.create({
        packageName,
        packageDetails,
        price,
        location,
      });
      return res.status(201).json({ ...newPackage, status: "successful" });
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  },
};

export default orderCtrl;
