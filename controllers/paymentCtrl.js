import got from "got";
import otpGenerator from "otp-generator";
import User from "../models/User.js";
import Wallet from "../models/Wallet.js";
import WalletTransaction from "../models/WalletTransaction.js";
import Transaction from "../models/Transaction.js";
import Order from "../models/Order.js";

const genTxRef = () => {
  return (
    "tx-" +
    otpGenerator.generate(17, {
      upperCaseAlphabets: false,
      specialChars: false,
    })
  );
};

const genTxId = () => {
  return otpGenerator.generate(7, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
};

const validateUserWallet = async (userId) => {
  try {
    const userWallet = await Wallet.findOne({ userId });

    if (!userWallet) {
      const wallet = await Wallet.create({ userId });
      return wallet;
    }
    return userWallet;
  } catch (err) {
    console.log(err);
  }
};

const createWalletTransaction = async (userId, status, currency, amount) => {
  try {
    const walletTransaction = await WalletTransaction.create({
      amount,
      userId,
      isInFlow: true,
      currency,
      status,
    });
    return walletTransaction;
  } catch (err) {
    console.log(err);
  }
};

const createTransaction = async (
  userId,
  id,
  status,
  currency,
  amount,
  customer
) => {
  try {
    const transaction = await Transaction.create({
      userId,
      transactionId: id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone_number,
      amount,
      currency,
      paymentStatus: status,
      paymentGateway: "flutterwave",
    });
    return transaction;
  } catch (err) {
    console.log(err);
  }
};

const updateWallet = async (userId, amount) => {
  try {
    const wallet = await Wallet.findOneAndUpdate(
      { userId },
      { $inc: { balance: amount } },
      { new: true }
    );
    return wallet;
  } catch (err) {
    console.log(err);
  }
};

const fundWallet = async (user, id, status, currency, amount, customer) => {
  const wallet = await validateUserWallet(user._id);
  await createWalletTransaction(user._id, status, currency, amount);
  await createTransaction(user._id, id, status, currency, amount, customer);
  const updatedWallet = await updateWallet(user._id, amount);
  return updatedWallet;
};

const transactionAlreadyExists = async (transaction_id) => {
  const transactionExist = await Transaction.findOne({
    transactionId: transaction_id,
  });
  return transactionExist ? true : false;
};

const confirmPayment = async (transaction_id) => {
  const url = `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`;

  if (transactionAlreadyExists(transaction_id)) {
    return res.status(409).json("Transaction Already Exists");
  }

  const response = await got
    .get(url, {
      headers: {
        Authorization: `${process.env.FLW_SECRET_KEY}`,
      },
    })
    .json();
  console.log(response.data);
  // res.json("Testing")
  const { status, currency, id, amount, customer } = response.data;

  console.log(id);

  return response.data;
};

const getPaymentLink = async (amount, currency, email, phone_number, name) => {
  try {
    const response = await got
      .post("https://api.flutterwave.com/v3/payments", {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
        },
        json: {
          tx_ref: genTxRef(),
          amount,
          currency,
          redirect_url,
          customer: {
            email,
            phonenumber: phone_number,
            name,
          },
          customizations: {
            title: "Ocius Lite Payments",
          },
        },
      })
      .json();
    console.log(response);
    return response;
    // res.redirect(response.data.link);
  } catch (err) {
    console.log(err.code);
    console.log(err.response.body);
    return err;
  }
};

const createNotification = async (
  user_id,
  order_id,
  title,
  contentUser,
  contentRider,
  notification_type,
  rider_id
) => {
  if (!order_id) order_id = "N/A";
  const userNot = await NotificationUser.create({
    user_id,
    title,
    content: contentUser,
    notification_type,
    order_id,
  });

  const riderNot = await NotificationRider.create({
    rider_id,
    title,
    content: contentRider,
    notification_type,
    order_id,
  });

  return [userNot, riderNot];
};

const paymentCtrl = {
  payFundWallet: async (req, res) => {
    try {
      const { amount, currency, email, phone_number, name } = req.body;
      const redirect_url = `${process.env.SERVER_HOST}/api/v1/payments/fund_wallet/confirm`;
      const response = getPaymentLink(
        amount,
        currency,
        email,
        phone_number,
        name,
        redirect_url
      );
      res.json(response);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  },
  payWithCard: async (req, res) => {
    try {
      const { order_id, currency, email, phone_number, name } = req.body;
      const order = await Order.findOne({ order_id: order_id });
      const amount = order.price;
      const redirect_url = `${process.env.SERVER_HOST}/api/v1/payments/with_card/confirm`;
      const response = getPaymentLink(
        amount,
        currency,
        email,
        phone_number,
        name,
        redirect_url
      );
      res.json(response);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  },
  payWithWallet: async (req, res) => {
    try {
      const { order_id, currency, email, phone_number, name } = req.body;
      const order = await Order.findOne({ order_id: order_id });
      const amount = order.price;
      const userId = req.user.id;
      const wallet = await Wallet.findOne({ userId });
      const balance = wallet.balance;
      if (amount > balance) {
        await createTransaction(
          userId,
          genTxId(),
          "failed",
          currency,
          amount,
          customer
        );
        return res.status(500).json({ message: "Wallet funds insufficient" });
      }
      const customer = { name, email, phone_number };
      const transaction_details = {
        customer,
        order_id,
        currency,
        transaction_id: genTxId(),
      };
      return res.redirect(
        `${process.env.SERVER_HOST}/api/v1/payments/with_wallet/confirm?transaction_details=${transaction_details}`
      );
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  },
  confirmPaymentWithWallet: async (req, res) => {
    try {
      const { transaction_details } = req.query;
      const { customer, order_id, currency, transaction_id } =
        transaction_details;
      const order = await Order.findOne({ order_id: order_id });
      const amount = order.price;

      if (transactionAlreadyExists(transaction_id)) {
        return res.status(409).json("Transaction Already Exists");
      }
      const userId = req.user.id;

      await createTransaction(
        userId,
        transaction_id,
        "successful",
        currency,
        amount,
        customer
      );

      const wallet = await Wallet.findOne({ userId });
      wallet.balance = wallet.balance - amount;
      if (!order.paid) order.paid = true;
      await order.save();
      await wallet.save();
      createNotification(
        userId,
        order_id,
        `Payment Complete`,
        `You have paid for order ${order_id} with wallet`,
        `The user has paid for order ${order_id}`,
        "order payment",
        order.rider_id
      );
      return res.status(200).json({ message: "Payment successful" });
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  },
  getWalletBalance: async (req, res) => {
    try {
      const userId = req.user.id;
      const wallet = await Wallet.findOne({ userId });
      console.log(wallet);
      res.status(200).json(wallet.balance);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  },
  confirmPaymentWithCard: async (req, res) => {
    try {
      const { transaction_id } = req.query;
      const { status, currency, id, amount, customer } =
        confirmPayment(transaction_id);
      const user = await User.findOne({ email: customer.email });
      await createTransaction(user._id, id, status, currency, amount, customer);
      const transaction = await Transaction.findOne({
        transactionId: id,
      })
      createNotification(
        user._id,
        transaction.orderId,
        `Payment Complete`,
        `You have paid for order ${order_id} with card`,
        `The user has paid for order ${order_id}`,
        "order payment",
        order.rider_id
      );
      return res.status(200).json({
        response: "Payment successful",
      });
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  },
  confirmFundWalletPayment: async (req, res) => {
    try {
      const { transaction_id } = req.query;

      const { status, currency, id, amount, customer } =
        confirmPayment(transaction_id);
      const user = await User.findOne({ email: customer.email });
      // user, id, status, currency, amount, customer
      const wallet = await fundWallet(
        user,
        id,
        status,
        currency,
        amount,
        customer
      );

      const transaction = await Transaction.findOne({
        transactionId: id,
      });

      createNotification(
        user._id,
        transaction.orderId,
        `Payment Complete`,
        `You have paid for order ${order_id} with card`,
        `The user has paid for order ${order_id}`,
        "order payment",
        order.rider_id
      );

      return res.status(200).json({
        response: "Wallet funded successfully",
        data: wallet,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  },
};

export default paymentCtrl;
