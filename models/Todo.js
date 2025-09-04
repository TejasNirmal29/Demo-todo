import mongoose from "mongoose";

const todoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "done", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Todo", todoSchema);
