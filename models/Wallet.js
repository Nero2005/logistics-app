const mongoose = require("mongoose");

const walletSchema = mongoose.Schema(
  {
    balance: { type: Number, default: 0 },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
  },
  { collection: "wallet", timestamps: true }
);

module.exports = mongoose.model("wallet", walletSchema);
