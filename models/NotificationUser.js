import mongoose from "mongoose";

const notificationUserSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    notification_type: {
      type: String,
    },
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "orders",
    },
  },
  { collection: "notifications_user", timestamps: true }
);

export default mongoose.model("NotificationUser", notificationUserSchema);
