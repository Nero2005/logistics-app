import got from "got";
import otpGenerator from "otp-generator";
import User from "../models/User.js";
import Wallet from "../models/Wallet.js";
import WalletTransaction from "../models/WalletTransaction.js";
import Transaction from "../models/Transaction.js";

const genTxRef = (len) => {
  return (
    "tx-" +
    otpGenerator.generate(17, {
      upperCaseAlphabets: false,
      specialChars: false,
    })
  );
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
  if (transactionExist) {
    return res.status(409).json("Transaction Already Exists");
  } else {
    return null;
  }
};

const confirmFundWallet = async (transaction_id) => {
  const url = `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`;

  if (transactionAlreadyExists(transaction_id)) {
    return transactionAlreadyExists(transaction_id);
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

  const user = await User.findOne({ email: customer.email });
  // user, id, status, currency, amount, customer
  const wallet = await fundWallet(user, id, status, currency, amount, customer);

  return res.status(200).json({
    response: "Wallet funded successfully",
    data: wallet,
  });
};

const paymentCtrl = {
  pay: async (req, res) => {
    const { amount, currency, email, phone_number, name } = req.body;
    try {
      const response = await got
        .post("https://api.flutterwave.com/v3/payments", {
          headers: {
            Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
          },
          json: {
            tx_ref: genTxRef(),
            amount: amount,
            currency: currency,
            redirect_url: "http://localhost:5000/api/v1/payments/confirm",
            customer: {
              email: email,
              phonenumber: phone_number,
              name: name,
            },
            customizations: {
              title: "Logistics App Payments",
            },
          },
        })
        .json();
      console.log(response);
      res.json(response);
      // res.redirect(response.data.link);
    } catch (err) {
      console.log(err.code);
      console.log(err.response.body);
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
    }
  },
  confirmPayment: async (req, res) => {
    const { transaction_id } = req.query;

    return confirmFundWallet(transaction_id);
  },
};

export default paymentCtrl;
