import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    doctorName: { type: String },
    patientId: { type: String },
    patientName: { type: String },
    patientEmail: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, default: "" },
  },
  { timestamps: true },
);

reviewSchema.index({ doctorId: 1, patientEmail: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);


