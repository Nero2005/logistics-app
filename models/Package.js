import mongoose from "mongoose";

const packageSchema = mongoose.Schema(
  {
    packageName: {
      type: String,
      required: true,
    },
    packageDetails: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
  },
  { collection: "packages", timestamps: true }
);

export default mongoose.model("Package", packageSchema);
