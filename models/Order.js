import mongoose from "mongoose";
import { stringify } from "uuid";

const orderSchema = mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "packages",
    },
    orderStatus: {
      type: String,
      enum: ["delivered", "confirmed", "picked up"],
    },
    pickupLocation: {
      type: String,
    },
    deliveryLocation: {
      type: String,
    },
  },
  { collection: "orders", timestamps: true }
);

export default mongoose.model("Order", orderSchema);
