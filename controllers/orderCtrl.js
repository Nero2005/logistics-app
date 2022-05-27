import Order from "../models/Order.js";
import got from "got";
import otpGenerator from "otp-generator";
import Package from "../models/Package.js";
import NotificationUser from "../models/NotificationUser.js";
import NotificationRider from "../models/NotificationRider.js";
import User from "../models/User.js";
import LocationCol from "../models/Location.js";
import Rider from "../models/Rider.js";

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

const genPackageId = () => {
  return otpGenerator.generate(10, {
    upperCaseAlphabets: false,
    specialChars: false,
  });
};

const createOrderNotification = async (
  user_id,
  order_id,
  title,
  contentUser,
  contentRider,
  rider_id
) => {
  const userNot = await NotificationUser.create({
    user_id,
    title,
    content: contentUser,
    notification_type: "order",
    order_id,
  });

  const riderNot = await NotificationRider.create({
    rider_id,
    title,
    content: contentRider,
    notification_type: "order",
    order_id,
  });

  return [userNot, riderNot];
};

const orderCtrl = {
  createOrder: async (req, res) => {
    try {
      const { description, packages, price, rider_id } = req.body;
      let { delivery_location } = req.body;

      const user_id = req.user.id;
      const order_id = genOrderId();
      const pickup_locations = [];
      packages.forEach(async (element) => {
        const package_ordered = await Package.findOne({
          package_id: element.package_id,
        });
        const oldQty = package_ordered.quantity;
        package_ordered.quantity = oldQty - element.quantity;
        await package_ordered.save();
        pickup_locations.push(package_ordered.pickup_location);
      });
      const user = await User.findById(user_id);
      if (!user.current_location && !delivery_location) {
        return res
          .status(500)
          .json({ message: "No delivery location specified" });
      } else if (!user.current_location && delivery_location) {
        user.current_location = delivery_location;
      } else if (user.current_location && !delivery_location) {
        delivery_location = user.current_location;
      }
      const newOrder = await Order.create({
        order_id,
        description,
        price,
        user_id,
        rider_id,
        packages,
        pickup_locations,
        delivery_location,
        order_status: "pending",
      });

      const rider = await Rider.findById(rider_id);

      rider.orders.push(newOrder._id);

      createOrderNotification(
        user_id,
        order_id,
        "Order Creation",
        `You have created a new order with order id ${order_id}`,
        `You have received a new order with order id ${order_id}`,
        rider_id
      );
      return res.status(201).json({ ...newOrder, status: "successful" });
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  },
  acceptOrder: async (req, res) => {
    try {
      const { order_id } = req.body;
      const foundOrder = await Order.findOne({ order_id });
      foundOrder.order_status = "pending";
      const rider_id = foundOrder.rider_id;
      const user_id = foundOrder.user_id;
      await foundOrder.save();

      createOrderNotification(
        user_id,
        order_id,
        "Order Accepted",
        `Your order ${order_id} has been accepted`,
        `You have accepted a new order with order id ${order_id}`,
        rider_id
      );
      return res.status(200).json({ message: "order accepted" });
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  },
  declineOrder: async (req, res) => {
    try {
      const { order_id } = req.body;
      const foundOrder = await Order.findOne({ order_id });
      foundOrder.order_status = "pending";
      const rider_id = foundOrder.rider_id;
      foundOrder.rider_id = null;
      const user_id = foundOrder.user_id;
      await foundOrder.save();

      createOrderNotification(
        user_id,
        order_id,
        "Order Declined",
        `Your order ${order_id} has been declined. Please choose another rider`,
        `You have declined order with order id ${order_id}`,
        rider_id
      );
      return res.status(200).json({ message: "order accepted" });
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  },
  changeRider: async (req, res) => {
    try {
      const { order_id, rider_id } = req.body;
      const foundOrder = await Order.findOne({ order_id });
      foundOrder.rider_id = rider_id;
      await foundOrder.save();
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  },
  pickedUp: async (req, res) => {
    try {
      const { order_id } = req.body;
      const foundOrder = await Order.findOne({ order_id });
      foundOrder.picked_up = true;
      await foundOrder.save();
      return res.status(200).json({ message: "order picked up" });
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  },
  incPackageQty: async (req, res) => {
    try {
      const { quantity, package_id } = req.body; // quantity to increase by
      const foundPackage = await Package.findOneAndUpdate(
        { package_id: package_id },
        { $inc: { quantity: quantity } },
        { new: true }
      );
      return res.status(200).json(foundPackage);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  },
  addPackage: async (req, res) => {
    try {
      const { package_name, description, price, pickup_location, quantity } =
        req.body;
      const loc = await LocationCol.create({
        ...pickup_location,
      });
      const package_id = genPackageId();
      const newPackage = await Package.create({
        package_id,
        package_name,
        description,
        price,
        quantity,
        pickup_location: loc._id,
      });
      return res.status(201).json({ ...newPackage, status: "successful" });
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  },
};

export default orderCtrl;
