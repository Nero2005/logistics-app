import mongoose from "mongoose";

const bikeSchema = mongoose.Schema(
  {
    name: { type: String, required: true, default: "To Be Added" },
    rider_id: { type: mongoose.Schema.Types.ObjectId, ref: "riders" },
  },
  { collection: "bikes", timestamps: true }
);

export default mongoose.model("Bike", bikeSchema);
