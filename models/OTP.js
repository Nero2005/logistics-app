const mongoose = require("mongoose");

module.exports = function (DataTypes) {
  return mongoose.model(
    "OTP",
    mongoose.Schema(
      {
        otp: String,
        expiration_time: Date,
        verified: {
          type: Boolean,
          default: false,
          allowNull: true,
        },
      },
      {
        collection: "OTP",
        timestamps: true,
      }
    )
  );
};
