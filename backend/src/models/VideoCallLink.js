import mongoose from 'mongoose'
import crypto from 'crypto'

const videoCallLinkSchema = new mongoose.Schema({
  doctor_id: { type: String, required: true },
  doctor_name: { type: String },
  patient_email: { type: String, required: true },
  patient_name: { type: String },
  token: { type: String, required: true, unique: true, index: true },
  status: { type: String, enum: ['pending', 'active', 'completed'], default: 'pending' },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  usedAt: { type: Date }
})

videoCallLinkSchema.statics.generateLink = function(doctor_id, doctor_name, patient_email, patient_name, durationMinutes = 30) {
  const token = crypto.randomBytes(16).toString('hex')
  const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000)
  return {
    token,
    expiresAt,
    doctor_id,
    doctor_name,
    patient_email,
    patient_name,
    status: 'pending'
  }
}

videoCallLinkSchema.methods.isValid = function() {
  return this.expiresAt > new Date() && this.status !== 'completed'
}

export default mongoose.model('VideoCallLink', videoCallLinkSchema)

