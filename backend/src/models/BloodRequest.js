import mongoose from 'mongoose'

const bloodRequestSchema = new mongoose.Schema(
  {
    patientName: { type: String, required: true },
    bloodGroup: { type: String, required: true },
    requiredUnits: { type: Number, required: true, min: 1 },
    receivedUnits: { type: Number, default: 0, min: 0 },
    hospital: { type: String, required: true },
    contact: { type: String, required: true },
    details: { type: String },
    donations: [
      {
        donorName: String,
        donorPhone: String,
        units: Number,
        bloodGroup: String,
        donatedAt: { type: Date, default: Date.now },
      },
    ],
    type: { type: String, enum: ['request', 'donation'], default: 'request' },
    status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
    user_id: { type: String },
    phone: { type: String },
    location: { type: String },
    lastDonation: { type: Date },
    notes: { type: String },
    name: { type: String },
    group: { type: String },
    phno: { type: String },
  },
  { timestamps: true }
)

export default mongoose.model('BloodRequest', bloodRequestSchema)



