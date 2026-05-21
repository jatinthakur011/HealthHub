import { Router } from "express";
import mongoose from "mongoose";
import Review from "../models/Review.js";
import Doctor from "../models/Doctor.js";

const router = Router();

const normalizeRating = (rating) => {
  const n = Number(rating);
  if (!Number.isFinite(n)) return null;
  const int = Math.floor(n);
  if (int < 1 || int > 5) return null;
  return int;
};

router.post("/", async (req, res) => {
  try {
    const {
      doctorId,
      patientId,
      patientName,
      patientEmail,
      rating,
      comment,
    } = req.body || {};

    if (!doctorId || !patientEmail) {
      return res
        .status(400)
        .json({ message: "doctorId and patientEmail are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ message: "Invalid doctorId" });
    }

    const normalizedRating = normalizeRating(rating);
    if (!normalizedRating) {
      return res.status(400).json({ message: "rating must be 1-5" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const requests = Array.isArray(doctor.requests) ? doctor.requests : [];
    const acceptedRequest = requests.find(
      (r) =>
        (r?.status || "").toLowerCase() === "accepted" &&
        (r?.email === patientEmail || r?.userid === patientEmail),
    );

    if (!acceptedRequest) {
      return res.status(403).json({
        message: "You can review only after appointment acceptance",
      });
    }

    const updated = await Review.findOneAndUpdate(
      { doctorId, patientEmail },
      {
        doctorId,
        doctorName: doctor.name,
        patientId: patientId || "",
        patientName: patientName || "",
        patientEmail,
        rating: normalizedRating,
        comment: comment || "",
      },
      { new: true, upsert: true },
    );

    return res.status(201).json(updated);
  } catch (e) {
    console.error("POST /api/reviews error:", e);
    return res.status(500).json({ message: "Failed to create review" });
  }
});

router.get("/doctor/:doctorId/summary", async (req, res) => {
  try {
    const { doctorId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ message: "Invalid doctorId" });
    }

    const reviews = await Review.find({ doctorId })
      .sort({ createdAt: -1 })
      .limit(10);

    const all = await Review.find({ doctorId });
    const reviewCount = all.length;
    const averageRating =
      reviewCount > 0
        ? all.reduce((sum, r) => sum + (r?.rating || 0), 0) /
          reviewCount
        : 0;

    return res.json({ reviewCount, averageRating, reviews });
  } catch (e) {
    console.error("GET summary error:", e);
    return res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

router.get("/doctor/:doctorId/patient", async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { patientEmail } = req.query || {};

    if (!patientEmail) {
      return res.status(400).json({ message: "patientEmail is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ message: "Invalid doctorId" });
    }

    const review = await Review.findOne({ doctorId, patientEmail });
    return res.json({ review: review || null });
  } catch (e) {
    console.error("GET patient review error:", e);
    return res.status(500).json({ message: "Failed to fetch review" });
  }
});

export default router;


