import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  appointment: {
    date: { type: String, required: true },
    time: { type: String, required: true },
    note: { type: String },
  },
  status: { type: String, enum: ["pending", "accepted", "cancelled"], default: "pending" },
}, { timestamps: true });

export default mongoose.model("Booking", bookingSchema);
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  appointment: {
    date: { type: String, required: true },
    time: { type: String, required: true },
    note: { type: String },
  },
  status: { type: String, enum: ["pending", "accepted", "cancelled"], default: "pending" },
}, { timestamps: true });

export default mongoose.model("Booking", bookingSchema);

