import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      // required:true,
    },
    videoUrl: {
      type: String,
      // required:true,
    },
    Services: {
      type: String,
    },
    Result: {
      type: String,
    },
    Type: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Video", videoSchema);
