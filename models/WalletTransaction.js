const mongoose = require("mongoose");

const walletTransactionSchema = mongoose.Schema(
  {
    amount: { type: Number, default: 0 },
    userId: {
      type: String,
      ref: "users",
      required: true,
    },
    isInFlow: { type: Boolean },
    paymentMethod: { type: String, default: "flutterwave" },
    currency: {
      type: String,
      required: [true, "Currency is required"],
      enum: ["NGN", "USD", "EUR", "GBP"],
    },
    status: {
      type: String,
      required: [true, "Payment status is required"],
      enum: ["successful", "pending", "failed"],
    },
  },
  { collection: "walletTransaction", timestamps: true }
);

module.exports = mongoose.model("walletTransaction", walletTransactionSchema);
