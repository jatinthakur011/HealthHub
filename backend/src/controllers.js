import Doctor from "./models/Doctor.js";
import Booking from "./models/bookings.js";

export const getCurrentDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user.id).lean();
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    const requests = await Booking.find({ doctorId: doctor._id })
      .populate("patientId", "name email")
      .sort({ createdAt: -1 });

    res.json({ ...doctor, requests });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
import Doctor from "./models/Doctor.js";
import Booking from "./models/bookings.js";

export const getCurrentDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user.id).lean();
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    const requests = await Booking.find({ doctorId: doctor._id })
      .populate("patientId", "name email")
      .sort({ createdAt: -1 });

    res.json({ ...doctor, requests });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

