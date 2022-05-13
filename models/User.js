const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    username: { type: String, required: true, default: "To Be Added", unique: true },
    email: { type: String, required: true, default: "To Be Added", unique: true },
    phone_number: { type: Number, required: true, unique: true },
    password: { type: String, default: "To Be Added", required: true },
    otp_verified: { type: Boolean, default: false, allowNull: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
