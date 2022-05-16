import mongoose from "mongoose";

const riderSchema = mongoose.Schema(
  {
    name: { type: String, required: true, default: "To Be Added" },
    email: {
      type: String,
      required: true,
      default: "To Be Added",
      unique: true,
    },
    phone_number: { type: Number, required: true, unique: true },
    password: { type: String, default: "To Be Added", required: true },
    otp_verified: { type: Boolean, default: false, allowNull: true },
    bike_id: { type: mongoose.Schema.Types.ObjectId, ref: "riders" },
  },
  { collection: "riders", timestamps: true }
);

export default mongoose.model("Rider", riderSchema);
